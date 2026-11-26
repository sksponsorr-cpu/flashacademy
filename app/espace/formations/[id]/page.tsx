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
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);

  const { data: c } = await supabase
    .from('courses')
    .select('id,title,level,emoji,thumb,niches(id,nom),modules(id,position,title,duration,video_url)')
    .eq('id', params.id)
    .maybeSingle();

  if (!c) notFound();

  const mods = [...((c as any).modules || [])].sort(
    (a: any, b: any) => a.position - b.position
  );

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
            .select('id,module_id,user_id,contenu,created_at')
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
    video_url: m.video_url,
    verrouille: !acces && i > 0,
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
  }));

  const formateurs = (profils || []).filter((p: any) =>
    idsFormateurs.includes(p.id)
  );

  const nomDe = new Map((auteurs || []).map((p: any) => [p.id, p.name]));

  const commentaires = (com || []).map((x: any) => ({
    id: x.id,
    module_id: x.module_id,
    contenu: x.contenu,
    created_at: x.created_at,
    auteur: nomDe.get(x.user_id) || 'Membre',
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

      {/* Présentation visuelle de la formation */}
      <section style={{ margin: '14px 0 18px' }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '16 / 8',
            minHeight: 150,
            maxHeight: 270,
            overflow: 'hidden',
            borderRadius: 18,
            background: 'linear-gradient(135deg,#12356d,#5936a0)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {c.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.thumb}
              alt={`Miniature ${c.title}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 64,
                filter: 'drop-shadow(0 8px 12px #0008)',
              }}
            >
              {c.emoji || '🎓'}
            </span>
          )}

          <span
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              padding: '5px 10px',
              borderRadius: 30,
              color: '#fff',
              background: '#080d1dcc',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {c.level || 'Formation'}
          </span>
        </div>

        <div
          className="row"
          style={{
            margin: '14px 0 8px',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              lineHeight: 1.2,
              flex: 1,
            }}
          >
            {c.title}
          </h1>
        </div>

        <div
          className="row"
          style={{
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span className="pill">
            📚 {mods.length} module{mods.length > 1 ? 's' : ''}
          </span>

          <span className="pill">
            🎯 {c.level || 'Tous niveaux'}
          </span>

          <span className="pill">▶ Vidéos et exercices</span>
        </div>
      </section>

      {/* Progression de l'apprenant */}
      {acces ? (
        <div style={{ margin: '0 0 16px' }}>
          <div
            style={{
              height: 6,
              background: 'var(--line)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${suivi}%`,
                height: '100%',
                background: 'var(--accent)',
              }}
            />
          </div>

          <p
            className="muted"
            style={{ margin: '6px 0 0' }}
          >
            {suivi} % suivi
          </p>
        </div>
      ) : (
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
