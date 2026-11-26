'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { session } from '@/lib/session';
import { estAdmin, estPartenaire, lignes } from '@/lib/access';

const txt = (f: FormData, k: string) =>
  String(f.get(k) ?? '').trim();

const aAcces = (p: any) => !!p && (p.sub || p.role === 'admin');

function verifierErreur(error: any, operation: string) {
  if (error) {
    console.error(`[FlashAcademy] ${operation}:`, error);
    throw new Error(`${operation} : ${error.message}`);
  }
}

// ---------- Publications ----------

export async function publierPublication(formData: FormData) {
  const { supabase, user } = await session();
  const contenu = txt(formData, 'contenu');

  if (!contenu) return;

  const { error } = await supabase
    .from('posts')
    .insert({ author_id: user.id, content: contenu });

  verifierErreur(error, 'Publication impossible');
  revalidatePath('/espace');
}

export async function publierRecit(formData: FormData) {
  const { supabase, user } = await session();
  const contenu = txt(formData, 'contenu');

  if (!contenu) return;

  const { error } = await supabase
    .from('stories')
    .insert({ author_id: user.id, content: contenu });

  verifierErreur(error, 'Publication du récit impossible');
  revalidatePath('/espace', 'layout');
}

// ---------- Profil ----------

export async function sauverProfil(formData: FormData) {
  const { supabase, user, profil } = await session();

  let photo = profil?.photo || '';
  const fichier = formData.get('photo') as File | null;

  if (fichier && fichier.size > 0) {
    const chemin = `${user.id}/${Date.now()}-${fichier.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    const { error } = await supabase.storage
      .from('photos')
      .upload(chemin, fichier, { upsert: true });

    verifierErreur(error, 'Envoi de la photo impossible');

    photo = supabase.storage
      .from('photos')
      .getPublicUrl(chemin).data.publicUrl;
  }

  const { error } = await supabase
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

  verifierErreur(error, 'Modification du profil impossible');

  revalidatePath('/espace', 'layout');
}

// ---------- Messages ----------

export async function envoyerMessage(formData: FormData) {
  const { supabase, user, profil } = await session();

  const avec = txt(formData, 'avec');
  const contenu = txt(formData, 'contenu');

  if (!contenu || !avec) return;
  if (!aAcces(profil)) redirect('/espace/offres');

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: avec,
      content: contenu,
    });

  verifierErreur(error, 'Envoi du message impossible');

  revalidatePath('/espace/messages');
}

// ---------- Recettes ----------

export async function publierRecette(formData: FormData) {
  const { supabase, user, profil } = await session();

  if (!aAcces(profil)) redirect('/espace/offres');

  const titre = txt(formData, 'titre');
  if (!titre) return;

  const { error } = await supabase
    .from('recipes')
    .insert({
      author_id: user.id,
      title: titre,
      time: txt(formData, 'temps'),
      ingredients: txt(formData, 'ingredients'),
      steps: txt(formData, 'etapes'),
    });

  verifierErreur(error, 'Création de la recette impossible');

  revalidatePath('/espace/recettes');
}

// ---------- Progression des formations ----------

export async function marquerModule(formData: FormData) {
  const { supabase, user, profil } = await session();

  const moduleId = Number(txt(formData, 'module'));
  const courseId = txt(formData, 'cours');

  if (!aAcces(profil)) return;
  if (!moduleId) return;

  if (txt(formData, 'fait') === '1') {
    const { error } = await supabase
      .from('progress')
      .delete()
      .match({
        user_id: user.id,
        module_id: moduleId,
      });

    verifierErreur(error, 'Modification de progression impossible');
  } else {
    const { error } = await supabase
      .from('progress')
      .insert({
        user_id: user.id,
        module_id: moduleId,
      });

    verifierErreur(error, 'Enregistrement de progression impossible');
  }

  revalidatePath(`/espace/formations/${courseId}`);
}

// ---------- Activation démo ----------

export async function activerAccesDemo() {
  const { supabase } = await session();

  const { error } = await supabase.rpc('activer_acces_demo');

  verifierErreur(error, 'Activation démo impossible');

  revalidatePath('/espace', 'layout');
  redirect('/espace/offres?ok=1');
}

// ---------- Vérification administrateur ----------

async function admin() {
  const s = await session();

  if (!estAdmin(s.profil)) {
    throw new Error("Accès réservé à l'administrateur.");
  }

  return s;
}

function parseModules(t: string) {
  try {
    const liste = JSON.parse(t);

    if (Array.isArray(liste)) {
      return liste
        .filter((m: any) => m && String(m.titre || '').trim())
        .map((m: any, i: number) => ({
          position: i + 1,
          title: String(m.titre).trim(),
          duration: String(m.duree || '').trim(),
          video_url: String(m.video || '').trim() || null,
        }));
    }
  } catch {}

  return lignes(t).map((l, i) => {
    let [titre, duree, video] = l.split('|').map(x => (x || '').trim());

    if (/^https?:\/\//i.test(titre) && !video) {
      video = titre;
      titre = '';
    }

    return {
      position: i + 1,
      title: titre || `Module ${i + 1}`,
      duration: duree || '',
      video_url: video || null,
    };
  });
}

// ---------- Enregistrement formation ----------

async function enregistrerFormation(
  formData: FormData,
  partenaireId: string | null
) {
  const { supabase } = await session();

  const titre = txt(formData, 'titre');

  if (!titre) {
    throw new Error('Le titre de la formation est obligatoire.');
  }

  const nicheTexte = txt(formData, 'niche');
  const nicheId = nicheTexte ? Number(nicheTexte) : null;

  if (nicheTexte && (!Number.isInteger(nicheId) || nicheId! <= 0)) {
    throw new Error('La niche sélectionnée est invalide.');
  }

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: titre,
      level: txt(formData, 'niveau') || 'Débutant',
      thumb: txt(formData, 'miniature') || null,
      partner_id: partenaireId,
      niche_id: nicheId,
    })
    .select('id')
    .single();

  verifierErreur(error, 'Création de la formation impossible');

  if (!data) {
    throw new Error('La formation n’a pas été créée.');
  }

  const modules = parseModules(txt(formData, 'modules'))
    .map(m => ({ ...m, course_id: data.id }));

  if (modules.length > 0) {
    const { error: moduleError } = await supabase
      .from('modules')
      .insert(modules);

    verifierErreur(
      moduleError,
      'La formation existe, mais les modules n’ont pas été enregistrés'
    );
  }

  revalidatePath('/espace/formations');
  revalidatePath('/espace/admin');

  return data.id;
}

export async function ajouterFormation(formData: FormData) {
  await admin();

  await enregistrerFormation(formData, null);

  revalidatePath('/espace/admin');
}

export async function creerFormationPartenaire(formData: FormData) {
  const { profil } = await session();

  if (!estPartenaire(profil)) {
    throw new Error('Non autorisé.');
  }

  await enregistrerFormation(formData, profil.id);

  revalidatePath('/espace/partenaire');
}

// ---------- Suppression formation ----------

export async function supprimerFormation(formData: FormData) {
  const { supabase } = await admin();

  const id = txt(formData, 'id');

  if (!id) throw new Error('Identifiant manquant.');

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  verifierErreur(error, 'Suppression de la formation impossible');

  revalidatePath('/espace/admin');
  revalidatePath('/espace/formations');
}

// ---------- Offres ----------

export async function ajouterOffre(formData: FormData) {
  const { supabase } = await admin();

  const best = formData.get('meilleure') === 'on';
  const nom = txt(formData, 'nom');
  const prix = Number(txt(formData, 'prix'));

  if (!nom || !Number.isFinite(prix) || prix <= 0) {
    throw new Error('Nom ou prix invalide.');
  }

  if (best) {
    const { error } = await supabase
      .from('offers')
      .update({ best: false })
      .gt('id', 0);

    verifierErreur(error, 'Modification des offres impossible');
  }

  const { error } = await supabase
    .from('offers')
    .insert({
      name: nom,
      price: prix,
      per: txt(formData, 'periode'),
      feat: lignes(txt(formData, 'avantages')),
      best,
    });

  verifierErreur(error, 'Ajout de l’offre impossible');

  revalidatePath('/espace/admin');
  revalidatePath('/');
}

export async function supprimerOffre(formData: FormData) {
  const { supabase } = await admin();

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', txt(formData, 'id'));

  verifierErreur(error, 'Suppression de l’offre impossible');

  revalidatePath('/espace/admin');
  revalidatePath('/');
}

// ---------- Gestion des membres ----------

export async function basculerMembre(formData: FormData) {
  const { supabase } = await admin();

  const id = txt(formData, 'id');
  const champ = txt(formData, 'champ');

  const { data: p, error } = await supabase
    .from('profiles')
    .select('role,sub,banned')
    .eq('id', id)
    .maybeSingle();

  verifierErreur(error, 'Lecture du membre impossible');

  if (!p) return;

  let modification: any = null;

  if (champ === 'ban') {
    modification = { banned: !p.banned };
  }

  if (champ === 'sub') {
    modification = { sub: !p.sub };
  }

  if (champ === 'partenaire') {
    modification = {
      role: p.role === 'partenaire' ? 'membre' : 'partenaire',
    };
  }

  if (!modification) return;

  const { error: updateError } = await supabase
    .from('profiles')
    .update(modification)
    .eq('id', id);

  verifierErreur(updateError, 'Modification du membre impossible');

  revalidatePath('/espace/admin');
}

// ---------- Paramètres accueil ----------

export async function sauverAccueil(formData: FormData) {
  const { supabase } = await admin();

  const faq = lignes(txt(formData, 'faq')).map(l => {
    const i = l.indexOf('|');

    return i < 0
      ? { q: l, a: '' }
      : {
          q: l.slice(0, i).trim(),
          a: l.slice(i + 1).trim(),
        };
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

  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'accueil', value });

  verifierErreur(error, 'Enregistrement de l’accueil impossible');

  revalidatePath('/');
  revalidatePath('/espace/admin');
}

// ---------- Catégories et niches ----------

const slugifier = (t: string) =>
  t.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export async function ajouterCategorie(formData: FormData) {
  const { supabase } = await admin();

  const nom = txt(formData, 'nom');

  if (!nom) {
    throw new Error('Le nom de la catégorie est obligatoire.');
  }

  const { error } = await supabase
    .from('categories')
    .insert({
      nom,
      slug: slugifier(nom),
      emoji: txt(formData, 'emoji') || '📘',
      description: txt(formData, 'description'),
      ordre: Number(txt(formData, 'ordre')) || 0,
    });

  verifierErreur(error, 'Ajout de catégorie impossible');

  revalidatePath('/espace', 'layout');
  revalidatePath('/espace/admin');
}

export async function supprimerCategorie(formData: FormData) {
  const { supabase } = await admin();

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', txt(formData, 'id'));

  verifierErreur(error, 'Suppression de catégorie impossible');

  revalidatePath('/espace', 'layout');
  revalidatePath('/espace/admin');
}

export async function ajouterNiche(formData: FormData) {
  const { supabase } = await admin();

  const nom = txt(formData, 'nom');
  const categorie = Number(txt(formData, 'categorie'));

  if (!nom || !Number.isInteger(categorie) || categorie <= 0) {
    throw new Error('Nom ou catégorie invalide.');
  }

  const { data: cat, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('id', categorie)
    .maybeSingle();

  verifierErreur(catError, 'Vérification de la catégorie impossible');

  if (!cat) {
    throw new Error('La catégorie sélectionnée est introuvable.');
  }

  const { error } = await supabase
    .from('niches')
    .insert({
      categorie_id: categorie,
      nom,
      description: txt(formData, 'description'),
      miniature: txt(formData, 'miniature') || null,
      ordre: Number(txt(formData, 'ordre')) || 0,
    });

  verifierErreur(error, 'Ajout de niche impossible');

  revalidatePath('/espace/formations');
  revalidatePath('/espace/admin');
}

export async function supprimerNiche(formData: FormData) {
  const { supabase } = await admin();

  const { error } = await supabase
    .from('niches')
    .delete()
    .eq('id', txt(formData, 'id'));

  verifierErreur(error, 'Suppression de niche impossible');

  revalidatePath('/espace/formations');
  revalidatePath('/espace/admin');
}

// ---------- Vidéo à la une ----------

export async function sauverVideoUne(formData: FormData) {
  const { supabase } = await admin();

  const { error } = await supabase
    .from('settings')
    .upsert({
      key: 'video_une',
      value: {
        titre: txt(formData, 'titre'),
        image: txt(formData, 'image'),
        url: txt(formData, 'url'),
      },
    });

  verifierErreur(error, 'Enregistrement de la vidéo impossible');

  revalidatePath('/espace', 'layout');
  revalidatePath('/espace/admin');
}

// ---------- Formateurs ----------

export async function sauverFormateurs(formData: FormData) {
  const { supabase } = await admin();

  const courseId = Number(txt(formData, 'course_id'));

  if (!courseId) throw new Error('Formation invalide.');

  const ids = formData.getAll('formateur')
    .map(String)
    .filter(Boolean);

  const { error: deleteError } = await supabase
    .from('cours_formateurs')
    .delete()
    .eq('course_id', courseId);

  verifierErreur(deleteError, 'Suppression des anciens formateurs impossible');

  if (ids.length) {
    const { error } = await supabase
      .from('cours_formateurs')
      .insert(
        ids.map(profile_id => ({
          course_id: courseId,
          profile_id,
        }))
      );

    verifierErreur(error, 'Ajout des formateurs impossible');
  }

  revalidatePath('/espace/admin');
  revalidatePath(`/espace/formations/${courseId}`);
}

// ---------- Certification ----------

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

  const { error } = await supabase
    .from('profiles')
    .update({
      certifie: formData.get('certifie') === 'on',
      reseaux,
    })
    .eq('id', id);

  verifierErreur(error, 'Modification de certification impossible');

  revalidatePath('/espace/admin');
}

// ---------- Commentaires modules ----------

export async function publierCommentaire(formData: FormData) {
  const { supabase, user, profil } = await session();

  const moduleId = Number(txt(formData, 'module'));
  const courseId = txt(formData, 'cours');
  const contenu = txt(formData, 'contenu').slice(0, 1000);

  if (!aAcces(profil) || !contenu || !moduleId) return;

  const { error } = await supabase
    .from('commentaires_module')
    .insert({
      module_id: moduleId,
      user_id: user.id,
      contenu,
    });

  verifierErreur(error, 'Publication du commentaire impossible');

  revalidatePath(`/espace/formations/${courseId}`);
}

// ---------- Modification offre ----------

export async function modifierOffre(formData: FormData) {
  const { supabase } = await admin();

  const id = txt(formData, 'id');
  const best = formData.get('meilleure') === 'on';

  if (best) {
    const { error } = await supabase
      .from('offers')
      .update({ best: false })
      .neq('id', id);

    verifierErreur(error, 'Modification des offres impossible');
  }

  const { error } = await supabase
    .from('offers')
    .update({
      name: txt(formData, 'nom'),
      price: Number(txt(formData, 'prix')) || 0,
      per: txt(formData, 'periode'),
      feat: lignes(txt(formData, 'avantages')),
      best,
    })
    .eq('id', id);

  verifierErreur(error, 'Modification de l’offre impossible');

  revalidatePath('/espace/admin');
  revalidatePath('/espace/offres');
  revalidatePath('/');
}

// ---------- Modification formation ----------

export async function modifierFormation(formData: FormData) {
  const { supabase } = await admin();

  const id = Number(txt(formData, 'id'));

  if (!id) {
    throw new Error('Identifiant de formation invalide.');
  }

  const { error: courseError } = await supabase
    .from('courses')
    .update({
      title: txt(formData, 'titre'),
      level: txt(formData, 'niveau') || 'Débutant',
      thumb: txt(formData, 'miniature'),
      niche_id: Number(txt(formData, 'niche')) || null,
    })
    .eq('id', id);

  verifierErreur(courseError, 'Modification de la formation impossible');

  let liste: any[] = [];

  try {
    liste = JSON.parse(txt(formData, 'modules'));
  } catch {
    liste = [];
  }

  if (!Array.isArray(liste)) {
    throw new Error('Format des modules invalide.');
  }

  const { data: existants, error: readError } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', id);

  verifierErreur(readError, 'Lecture des modules impossible');

  const gardes = new Set<number>();
  let position = 0;

  for (const m of liste) {
    if (!String(m?.titre || '').trim()) continue;

    position++;

    const champs = {
      position,
      title: String(m.titre).trim(),
      duration: String(m.duree || '').trim(),
      video_url: String(m.video || '').trim() || null,
    };

    if (m.id) {
      const moduleId = Number(m.id);

      gardes.add(moduleId);

      const { error } = await supabase
        .from('modules')
        .update(champs)
        .eq('id', moduleId)
        .eq('course_id', id);

      verifierErreur(error, 'Modification du module impossible');
    } else {
      const { error } = await supabase
        .from('modules')
        .insert({
          ...champs,
          course_id: id,
        });

      verifierErreur(error, 'Ajout du module impossible');
    }
  }

  const aRetirer = (existants || [])
    .map((x: any) => x.id)
    .filter((x: number) => !gardes.has(x));

  if (aRetirer.length) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .in('id', aRetirer)
      .eq('course_id', id);

    verifierErreur(error, 'Suppression des modules impossible');
  }

  revalidatePath('/espace/formations');
  revalidatePath(`/espace/formations/${id}`);
  revalidatePath('/espace/admin');
      }
