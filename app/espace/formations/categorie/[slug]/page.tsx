import { notFound } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Categorie({ params }: { params: { slug: string } }) {
  const { supabase } = await session();
  const { data: cat } = await supabase
    .from('categories')
    .select('id,nom,emoji,description')
    .eq('slug', params.slug)
    .maybeSingle();
  if (!cat) notFound();

  const { data: niches } = await supabase
    .from('niches')
    .select('id,nom,description,courses(id)')
    .eq('categorie_id', cat.id)
    .order('ordre');

  return (
    <>
      <nav className="crumbs"><Link href="/espace/formations">Formations</Link> <span>/</span> {cat.nom}</nav>
      <div className="head-cat rv">
        <div className="tile-emoji big">{cat.emoji}</div>
        <div>
          <h1>{cat.nom}</h1>
          <p className="muted">{cat.description}</p>
        </div>
      </div>
      <h3 className="rv">Choisissez votre niche</h3>
      {(niches || []).map((n: any, i: number) => (
        <Link key={n.id} href={`/espace/formations/niche/${n.id}`} className="card row lift rv" style={{ animationDelay: `${i * 0.06}s` }}>
          <div className="grow">
            <strong>{n.nom}</strong>
            <div className="muted">{n.description}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{(n.courses || []).length} formation(s)</div>
          </div>
          <span className="muted">›</span>
        </Link>
      ))}
      {(!niches || niches.length === 0) && <div className="card muted" style={{ textAlign: 'center' }}>Les niches arrivent bientôt.</div>}
    </>
  );
}
