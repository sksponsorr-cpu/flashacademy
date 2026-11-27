import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { statutCollecte } from '@/lib/flasshpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function signatureValide(brut: string, timestamp: string, signature: string, secret: string) {
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const attendue = createHmac('sha256', secret).update(`${timestamp}.${brut}`).digest('hex');
  return attendue.length === signature.length &&
    timingSafeEqual(Buffer.from(attendue), Buffer.from(signature));
}

export async function POST(req: Request) {
  const secret = process.env.FLASHPAY_WEBHOOK_SECRET;
  if (!secret) return new NextResponse('Configuration manquante', { status: 500 });

  const brut = await req.text();
  const ts = req.headers.get('x-flashpay-timestamp') || '';
  const sig = req.headers.get('x-flashpay-signature') || '';
  if (!signatureValide(brut, ts, sig, secret)) {
    return new NextResponse('Signature invalide', { status: 401 });
  }

  const evenement = JSON.parse(brut);
  if (evenement?.event !== 'transaction.successful') return new NextResponse('ok', { status: 200 });

  // Notre identifiant (fa-…) et la référence FlashPay (FP-…), envoyés tous les deux.
  const monId: string | undefined = evenement?.data?.transaction_id;
  const refFlashpay: string | undefined = evenement?.data?.flashpay_transaction_id;
  if (!monId || !refFlashpay) return new NextResponse('ok', { status: 200 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  // On garde la référence FlashPay dans notre table, pour pouvoir vérifier le statut plus tard.
  await db.from('paiements').update({ flashpay_ref: refFlashpay }).eq('transaction_id', monId);

  // Vérification auprès de FlashPay avec SA référence (FP-…).
  let statut: string;
  try {
    statut = await statutCollecte(refFlashpay);
  } catch (e) {
    console.error('webhook flashpay : statut indisponible', e);
    return new NextResponse('Réessayer plus tard', { status: 500 });
  }

  if (statut === 'successful') {
    // activer_acces doit être idempotente : elle peut être appelée plusieurs fois.
    await db.rpc('activer_acces', { p_tx: monId });
  }
  return new NextResponse('ok', { status: 200 });
}
