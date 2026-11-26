'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { session } from '@/lib/session';
import { creerCollecte, statutCollecte } from '@/lib/flasshpay';

const db = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Configuration Supabase manquante');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
};

// Taux indicatifs : nombre d'unités locales pour 1 FCFA.
const TAUX: Record<string, { devise: string; taux: number }> = {
  CM: { devise: 'XAF', taux: 1 },
  CG: { devise: 'XAF', taux: 1 },
  GA: { devise: 'XAF', taux: 1 },

  CI: { devise: 'XOF', taux: 1 },
  SN: { devise: 'XOF', taux: 1 },
  BJ: { devise: 'XOF', taux: 1 },
  TG: { devise: 'XOF', taux: 1 },
  BF: { devise: 'XOF', taux: 1 },
  ML: { devise: 'XOF', taux: 1 },

  CD: { devise: 'CDF', taux: 3.78 },
  GH: { devise: 'GHS', taux: 0.01975 },
  NG: { devise: 'NGN', taux: 2.32 },
  SL: { devise: 'SLE', taux: 0.0378 },
  TZ: { devise: 'TZS', taux: 4.46 },
  UG: { devise: 'UGX', taux: 6.54 },
  GM: { devise: 'GMD', taux: 0.122 },
  RW: { devise: 'RWF', taux: 2.46 },
  GN: { devise: 'GNF', taux: 14.74 },
};

export async function payerOffre(formData: FormData) {
  const { user, supabase } = await session();

  if (!user) redirect('/connexion');

  const nom = String(formData.get('nom') || '').trim();
  const mobile = String(formData.get('mobile') || '').trim();
  const pays = String(formData.get('pays') || 'CM').toUpperCase();
  const offreId = Number(formData.get('offre'));

  // L'e-mail est récupéré automatiquement.
  const email = user.email;

  if (!email || !nom || nom.length < 2 || !mobile) {
    redirect('/espace/offres?erreur=identite');
  }

  if (!TAUX[pays]) {
    redirect('/espace/offres?erreur=pays');
  }

  if (!Number.isInteger(offreId) || offreId <= 0) {
    redirect('/espace/offres?erreur=offre');
  }

  const variables = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FLASHPAY_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];

  if (variables.some((v) => !process.env[v])) {
    redirect('/espace/offres?erreur=config');
  }

  const { data: offre, error: offreError } = await supabase
    .from('offers')
    .select('id,name,price')
    .eq('id', offreId)
    .maybeSingle();

  if (offreError || !offre) {
    console.error('Offre introuvable:', offreError);
    redirect('/espace/offres?erreur=offre');
  }

  const prixFCFA = Number(offre.price);

  if (!Number.isFinite(prixFCFA) || prixFCFA <= 0) {
    redirect('/espace/offres?erreur=montant');
  }

  // Conversion automatique.
  const conversion = TAUX[pays];
  const montantLocal = Math.round(prixFCFA * conversion.taux);

  const tx = `fa-${user.id.slice(0, 8)}-${offre.id}-${Date.now()}`;

  // Enregistrement du prix original en FCFA.
  const { error: insertError } = await db()
    .from('paiements')
    .insert({
      user_id: user.id,
      offre_id: offre.id,
      montant: prixFCFA,
      pays,
      transaction_id: tx,
    });

  if (insertError) {
    console.error('Erreur enregistrement paiement:', insertError);
    redirect('/espace/offres?erreur=enregistrement');
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, '');

  try {
    const collecte = await creerCollecte({
      country_code: pays,
      amount: montantLocal,
      transaction_id: tx,
      name: nom,
      mobile,
      description: `FlashAcademy - ${offre.name}`,
      callback_url: `${site}/espace/paiement/succes?tx=${encodeURIComponent(tx)}`,
      failed_callback_url: `${site}/espace/paiement/echec`,
    });

    if (!collecte.checkout_url) {
      throw new Error('Lien de paiement absent');
    }

    redirect(collecte.checkout_url);

  } catch (error: any) {
    if (
      error?.digest &&
      String(error.digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    console.error('Erreur FlashPay:', error);

    redirect('/espace/offres?erreur=paiement');
  }
}

export async function confirmerPaiement(
  tx: string
): Promise<'ok' | 'attente' | 'echec'> {

  const { user } = await session();

  if (!user) return 'echec';

  const { data: paiement, error } = await db()
    .from('paiements')
    .select('user_id,status')
    .eq('transaction_id', tx)
    .maybeSingle();

  if (error || !paiement || paiement.user_id !== user.id) {
    return 'echec';
  }

  if (paiement.status === 'paid') return 'ok';

  let statut: string;

  try {
    statut = await statutCollecte(tx);
  } catch (error) {
    console.error('Vérification FlashPay:', error);
    return 'attente';
  }

  if (statut === 'successful') {
    const { error: activationError } = await db().rpc(
      'activer_acces',
      { p_tx: tx }
    );

    if (activationError) {
      console.error('Erreur activation:', activationError);
      return 'attente';
    }

    return 'ok';
  }

  if (['failed', 'cancelled', 'expired'].includes(statut)) {
    await db()
      .from('paiements')
      .update({ status: statut })
      .eq('transaction_id', tx);

    return 'echec';
  }

  return 'attente';
}
