import Link from 'next/link';
import { session } from '@/lib/session';

export const dynamic = 'force-dynamic';

const norm = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default async function Formations({ searchParams }: { searchParams: { q?: string } }) {
  const { supabase } = await session();
  const q = (searchParams.q || '').trim();
  const [{ data: cats }, { data: niches }, { data: cours }] = await Promise.all([
    supabase.from('categories').select('id,slug,nom,emoji,description').order('ordre'),
    supabase.from('niches').select('id,categorie_id,nom,description').order('ordre'),
    supabase.from('courses').select('id,title,niche_id').order('id'),
  ]);
  const toutesNiches = (niches || []) as any[];
  const toutesFormations = (cours || []) as any[];

  const recherche = (
    <form method="get" className="search">
      <span aria-hidden>🔎</span>
      <input name="q" defaultValue={q} placeholder="Rechercher une niche ou une formation" autoComplete="off" />
    </form>
  );

  if (q) {
    const k = norm(q);
    const nichesTrouvees = toutesNiches.filter((n) => norm(n.nom).includes(k));
    const formationsTrouvees = toutesFormations.filter((c) => norm(c.title).includes(k));
    return (
      <>
        <h1>Recherche</h1>
        {recherche}
        {nichesTrouvees.length > 0 && (
          <>
            <h3 className="rv">Niches</h3>
            {nichesTrouvees.map((n: any) => (
              <Link key={n.id} href={`/espace/formations/niche/${n.id}`} className="card row lift rv">
                <div className="grow"><strong>{n.nom}</strong><div className="muted">{n.description}</div></div>
                <span className="muted">›</span>
              </Link>
            ))}
          </>
        )}
        {formationsTrouvees.length > 0 && (
          <>
            <h3 className="rv">Formations</h3>
            {formationsTrouvees.map((c: any) => (
              <Link key={c.id} href={`/espace/formations/${c.id}`} className="card row lift rv">
                <div className="grow"><strong>{c.title}</strong></div>
                <span className="muted">›</span>
              </Link>
            ))}
          </>
        )}
        {nichesTrouvees.length === 0 && formationsTrouvees.length === 0 && (
          <div className="card muted" style={{ textAlign: 'center' }}>Aucun résultat pour « {q} ».</div>
        )}
      </>
    );
  }

  return (
    <>
      <span className="pill">Espace formation</span>
      <h1 style={{ marginTop: 12 }}>Que voulez-vous apprendre ?</h1>
      <p className="muted">Choisissez une catégorie, puis une niche qui correspond à votre objectif.</p>
      {recherche}
      <div className="grid">
        {(cats || []).map((c: any, i: number) => {
          const nb = toutesNiches.filter((n) => n.categorie_id === c.id).length;
          return (
            <Link key={c.id} href={`/espace/formations/categorie/${c.slug}`} className="tile lift rv" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="tile-emoji">{c.emoji}</div>
              <h3>{c.nom}</h3>
              <p className="muted">{c.description}</p>
              <span className="tile-count">{nb} {nb > 1 ? 'niches' : 'niche'}</span>
            </Link>
          );
        })}
      </div>
      {(!cats || cats.length === 0) && <div className="card muted" style={{ textAlign: 'center' }}>Aucune catégorie pour le moment.</div>}
    </>
  );
}
