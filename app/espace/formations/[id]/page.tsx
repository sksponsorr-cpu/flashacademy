import { notFound } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { marquerModule, publierCommentaire } from '../../actions';
import CoursInteractif from '@/components/CoursInteractif';

export const dynamic = 'force-dynamic';

const RESEAUX: Record<string, string> = {
  site: 'Site',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

export default async function Cours({ params }: { params: { id: string } }) {
  const { supabase, profil, user } = await session();
  const acces = peutAcceder(profil);

  const { data: c } = await supabase
    .from('courses')
    .select('id,title,level,emoji,thumb,niches(id,nom),modules(id,position,title,duration,video_url,gratuit)')
    .eq('id', params.id)
    .maybeSingle();

  if (!c) notFound();

  const mods = [...((c as any).modules || [])].sort(
    (a: any, b: any) => a.position - b.position
  );

  // Les commentaires sont publics : tout visiteur peut les lire.
  const idsModules = mods.map((m: any) => m.id);

  // Requêtes indépendantes lancées en parallèle.
  const [{ data: offres }, { data: fait }, { data: com }, { data: liens }] =
    await Promise.all([
      supabase.from('offers').select('price').order('price').limit(1),

      supabase
        .from('progress')
        .select('module_id')
        .eq('user_id', profil?.id),

      idsModules.length
        ? supabase
            .from('commentaires_module')
            .select('id,module_id,user_id,contenu,created_at,parent_id')
            .in('module_id', idsModules)
            .order('created_at')
        : Promise.resolve({ data: [] as any[] }),

      supabase
        .from('cours_formateurs')
        .select('profile_id')
        .eq('course_id', c.id),
    ]);

  const faits = new Set((fait || []).map((f: any) => f.module_id));

  const suivi = mods.length
    ? Math.round(
        (mods.filter((m: any) => faits.has(m.id)).length / mods.length) * 100
      )
    : 0;

  const min = offres?.[0]?.price;

  // Le premier module est gratuit.
  // Les modules suivants nécessitent un abonnement.
  const modulesUI = mods.map((m: any, i: number) => ({
    id: m.id,
    title: m.title,
    duration: m.duration,
    // L'URL vidéo n'est jamais envoyée au navigateur pour un module verrouillé.
    video_url: acces || i === 0 || m.gratuit ? m.video_url : null,
    verrouille: !acces && i > 0 && !m.gratuit,
    fait: faits.has(m.id),
  }));

  const userIds = [...new Set((com || []).map((x: any) => x.user_id))];

  const idsFormateurs = (liens || []).map((l: any) => l.profile_id);

  // Auteurs des commentaires et formateurs chargés ensemble.
  const idsProfils = [...new Set([...userIds, ...idsFormateurs])];

  const { data: profils } = idsProfils.length
    ? await supabase
        .from('profiles')
        .select('id,name,role,certifie,reseaux')
        .in('id', idsProfils)
    : { data: [] as any[] };

  const auteurs = (profils || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    certifie: p.certifie,
  }));
  const parId = new Map(auteurs.map((a: any) => [a.id, a]));

  const formateurs = (profils || []).filter((p: any) =>
    idsFormateurs.includes(p.id)
  );

  const nomDe = new Map((auteurs || []).map((p: any) => [p.id, p.name]));

  const idsCom = (com || []).map((x: any) => x.id);
  const { data: likesRows } = idsCom.length
    ? await supabase.from('comment_likes').select('comment_id,user_id').in('comment_id', idsCom)
    : { data: [] as any[] };
  const likesDe = new Map<string, number>();
  const aimeDe = new Set<string>();
  (likesRows || []).forEach((l: any) => {
    likesDe.set(l.comment_id, (likesDe.get(l.comment_id) || 0) + 1);
    if (user && l.user_id === user.id) aimeDe.add(l.comment_id);
  });

  const commentaires = (com || []).map((x: any) => ({
    id: x.id,
    module_id: x.module_id,
    contenu: x.contenu,
    created_at: x.created_at,
    auteur: nomDe.get(x.user_id) || 'Membre',
    auteur_id: x.user_id,
    auteur_role: parId.get(x.user_id)?.role,
    auteur_certifie: parId.get(x.user_id)?.certifie,
    parent_id: x.parent_id,
    likes: likesDe.get(x.id) || 0,
    aime: aimeDe.has(x.id),
  }));

  return (
    <>
      <nav className="crumbs">
        <Link href="/espace/formations">Formations</Link>

        {(c as any).niches && (
          <>
            {' '}
            <span>/</span>{' '}
            <Link
              href={`/espace/formations/niche/${(c as any).niches.id}`}
            >
              {(c as any).niches.nom}
            </Link>
          </>
        )}
      </nav>

      {/* En-tête compact : la vidéo du module vient juste après */}
      <div style={{ margin: '10px 0 16px' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <span className="tag">🎯 {c.level || 'Tous niveaux'}</span>
            <h1 style={{ margin: '8px 0 0', fontSize: 22 }}>{c.title}</h1>
          </div>
          <span className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{suivi} % suivi</span>
        </div>
        <div style={{ height: 5, background: 'var(--line)', borderRadius: 5, overflow: 'hidden', marginTop: 12 }}>
          <div style={{ width: `${suivi}%`, height: '100%', background: 'var(--accent)', transition: 'width 1s' }} />
        </div>
      </div>

      {/* Accès visiteur */}
      {!acces && (
        <div
          className="card"
          style={{
            background: 'var(--soft)',
            borderColor: 'transparent',
            marginBottom: 16,
          }}
        >
          <strong>Accès visiteur</strong>

          <p className="muted">
            Premier module accessible gratuitement. Débloquez les autres
            pour continuer.
          </p>

          <Link className="btn block" href="/espace/offres">
            Débloquer la formation · dès {min ? fcfa(min) : ''}
          </Link>
        </div>
      )}

      {/* Modules interactifs */}
      <CoursInteractif
        courseId={c.id}
        modules={modulesUI}
        commentaires={commentaires}
        acces={acces}
        formateurs={(formateurs || []) as any[]}
        envoyerCommentaire={publierCommentaire}
        marquerModule={marquerModule}
      />
    </>
  );
      }
