import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Retourne la connexion, la personne connectée et son profil.
// Redirige vers la page de connexion si personne n'est connecté.
export async function session() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');
  let { data: profil } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profil) {
    // Compte créé sans ligne de profil : on la crée pour que la page profil existe.
    await supabase.from('profiles').upsert(
      { id: user.id, name: (user.user_metadata?.name as string) || 'Membre' },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    ({ data: profil } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle());
  }
  return { supabase, user, profil: profil as any };
}
