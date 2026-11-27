'use server';

import { revalidatePath } from 'next/cache';
import { session } from '@/lib/session';
import { estAdmin } from '@/lib/access';

// Rend un module gratuit (ou le repasse en payant). Réservé à l'admin.
export async function basculerGratuit(formData: FormData) {
  const { supabase, profil } = await session();
  if (!estAdmin(profil)) throw new Error('Action réservée à l’administrateur');

  const id = Number(formData.get('id'));
  const valeur = formData.get('gratuit') === 'true';
  if (!Number.isInteger(id) || id <= 0) return;

  const { error } = await supabase
    .from('modules')
    .update({ gratuit: valeur })
    .eq('id', id);

  if (error) throw new Error(`Mise à jour impossible : ${error.message}`);
  revalidatePath('/espace/admin');
  revalidatePath('/espace/formations', 'layout');
}
