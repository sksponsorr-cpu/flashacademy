'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { session } from '@/lib/session';
import { estAdmin } from '@/lib/access';

const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

// Donne un abonnement à un membre sans paiement en ligne (ex. paiement reçu hors plateforme).
export async function accorderAccesManuel(formData: FormData) {
  const { profil } = await session();
  if (!estAdmin(profil)) throw new Error('Réservé à l’administrateur');

  const cible = String(formData.get('cible') || '').trim();
  const offreId = Number(formData.get('offre'));
  if (!cible || !Number.isInteger(offreId) || offreId <= 0) throw new Error('Champs manquants');

  const admin = db();
  let userId = cible;

  if (cible.includes('@')) {
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const u = data?.users.find((x) => x.email?.toLowerCase() === cible.toLowerCase());
    if (!u) throw new Error('Aucun compte avec cet e-mail');
    userId = u.id;
  }

  const { data: offre } = await admin.from('offers').select('id,price').eq('id', offreId).maybeSingle();
  if (!offre) throw new Error('Offre introuvable');

  const { error: e1 } = await admin.from('profiles').update({ sub: true }).eq('id', userId);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await admin.from('paiements').insert({
    user_id: userId,
    offre_id: offreId,
    montant: offre.price,
    pays: 'MANUEL',
    transaction_id: `MANUEL-${Date.now()}`,
    flashpay_ref: 'manuel',
  });
  if (e2) throw new Error(e2.message);

  revalidatePath('/espace/admin');
  revalidatePath('/espace/transactions');
}
