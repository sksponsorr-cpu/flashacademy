'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { session } from '@/lib/session';
import { creerCollecte, statutCollecte } from '@/lib/flasshpay';

// Client avec la clé de service : utilisé uniquement côté serveur pour écrire les paiements.
const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

// Lance le paiement d'une offre et redirige le membre vers la page flasshpay.
export async function payerOffre(formData: FormData) {
  const { user } = await session();
  if (!user) redirect('/connexion');

  const offreId = Number(formData.get('offre'));
  const pays = String(formData.get('pays') || 'CM').toUpperCase();
  const { data: offre } = await db().from('offers').select('id,name,price').eq('id', offreId).maybeSingle();
  if (!offre) redirect('/espace/offres?erreur=offre');

  const tx = `fa-${user.id.slice(0, 8)}-${offre.id}-${Date.now()}`;
  const { error } = await db().from('paiements').insert({
    user_id: user.id,
    offre_id: offre.id,
    montant: offre.price,
    pays,
    transaction_id: tx,
  });
  if (error) redirect('/espace/offres?erreur=enregistrement');

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  let url = '';
  try {
    const c = await creerCollecte({
      country_code: pays,
      amount: offre.price,
      transaction_id: tx,
      description: `FlashAcademy : ${offre.name}`,
      callback_url: `${site}/espace/paiement/succes?tx=${tx}`,
      failed_callback_url: `${site}/espace/paiement/echec`,
    });
    url = c.checkout_url;
  } catch (e) {
    console.error('payerOffre', e);
    redirect('/espace/offres?erreur=paiement');
  }
  redirect(url);
}

// Vérifie auprès de flasshpay le statut d'un paiement, puis active l'accès si c'est réussi.
export async function confirmerPaiement(tx: string): Promise<'ok' | 'attente' | 'echec'> {
  const { user } = await session();
  if (!user) return 'echec';

  const { data: p } = await db().from('paiements').select('user_id,status').eq('transaction_id', tx).maybeSingle();
  if (!p || p.user_id !== user.id) return 'echec';
  if (p.status === 'paid') return 'ok';

  let statut: string;
  try {
    statut = await statutCollecte(tx);
  } catch (e) {
    console.error('confirmerPaiement', e);
    return 'attente';
  }

  if (statut === 'successful') {
    await db().rpc('activer_acces', { p_tx: tx });
    return 'ok';
  }
  if (['failed', 'cancelled', 'expired'].includes(statut)) {
    await db().from('paiements').update({ status: statut }).eq('transaction_id', tx);
    return 'echec';
  }
  return 'attente';
}
