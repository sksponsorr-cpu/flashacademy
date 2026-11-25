'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { session } from '@/lib/session';
import { estAdmin, estPartenaire, lignes } from '@/lib/access';

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const aAcces = (p: any) => !!p && (p.sub || p.role === 'admin');

// ---------- Actualités, récits, profil ----------
export async function publierPublication(formData: FormData) {
  const { supabase, user } = await session();
  const contenu = txt(formData, 'contenu');
  if (contenu) await supabase.from('posts').insert({ author_id: user.id, content: contenu });
  revalidatePath('/espace');
}

export async function publierRecit(formData: FormData) {
  const { supabase, user } = await session();
  const contenu = txt(formData, 'contenu');
  if (contenu) await supabase.from('stories').insert({ author_id: user.id, content: contenu });
  revalidatePath('/espace', 'layout');
}

export async function sauverProfil(formData: FormData) {
  const { supabase, user, profil } = await session();
  let photo = profil?.photo || '';
  const fichier = formData.get('photo') as File | null;
  if (fichier && fichier.size > 0) {
    const chemin = `${user.id}/${Date.now()}-${fichier.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { error } = await supabase.storage.from('photos').upload(chemin, fichier, { upsert: true });
    if (!error) photo = supabase.storage.from('photos').getPublicUrl(chemin).data.publicUrl;
  }
  await supabase
    .from('profiles')
    .update({
      name: txt(formData, 'name') || 'Membre',
      head: txt(formData, 'head'),
      bio: txt(formData, 'bio'),
      link: txt(formData, 'link'),
      photo,
      validated: true,
    })
    .eq('id', user.id);
  revalidatePath('/espace', 'layout');
}

// ---------- Messages ----------
export async function envoyerMessage(formData: FormData) {
  const { supabase, user, profil } = await session();
  const avec = txt(formData, 'avec');
  const contenu = txt(formData, 'contenu');
  if (!contenu || !avec) return;
  if (!aAcces(profil)) redirect('/espace/offres');
  await supabase.from('messages').insert({ sender_id: user.id, receiver_id: avec, content: contenu });
  revalidatePath('/espace/messages');
}

// ---------- Recettes ----------
export async function publierRecette(formData: FormData) {
  const { supabase, user, profil } = await session();
  if (!aAcces(profil)) redirect('/espace/offres');
  const titre = txt(formData, 'titre');
  if (!titre) return;
  await supabase.from('recipes').insert({
    author_id: user.id,
    title: titre,
    time: txt(formData, 'temps'),
    ingredients: txt(formData, 'ingredients'),
    steps: txt(formData, 'etapes'),
  });
  revalidatePath('/espace/recettes');
}

// ---------- Formations ----------
export async function marquerModule(formData: FormData) {
  const { supabase, user, profil } = await session();
  const moduleId = Number(txt(formData, 'module'));
  const courseId = txt(formData, 'cours');
  if (!aAcces(profil)) return;
  if (txt(formData, 'fait') === '1') {
    await supabase.from('progress').delete().match({ user_id: user.id, module_id: moduleId });
  } else {
    await supabase.from('progress').insert({ user_id: user.id, module_id: moduleId });
  }
  revalidatePath(`/espace/formations/${courseId}`);
}

// ---------- Offres (activation simulée) ----------
export async function activerAccesDemo() {
  const { supabase } = await session();
  await supabase.rpc('activer_acces_demo');
  revalidatePath('/espace', 'layout');
  redirect('/espace/offres?ok=1');
}

// ---------- Administration ----------
async function admin() {
  const s = await session();
  if (!estAdmin(s.profil)) throw new Error("Réservé à l'administrateur");
  return s;
}

function parseModules(t: string) {
  return lignes(t).map((l, i) => {
    const [titre, duree, video] = l.split('|');
    return {
      position: i + 1,
      title: (titre || '').trim(),
      duration: (duree || '').trim(),
      video_url: (video || '').trim() || null,
    };
  });
}

async function enregistrerFormation(formData: FormData, partenaireId: string | null) {
  const { supabase } = await session();
  const titre = txt(formData, 'titre');
  if (!titre) return;
  const { data } = await supabase
    .from('courses')
    .insert({
      title: titre,
      level: txt(formData, 'niveau') || 'Débutant',
      thumb: txt(formData, 'miniature'),
      partner_id: partenaireId,
      niche_id: Number(txt(formData, 'niche')) || null,
    })
    .select('id')
    .single();
  if (data) {
    const mods = parseModules(txt(formData, 'modules')).map((m) => ({ ...m, course_id: data.id }));
    if (mods.length) await supabase.from('modules').insert(mods);
  }
  revalidatePath('/espace/formations');
}

export async function ajouterFormation(formData: FormData) {
  await admin();
  await enregistrerFormation(formData, null);
  revalidatePath('/espace/admin');
}

export async function creerFormationPartenaire(formData: FormData) {
  const { profil } = await session();
  if (!estPartenaire(profil)) throw new Error('Non autorisé');
  await enregistrerFormation(formData, profil.id);
  revalidatePath('/espace/partenaire');
}

export async function supprimerFormation(formData: FormData) {
  const { supabase } = await admin();
  await supabase.from('courses').delete().eq('id', txt(formData, 'id'));
  revalidatePath('/espace/admin');
}

export async function ajouterOffre(formData: FormData) {
  const { supabase } = await admin();
  const best = formData.get('meilleure') === 'on';
  if (best) await supabase.from('offers').update({ best: false }).gt('id', 0);
  await supabase.from('offers').insert({
    name: txt(formData, 'nom'),
    price: Number(txt(formData, 'prix')) || 0,
    per: txt(formData, 'periode'),
    feat: lignes(txt(formData, 'avantages')),
    best,
  });
  revalidatePath('/espace/admin');
  revalidatePath('/');
}

export async function supprimerOffre(formData: FormData) {
  const { supabase } = await admin();
  await supabase.from('offers').delete().eq('id', txt(formData, 'id'));
  revalidatePath('/espace/admin');
  revalidatePath('/');
}

export async function basculerMembre(formData: FormData) {
  const { supabase } = await admin();
  const id = txt(formData, 'id');
  const champ = txt(formData, 'champ');
  const { data: p } = await supabase.from('profiles').select('role,sub,banned').eq('id', id).maybeSingle();
  if (!p) return;
  if (champ === 'ban') await supabase.from('profiles').update({ banned: !p.banned }).eq('id', id);
  if (champ === 'sub') await supabase.from('profiles').update({ sub: !p.sub }).eq('id', id);
  if (champ === 'partenaire')
    await supabase.from('profiles').update({ role: p.role === 'partenaire' ? 'membre' : 'partenaire' }).eq('id', id);
  revalidatePath('/espace/admin');
}

export async function sauverAccueil(formData: FormData) {
  const { supabase } = await admin();
  const faq = lignes(txt(formData, 'faq')).map((l) => {
    const i = l.indexOf('|');
    return i < 0 ? { q: l, a: '' } : { q: l.slice(0, i).trim(), a: l.slice(i + 1).trim() };
  });
  const value = {
    titre: txt(formData, 'titre'),
    texte: txt(formData, 'texte'),
    video: txt(formData, 'video'),
    fondateur: txt(formData, 'fondateur'),
    fondateur_nom: txt(formData, 'fondateur_nom'),
    fondateur_photo: txt(formData, 'fondateur_photo'),
    faq,
  };
  await supabase.from('settings').upsert({ key: 'accueil', value });
  revalidatePath('/');
  revalidatePath('/espace/admin');
}

// ---------- Catalogue : catégories et niches ----------
const slugifier = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function ajouterCategorie(formData: FormData) {
  const { supabase } = await admin();
  const nom = txt(formData, 'nom');
  if (!nom) return;
  await supabase.from('categories').insert({
    nom,
    slug: slugifier(nom),
    emoji: txt(formData, 'emoji') || '📘',
    description: txt(formData, 'description'),
    ordre: Number(txt(formData, 'ordre')) || 0,
  });
  revalidatePath('/espace', 'layout');
  revalidatePath('/espace/admin');
}

export async function supprimerCategorie(formData: FormData) {
  const { supabase } = await admin();
  await supabase.from('categories').delete().eq('id', txt(formData, 'id'));
  revalidatePath('/espace', 'layout');
  revalidatePath('/espace/admin');
}

export async function ajouterNiche(formData: FormData) {
  const { supabase } = await admin();
  const nom = txt(formData, 'nom');
  const categorie = Number(txt(formData, 'categorie'));
  if (!nom || !categorie) return;
  await supabase.from('niches').insert({
    categorie_id: categorie,
    nom,
    description: txt(formData, 'description'),
    ordre: Number(txt(formData, 'ordre')) || 0,
  });
  revalidatePath('/espace/formations');
  revalidatePath('/espace/admin');
}

export async function supprimerNiche(formData: FormData) {
  const { supabase } = await admin();
  await supabase.from('niches').delete().eq('id', txt(formData, 'id'));
  revalidatePath('/espace/formations');
  revalidatePath('/espace/admin');
}

// ---------- Vidéo à la une (fil d'actualités) ----------
export async function sauverVideoUne(formData: FormData) {
  const { supabase } = await admin();
  const titre = txt(formData, 'titre');
  await supabase.from('settings').upsert({
    key: 'video_une',
    value: { titre, image: txt(formData, 'image'), url: txt(formData, 'url') },
  });
  revalidatePath('/espace', 'layout');
  revalidatePath('/espace/admin');
}


// Formateurs rattachés à une formation (choisis par l'administrateur)
export async function sauverFormateurs(formData: FormData) {
  const { supabase } = await admin();
  const courseId = Number(txt(formData, 'course_id'));
  const ids = formData.getAll('formateur').map(String).filter(Boolean);
  await supabase.from('cours_formateurs').delete().eq('course_id', courseId);
  if (ids.length) {
    await supabase.from('cours_formateurs').insert(ids.map((profile_id) => ({ course_id: courseId, profile_id })));
  }
  revalidatePath('/espace/admin');
  revalidatePath(`/espace/formations/${courseId}`);
}

// Certification et réseaux sociaux d'un membre
export async function sauverCertification(formData: FormData) {
  const { supabase } = await admin();
  const id = txt(formData, 'id');
  const reseaux = {
    site: txt(formData, 'site'),
    instagram: txt(formData, 'instagram'),
    youtube: txt(formData, 'youtube'),
    tiktok: txt(formData, 'tiktok'),
    linkedin: txt(formData, 'linkedin'),
  };
  await supabase
    .from('profiles')
    .update({ certifie: formData.get('certifie') === 'on', reseaux })
    .eq('id', id);
  revalidatePath('/espace/admin');
}


// Commentaire d'un membre sur un module
export async function publierCommentaire(formData: FormData) {
  const { supabase, user, profil } = await session();
  const moduleId = Number(txt(formData, 'module'));
  const courseId = txt(formData, 'cours');
  const contenu = txt(formData, 'contenu').slice(0, 1000);
  if (!aAcces(profil) || !contenu || !moduleId) return;
  await supabase.from('commentaires_module').insert({ module_id: moduleId, user_id: user.id, contenu });
  revalidatePath(`/espace/formations/${courseId}`);
}
