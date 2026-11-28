'use server';

import { revalidatePath } from 'next/cache';
import { session } from '@/lib/session';
import { peutAcceder } from '@/lib/access';

export async function repondreCommentaire(formData: FormData) {
  const { supabase, user, profil } = await session();
  if (!user || !peutAcceder(profil)) return;

  const module = Number(formData.get('module'));
  const parent = Number(formData.get('parent'));
  const cours = String(formData.get('cours') || '');
  const contenu = String(formData.get('contenu') || '').trim().slice(0, 1000);
  if (!module || !parent || !contenu) return;

  await supabase.from('commentaires_module').insert({
    module_id: module,
    user_id: user.id,
    contenu,
    parent_id: parent,
  });

  revalidatePath(`/espace/formations/${cours}`);
}

export async function basculerLike(formData: FormData) {
  const { supabase, user, profil } = await session();
  if (!user || !peutAcceder(profil)) return;

  const comment = Number(formData.get('comment'));
  const cours = String(formData.get('cours') || '');
  if (!comment) return;

  const { data: existant } = await supabase
    .from('comment_likes')
    .select('comment_id')
    .match({ comment_id: comment, user_id: user.id })
    .maybeSingle();

  if (existant) {
    await supabase.from('comment_likes').delete().match({ comment_id: comment, user_id: user.id });
  } else {
    await supabase.from('comment_likes').insert({ comment_id: comment, user_id: user.id });
  }

  revalidatePath(`/espace/formations/${cours}`);
}
