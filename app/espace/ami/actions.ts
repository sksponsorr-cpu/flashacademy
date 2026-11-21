'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { session } from '@/lib/session';
import { estAdmin, peutAcceder } from '@/lib/access';
import { transcrire, repondreAmi } from '@/lib/ia';

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const BUCKET = 'agence-ami';
const CONSIGNE_AUDIO = 'Transcris fidèlement ce contenu en français. Donne uniquement la transcription, sans commentaire.';
const CONSIGNE_PDF = 'Extrais le texte complet de ce document en français, en gardant les titres et les listes. Donne uniquement le texte.';

async function admin() {
  const s = await session();
  if (!estAdmin(s.profil)) throw new Error("Réservé à l'administrateur");
  return s;
}

async function lienTemporaire(supabase: any, chemin: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(chemin, 600);
  if (error || !data) throw new Error('Lien du fichier introuvable');
  return data.signedUrl as string;
}

// ---------- Administrateur ----------
export async function ajouterConsigne(formData: FormData) {
  const { supabase } = await admin();
  const type = txt(formData, 'type') || 'texte';
  const titre = txt(formData, 'titre') || 'Sans titre';
  let contenu = txt(formData, 'contenu');
  let chemin = '';
  let mime = '';
  const fichier = formData.get('fichier') as File | null;

  if (fichier && fichier.size > 0) {
    mime = fichier.type || 'application/octet-stream';
    chemin = `consignes/${Date.now()}-${fichier.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET).upload(chemin, fichier, { contentType: mime });
    if (error) throw new Error('Envoi impossible : ' + error.message);
    const url = await lienTemporaire(supabase, chemin);
    if (mime === 'application/pdf') contenu = await transcrire(CONSIGNE_PDF, mime, url);
    else if (mime.startsWith('audio/') || mime.startsWith('video/')) contenu = await transcrire(CONSIGNE_AUDIO, mime, url);
  }

  await supabase.from('ami_consignes').insert({ type, titre, contenu, fichier: chemin, mime });
  revalidatePath('/espace/ami/admin');
}

export async function supprimerConsigne(formData: FormData) {
  const { supabase } = await admin();
  const id = txt(formData, 'id');
  const { data: c } = await supabase.from('ami_consignes').select('fichier').eq('id', id).maybeSingle();
  if (c?.fichier) await supabase.storage.from(BUCKET).remove([c.fichier]);
  await supabase.from('ami_consignes').delete().eq('id', id);
  revalidatePath('/espace/ami/admin');
}

// ---------- Membres ----------
export async function demanderAmi(formData: FormData) {
  const { supabase, user, profil } = await session();
  if (!peutAcceder(profil)) redirect('/espace/offres');

  let question = txt(formData, 'question');
  const video = formData.get('video') as File | null;

  // Si une vidéo est jointe, on la transcrit et on l'ajoute à la question
  if (video && video.size > 0) {
    const mime = video.type || 'video/mp4';
    const chemin = `${user.id}/${Date.now()}-${video.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET).upload(chemin, video, { contentType: mime });
    if (error) throw new Error('Envoi de la vidéo impossible : ' + error.message);
    const url = await lienTemporaire(supabase, chemin);
    const transcription = await transcrire(CONSIGNE_AUDIO, mime, url);
    question = [question, `[Vidéo transcrite] ${transcription}`].filter(Boolean).join('\n');
  }
  if (!question) return;

  // Historique et consignes lus AVANT d'ajouter le nouveau message
  const { data: historique } = await supabase
    .from('ami_messages').select('role,contenu').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(10);
  const { data: consignes } = await supabase
    .from('ami_consignes').select('titre,contenu').order('created_at', { ascending: false }).limit(30);

  await supabase.from('ami_messages').insert({ user_id: user.id, role: 'user', contenu: question });
  const reponse = await repondreAmi(question, consignes || [], (historique || []).reverse());
  await supabase.from('ami_messages').insert({ user_id: user.id, role: 'assistant', contenu: reponse });
  revalidatePath('/espace/ami');
                                              }
