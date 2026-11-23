'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || '';

export async function seConnecter(formData: FormData) {
  const supabase = createClient();
  const email = txt(formData, 'email');
  const { error } = await supabase.auth.signInWithPassword({ email, password: txt(formData, 'motdepasse') });
  if (error) {
    if (/confirm/i.test(error.message)) redirect('/connexion?info=confirme');
    redirect('/connexion?erreur=identifiants');
  }
  redirect('/espace');
}

export async function creerCompte(formData: FormData) {
  const supabase = createClient();
  const email = txt(formData, 'email');
  const password = txt(formData, 'motdepasse');
  if (password.length < 8) redirect('/connexion?onglet=inscription&erreur=motdepasse');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: txt(formData, 'nom') || 'Membre' } },
  });
  if (error) redirect('/connexion?onglet=inscription&erreur=inscription');
  // Si la confirmation par email est désactivée dans Supabase, l'utilisateur est déjà connecté.
  if (data?.session) redirect('/espace');
  redirect('/connexion?info=confirme');
}

export async function verifierCode(formData: FormData) {
  const supabase = createClient();
  const email = txt(formData, 'email');
  const token = txt(formData, 'code').replace(/\s/g, '');
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) redirect(`/connexion/verifier?email=${encodeURIComponent(email)}&erreur=code`);
  redirect('/espace');
}

export async function renvoyerCode(formData: FormData) {
  const supabase = createClient();
  const email = txt(formData, 'email');
  await supabase.auth.resend({ type: 'signup', email });
  redirect(`/connexion/verifier?email=${encodeURIComponent(email)}&info=renvoye`);
}

export async function demanderReinitialisation(formData: FormData) {
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(txt(formData, 'email'), {
    redirectTo: `${siteUrl()}/auth/callback?next=/connexion/nouveau-mot-de-passe`,
  });
  redirect('/connexion/mot-de-passe-oublie?envoye=1');
}

export async function nouveauMotDePasse(formData: FormData) {
  const supabase = createClient();
  const password = txt(formData, 'motdepasse');
  if (password.length < 8) redirect('/connexion/nouveau-mot-de-passe?erreur=court');
  if (password !== txt(formData, 'confirmation')) redirect('/connexion/nouveau-mot-de-passe?erreur=different');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect('/connexion/nouveau-mot-de-passe?erreur=echec');
  redirect('/espace');
}
