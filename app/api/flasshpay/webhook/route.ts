import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { statutCollecte } from '@/lib/flasshpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Reçoit les notifications de flasshpay.
// 1) vérifie la signature avec le secret du webhook, 2) relit le statut auprès de flasshpay,
// 3) active l'accès seulement si le paiement est confirmé.
export async function POST(req: Request) {
  const secret = process.env.FLASSHPAY_WEBHOOK_SECRET;
  if (!secret) return new NextResponse('Configuration manquante', { status: 500 });

  const brut = await req.text();
  const attendue = createHmac('sha512', secret).update(brut).digest('hex');
  const recue = req.headers.get('x-flashpay-signature') || '';
  const valide =
    recue.length === attendue.length &&
    timingSafeEqual(Buffer.from(recue), Buffer.from(attendue));
  if (!valide) return new NextResponse('Signature invalide', { status: 401 });

  let evenement: any;
  try {
    evenement = JSON.parse(brut);
  } catch {
    return new NextResponse('JSON invalide', { status: 400 });
  }

  const tx: string | undefined = evenement?.data?.transaction_id || evenement?.transaction_id;
  if (!tx) return new NextResponse('ok', { status: 200 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  let statut: string;
  try {
    statut = await statutCollecte(tx);
  } catch (e) {
    console.error('webhook flasshpay : statut indisponible', e);
    // 500 : flasshpay réessaiera la notification plus tard
    return new NextResponse('Réessayer plus tard', { status: 500 });
  }

  if (statut === 'successful') {
    await db.rpc('activer_acces', { p_tx: tx });
  } else if (['failed', 'cancelled', 'expired'].includes(statut)) {
    await db.from('paiements').update({ status: statut }).eq('transaction_id', tx);
  }
  return new NextResponse('ok', { status: 200 });
}
