import { notFound } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { marquerModule, publierCommentaire } from '../../actions';
import CoursInteractif from '@/components/CoursInteractif';

export const dynamic = 'force-dynamic';

const RESEAUX: Record<string, string> = { site: 'Site', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', linkedin: 'LinkedIn' };

export default async function Cours({ params }: { params: { id: string } }) {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);

  const { data: c } = await supabase
    .from('courses')
    .select('id,title,level,emoji,thumb,niches(id,nom),modules(id,position,title,duration,video_url)')
    .eq('id', params.id)
    .maybeSingle();
  if (!c) notFound();

  const { data: offres } = await supabase.from('offers').select('price').order('price').limit(1);
  const { data: fait } = await supabase.from('progress').select('module_id').eq('user_id', profil?.id);
  const faits = new Set((fait || []).map((f: any) => f.module_id));

  const mods = [...((c as any).modules || [])].sort((a: any, b: any) => a.position - b.position);
  const suivi = mods.length ? Math.round((mods.filter((m: any) => faits.has(m.id)).length / mods.length) * 100) : 0;
  const min = offres?.[0]?.price;

  // Modules passés au composant : le premier est gratuit, les suivants demandent un abonnement
  const modulesUI = mods.map((m: any, i: number) => ({
    id: m.id,
    title: m.title,
    duration: m.duration,
    video_url: m.video_url,
    verrouille: !acces && i > 0,
    fait: faits.has(m.id),
  }));

  // Commentaires de tous les modules du cours
  const idsModules = mods.map((m: any) => m.id);
  const { data: com } = idsModules.length
    ? await supabase.from('commentaires_module').select('id,module_id,user_id,contenu,created_at').in('module_id', idsModules).order('created_at')
    : { data: [] as any[] };
  const userIds = [...new Set((com || []).map((x: any) => x.user_id))];
  const { data: auteurs } = userIds.length
    ? await supabase.from('profiles').select('id,name').in('id', userIds)
    : { data: [] as any[] };
  const nomDe = new Map((auteurs || []).map((p: any) => [p.id, p.name]));
  const commentaires = (com || []).map((x: any) => ({
    id: x.id,
    module_id: x.module_id,
    contenu: x.contenu,
    created_at: x.created_at,
    auteur: nomDe.get(x.user_id) || 'Membre',
  }));

  // Formateurs tagués par l'administrateur
  const { data: liens } = await supabase.from('cours_formateurs').select('profile_id').eq('course_id', c.id);
  const idsFormateurs = (liens || []).map((l: any) => l.profile_id);
  const { data: formateurs } = idsFormateurs.length
    ? await supabase.from('profiles').select('id,name,role,certifie,reseaux').in('id', idsFormateurs)
    : { data: [] as any[] };

  return (
    <>
      <nav className="crumbs">
        <Link href="/espace/formations">Formations</Link>
        {(c as any).niches && <> <span>/</span> <Link href={`/espace/formations/niche/${(c as any).niches.id}`}>{(c as any).niches.nom}</Link></>}
      </nav>

      <div className="row" style={{ margin: '12px 0', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 24, flex: 1 }}>{c.title}</h1>
        <span className="muted">{c.level}</span>
      </div>

      {acces ? (
        <div style={{ margin: '0 0 16px' }}>
          <div style={{ height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${suivi}%`, height: '100%', background: 'var(--accent)' }} />
          </div>
          <p className="muted" style={{ margin: '6px 0 0' }}>{suivi} % suivi</p>
        </div>
      ) : (
        <div className="card" style={{ background: 'var(--soft)', borderColor: 'transparent', marginBottom: 16 }}>
          <strong>Accès visiteur</strong>
          <p className="muted">Vous pouvez regarder le premier module. Les suivants se débloquent avec une offre.</p>
          <Link className="btn block" href="/espace/offres">Débloquer la formation · dès {min ? fcfa(min) : ''}</Link>
        </div>
      )}

      <CoursInteractif
        courseId={c.id}
        modules={modulesUI}
        commentaires={commentaires}
        acces={acces}
        envoyerCommentaire={publierCommentaire}
        marquerModule={marquerModule}
      />

      {(formateurs || []).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Formateurs du cours</h3>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
            {(formateurs as any[]).map((f) => {
              const liensRes = Object.entries(f.reseaux || {}).filter(([, v]) => v) as [string, string][];
              return (
                <div key={f.id} className="card" style={{ display: 'grid', gap: 8 }}>
                  <div className="row" style={{ gap: 12 }}>
                    <div className="avatar">{(f.name || '?').charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{f.name}</strong>
                      {f.certifie && (
                        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                          ✓ {f.role === 'partenaire' ? 'Partenaire certifié' : 'Formateur certifié'}
                        </div>
                      )}
                    </div>
                  </div>
                  {liensRes.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {liensRes.map(([cle, url]) => (
                        <a key={cle} className="btn ghost sm" href={url} target="_blank" rel="noopener noreferrer">
                          {RESEAUX[cle] || cle}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
