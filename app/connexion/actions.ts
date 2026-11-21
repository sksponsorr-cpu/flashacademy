'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export async function seConnecter(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: txt(formData, 'email'),
    password: txt(formData, 'motdepasse'),
  });
  if (error) redirect('/connexion?erreur=identifiants');
  redirect('/espace');
}

export async function creerCompte(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: txt(formData, 'email'),
    password: txt(formData, 'motdepasse'),
  });
  if (error) redirect('/connexion?erreur=inscription');
  redirect('/espace');
}
