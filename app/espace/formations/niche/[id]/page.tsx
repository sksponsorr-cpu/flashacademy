import { notFound } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Niche({ params }: { params: { id: string } }) {
  const { supabase } = await session();
  const { data: niche } = await supabase
    .from('niches')
    .select('id,nom,description,categories(slug,nom,emoji)')
    .eq('id', params.id)
    .maybeSingle();
  if (!niche) notFound();
  const cat: any = (niche as any).categories;

  const { data: cours } = await supabase
    .from('courses')
    .select('id,title,level,emoji,thumb,modules(id)')
    .eq('niche_id', niche.id)
    .order('id');

  return (
    <>
      <nav className="crumbs">
        <Link href="/espace/formations">Formations</Link> <span>/</span>
        {cat && <><Link href={`/espace/formations/categorie/${cat.slug}`}>{cat.nom}</Link> <span>/</span></>}
        {niche.nom}
      </nav>
      <h1 className="rv">{niche.nom}</h1>
      <p className="muted rv">{niche.description}</p>
      {(cours || []).map((c: any, i: number) => (
        <Link key={c.id} href={`/espace/formations/${c.id}`} className="card lift rv" style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.06}s` }}>
          <div
            style={{
              aspectRatio: '16/9', display: 'grid', placeItems: 'center', fontSize: 40,
              background: 'linear-gradient(135deg,#1e3a8a,#8b5cf6)',
              ...(c.thumb ? { backgroundImage: `url('${c.thumb}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
            }}
          >
            {c.thumb ? '' : c.emoji}
          </div>
          <div style={{ padding: 14 }}>
            <span className="tag">{c.level}</span>
            <h3 style={{ marginTop: 8 }}>{c.title}</h3>
            <p className="muted">{(c.modules || []).length} modules</p>
          </div>
        </Link>
      ))}
      {(!cours || cours.length === 0) && <div className="card muted" style={{ textAlign: 'center' }}>Aucune formation dans cette niche pour le moment.</div>}
    </>
  );
}
