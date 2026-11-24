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
const REPONSE_SECOURS =
  "Je ne peux pas répondre pour le moment. Réessayez dans quelques minutes, ou écrivez directement à l'équipe.";

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

const messageErreur = (e: unknown) => (e instanceof Error ? e.message : 'Erreur inattendue');

// ---------- Administrateur ----------
export async function ajouterConsigne(formData: FormData) {
  let erreur = '';
  try {
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
      if (error) throw new Error('Envoi du fichier impossible : ' + error.message);
      if (mime === 'application/pdf' || mime.startsWith('audio/') || mime.startsWith('video/')) {
        const url = await lienTemporaire(supabase, chemin);
        contenu = await transcrire(mime === 'application/pdf' ? CONSIGNE_PDF : CONSIGNE_AUDIO, mime, url);
      }
    }

    const { error } = await supabase
      .from('ami_consignes')
      .insert({ type, titre, contenu, fichier: chemin, mime });
    if (error) throw new Error('Enregistrement impossible : ' + error.message);
  } catch (e) {
    console.error('ajouterConsigne', e);
    erreur = messageErreur(e);
  }
  revalidatePath('/espace/ami/admin');
  redirect(erreur ? `/espace/ami/admin?erreur=${encodeURIComponent(erreur)}` : '/espace/ami/admin?ok=1');
}

export async function supprimerConsigne(formData: FormData) {
  let erreur = '';
  try {
    const { supabase } = await admin();
    const id = txt(formData, 'id');
    const { data: c } = await supabase.from('ami_consignes').select('fichier').eq('id', id).maybeSingle();
    if (c?.fichier) await supabase.storage.from(BUCKET).remove([c.fichier]);
    const { error } = await supabase.from('ami_consignes').delete().eq('id', id);
    if (error) throw new Error('Suppression impossible : ' + error.message);
  } catch (e) {
    console.error('supprimerConsigne', e);
    erreur = messageErreur(e);
  }
  revalidatePath('/espace/ami/admin');
  redirect(erreur ? `/espace/ami/admin?erreur=${encodeURIComponent(erreur)}` : '/espace/ami/admin?ok=1');
}

// ---------- Membres ----------
export async function demanderAmi(formData: FormData) {
  const { supabase, user, profil } = await session();
  if (!peutAcceder(profil)) redirect('/espace/offres');

  let question = txt(formData, 'question');
  const video = formData.get('video') as File | null;

  // 1) Vidéo jointe : on la transcrit et on l'ajoute à la question
  try {
    if (video && video.size > 0) {
      const mime = video.type || 'video/mp4';
      const chemin = `${user.id}/${Date.now()}-${video.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error } = await supabase.storage.from(BUCKET).upload(chemin, video, { contentType: mime });
      if (error) throw new Error('Envoi de la vidéo impossible : ' + error.message);
      const url = await lienTemporaire(supabase, chemin);
      const transcription = await transcrire(CONSIGNE_AUDIO, mime, url);
      question = [question, `[Vidéo transcrite] ${transcription}`].filter(Boolean).join('\n');
    }
  } catch (e) {
    console.error('demanderAmi/video', e);
    redirect(`/espace/ami?erreur=${encodeURIComponent(messageErreur(e))}`);
  }

  if (!question) redirect('/espace/ami');

  // 2) Historique et consignes lus avant d'ajouter le nouveau message
  const { data: historique } = await supabase
    .from('ami_messages').select('role,contenu').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(10);
  const { data: consignes } = await supabase
    .from('ami_consignes').select('titre,contenu').order('created_at', { ascending: false }).limit(30);

  // 3) Enregistrer le message du membre
  const { error: errMsg } = await supabase
    .from('ami_messages').insert({ user_id: user.id, role: 'user', contenu: question });
  if (errMsg) redirect(`/espace/ami?erreur=${encodeURIComponent('Message non enregistré : ' + errMsg.message)}`);

  // 4) Réponse de l'IA. En cas d'échec, on enregistre une réponse de secours au lieu de planter.
  let reponse = REPONSE_SECOURS;
  try {
    reponse = await repondreAmi(question, consignes || [], (historique || []).reverse());
    if (!reponse) reponse = REPONSE_SECOURS;
  } catch (e) {
    console.error('demanderAmi/ia', e);
  }
  await supabase.from('ami_messages').insert({ user_id: user.id, role: 'assistant', contenu: reponse });
  revalidatePath('/espace/ami');
  redirect('/espace/ami');
}
