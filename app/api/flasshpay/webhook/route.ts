import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { statutCollecte } from '@/lib/flasshpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vérifie la signature flasshpay : HMAC-SHA256 de "timestamp.corps brut", avec le secret du webhook.
function signatureValide(brut: string, timestamp: string, signature: string, secret: string): boolean {
  if (!timestamp || !signature) return false;
  // Rejette les envois trop anciens (protection contre le rejeu, 5 minutes)
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const attendue = createHmac('sha256', secret).update(`${timestamp}.${brut}`).digest('hex');
  return attendue.length === signature.length && timingSafeEqual(Buffer.from(attendue), Buffer.from(signature));
}

export async function POST(req: Request) {
  const secret = process.env.FLASSHPAY_WEBHOOK_SECRET;
  if (!secret) return new NextResponse('Configuration manquante', { status: 500 });

  const brut = await req.text();
  const timestamp = req.headers.get('x-flashpay-timestamp') || '';
  const signature = req.headers.get('x-flashpay-signature') || '';
  if (!signatureValide(brut, timestamp, signature, secret)) {
    return new NextResponse('Signature invalide', { status: 401 });
  }

  let evenement: any;
  try {
    evenement = JSON.parse(brut);
  } catch {
    return new NextResponse('JSON invalide', { status: 400 });
  }

  // On ne traite que les paiements réussis ; les autres événements sont simplement acquittés.
  if (evenement?.event !== 'transaction.successful') return new NextResponse('ok', { status: 200 });
  const tx: string | undefined = evenement?.data?.transaction_id;
  if (!tx) return new NextResponse('ok', { status: 200 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  // Vérification complémentaire : on relit le statut auprès de flasshpay avant de livrer.
  let statut: string;
  try {
    statut = await statutCollecte(tx);
  } catch (e) {
    console.error('webhook flasshpay : statut indisponible', e);
    return new NextResponse('Réessayer plus tard', { status: 500 });
  }

  // Traitement idempotent : activer_acces peut être appelée plusieurs fois sans effet secondaire.
  if (statut === 'successful') {
    await db.rpc('activer_acces', { p_tx: tx });
  }
  return new NextResponse('ok', { status: 200 });
}
