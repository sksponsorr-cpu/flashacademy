'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { session } from '@/lib/session';
import { creerCollecte, statutCollecte } from '@/lib/flasshpay';

// Client Supabase réservé au serveur.
const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
    }
  );

// Lance le paiement d'une offre.
export async function payerOffre(formData: FormData) {
  const { user, supabase } = await session();

  if (!user) redirect('/connexion');

  // L'adresse e-mail provient du compte connecté.
  const email = user.email;

  if (!email) {
    console.error('payerOffre : adresse e-mail absente du compte connecté.');
    redirect('/espace/offres?erreur=email');
  }

  // Informations saisies par le payeur.
  const nom = String(formData.get('nom') || '').trim();
  const mobile = String(formData.get('mobile') || '').trim();
  const pays = String(formData.get('pays') || '').trim().toUpperCase();
  const offreId = Number(formData.get('offre'));

  if (!nom || !mobile) {
    redirect('/espace/offres?erreur=identite');
  }

  if (!pays || !/^[A-Z]{2}$/.test(pays)) {
    redirect('/espace/offres?erreur=pays');
  }

  if (!Number.isInteger(offreId) || offreId <= 0) {
    redirect('/espace/offres?erreur=offre');
  }

  // Vérification des variables serveur.
  const requises = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FLASHPAY_KEY',
    'NEXT_PUBLIC_SITE_URL',
  ];

  const manquantes = requises.filter((k) => !process.env[k]);

  if (manquantes.length) {
    console.error(
      'payerOffre : variables serveur manquantes :',
      manquantes.join(', ')
    );
    redirect('/espace/offres?erreur=config');
  }

  // Vérifie que l'offre existe.
  const { data: offre, error: erreurOffre } = await supabase
    .from('offers')
    .select('id,name,price')
    .eq('id', offreId)
    .maybeSingle();

  if (erreurOffre || !offre) {
    console.error('payerOffre : offre introuvable', {
      offreId,
      erreur: erreurOffre?.message,
    });
    redirect('/espace/offres?erreur=offre');
  }

  if (!Number.isFinite(Number(offre.price)) || Number(offre.price) <= 0) {
    console.error('payerOffre : montant invalide', offre.price);
    redirect('/espace/offres?erreur=montant');
  }

  // Identifiant unique de transaction.
  const tx = `fa-${user.id.slice(0, 8)}-${offre.id}-${Date.now()}`;

  // Enregistre le paiement en attente.
  const { error: erreurEnregistrement } = await db()
    .from('paiements')
    .insert({
      user_id: user.id,
      offre_id: offre.id,
      montant: offre.price,
      pays,
      transaction_id: tx,
    });

  if (erreurEnregistrement) {
    console.error(
      'payerOffre : enregistrement impossible',
      erreurEnregistrement.message
    );
    redirect('/espace/offres?erreur=enregistrement');
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, '');

  try {
    const collecte = await creerCollecte({
      country_code: pays,
      amount: Number(offre.price),
      transaction_id: tx,
      description: `FlashAcademy : ${offre.name}`,
      name: nom,
      mobile,
      callback_url: `${site}/espace/paiement/succes?tx=${encodeURIComponent(tx)}`,
      failed_callback_url: `${site}/espace/paiement/echec`,
    });

    if (!collecte?.checkout_url) {
      throw new Error('FlasshPay n’a pas retourné de lien de paiement.');
    }

    redirect(collecte.checkout_url);
  } catch (e) {
    // Next.js utilise redirect() en lançant une exception spéciale.
    // On ne doit donc pas intercepter cette redirection.
    if (
      typeof e === 'object' &&
      e !== null &&
      'digest' in e &&
      String((e as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw e;
    }

    console.error('payerOffre : erreur FlasshPay', e);
    redirect('/espace/offres?erreur=paiement');
  }
}

// Vérifie le statut du paiement et active l'accès uniquement
// lorsque FlasshPay confirme le statut successful.
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

  if (paiement.status === 'paid') {
    return 'ok';
  }

  let statut: string;

  try {
    statut = await statutCollecte(tx);
  } catch (e) {
    console.error('confirmerPaiement : vérification impossible', e);
    return 'attente';
  }

  if (statut === 'successful') {
    const { error: erreurActivation } = await db().rpc(
      'activer_acces',
      { p_tx: tx }
    );

    if (erreurActivation) {
      console.error(
        'confirmerPaiement : activation impossible',
        erreurActivation.message
      );
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
