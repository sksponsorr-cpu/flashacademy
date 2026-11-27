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

  // Notre identifiant (fa-…) et la référence FlashPay (FP-…).
  const monId: string | undefined = evenement?.data?.transaction_id;
  const refFlashpay: string | undefined = evenement?.data?.flashpay_transaction_id;
  if (!monId || !refFlashpay) {
    console.error('webhook flashpay : identifiants manquants', monId, refFlashpay);
    return new NextResponse('Identifiants manquants', { status: 400 });
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  // On garde la référence FlashPay pour pouvoir vérifier le statut plus tard.
  const { error: refError } = await db
    .from('paiements')
    .update({ flashpay_ref: refFlashpay })
    .eq('transaction_id', monId);
  if (refError) {
    console.error('webhook flashpay : enregistrement de la référence échoué', refError, monId);
    return new NextResponse('Réessayer plus tard', { status: 500 });
  }

  // Vérification auprès de FlashPay avec SA référence (FP-…).
  let statut: string;
  try {
    statut = await statutCollecte(refFlashpay);
  } catch (e) {
    console.error('webhook flashpay : statut indisponible', e, refFlashpay);
    return new NextResponse('Réessayer plus tard', { status: 500 });
  }

  if (statut !== 'successful') {
    console.warn('webhook flashpay : statut non réussi', statut, monId);
    return new NextResponse('ok', { status: 200 });
  }

  // activer_acces est idempotente. En cas d'échec, on répond 500 pour que FlashPay renvoie la notification.
  const { error: activationError } = await db.rpc('activer_acces', { p_tx: monId });
  if (activationError) {
    console.error('webhook flashpay : activation échouée', activationError, monId);
    return new NextResponse('Activation échouée', { status: 500 });
  }

  console.log('webhook flashpay : accès activé', monId);
  return new NextResponse('ok', { status: 200 });
}
