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
    .select('id,nom,description,miniature,courses(id)')
    .eq('categorie_id', cat.id)
    .order('ordre');

  return (
    <>
      <nav className="crumbs">
        <Link href="/espace/formations">Formations</Link>
        <span>/</span>
        {cat.nom}
      </nav>

      <div className="head-cat rv">
        <div className="tile-emoji big">{cat.emoji}</div>

        <div>
          <h1>{cat.nom}</h1>
          <p className="muted">{cat.description}</p>
        </div>
      </div>

      <div style={{ margin: '22px 0 14px' }}>
        <h2 style={{ margin: 0 }}>Choisissez votre niche</h2>

        <p
          className="muted"
          style={{ margin: '5px 0 0', fontSize: 13 }}
        >
          Explorez les domaines et choisissez le parcours qui vous correspond.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 14,
          gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,245px),1fr))'
        }}
      >
        {(niches || []).map((n: any, i: number) => (
          <Link
            key={n.id}
            href={`/espace/formations/niche/${n.id}`}
            className="card lift rv"
            style={{
              padding: 0,
              overflow: 'hidden',
              margin: 0,
              animationDelay: `${i * 0.06}s`
            }}
          >
            {/* MINIATURE DE LA NICHE */}

            <div
              style={{
                position: 'relative',
                aspectRatio: '16 / 9',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                background: 'linear-gradient(135deg,#142e65,#5b35a4)'
              }}
            >
              {n.miniature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" decoding="async"
                  src={n.miniature}
                  alt={`Miniature ${n.nom}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'radial-gradient(circle at 80% 15%,#38bdf866,transparent 42%),linear-gradient(135deg,#142e65,#5b35a4)'
                    }}
                  />

                  <span
                    style={{
                      position: 'relative',
                      fontSize: 58,
                      filter: 'drop-shadow(0 8px 12px #0008)'
                    }}
                  >
                    {cat.emoji || '📚'}
                  </span>
                </>
              )}

              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  bottom: 10,
                  background: '#080d1dcc',
                  color: '#fff',
                  border: '1px solid #ffffff35',
                  borderRadius: 30,
                  padding: '4px 9px',
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                NICHE
              </span>
            </div>

            {/* INFORMATIONS DE LA NICHE */}

            <div style={{ padding: 14 }}>
              <strong
                style={{
                  display: 'block',
                  fontSize: 17,
                  lineHeight: 1.3
                }}
              >
                {n.nom}
              </strong>

              {n.description && (
                <p
                  className="muted"
                  style={{
                    margin: '6px 0 10px',
                    fontSize: 13,
                    lineHeight: 1.45
                  }}
                >
                  {n.description}
                </p>
              )}

              <div
                className="row"
                style={{
                  justifyContent: 'space-between',
                  fontSize: 12
                }}
              >
                <span className="muted">
                  {(n.courses || []).length} formation(s)
                </span>

                <span
                  style={{
                    color: 'var(--accent)',
                    fontWeight: 700
                  }}
                >
                  Découvrir →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {(!niches || niches.length === 0) && (
        <div
          className="card muted"
          style={{ textAlign: 'center' }}
        >
          Les niches arrivent bientôt.
        </div>
      )}
    </>
  );
}
