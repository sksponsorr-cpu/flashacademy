import { notFound } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Niche({ params }: { params: { id: string } }) {
  const { supabase } = await session();
  const { data: niche } = await supabase
    .from('niches')
    .select('id,nom,description,miniature,categories(slug,nom,emoji)')
    .eq('id', params.id)
    .maybeSingle();

  if (!niche) notFound();

  const cat: any = (niche as any).categories;

  const { data: cours } = await supabase
    .from('courses')
    .select('id,title,level,emoji,thumb,modules(id)')
    .eq('niche_id', niche.id)
    .order('id');

  // Formateur principal de chaque formation (affiché sur la carte)
  const ids = (cours || []).map((c: any) => c.id);

  const { data: liens } = ids.length
    ? await supabase
        .from('cours_formateurs')
        .select('course_id,profiles(name,certifie,role)')
        .in('course_id', ids)
    : { data: [] as any[] };

  const formateurDe = new Map<number, any>();

  (liens || []).forEach((l: any) => {
    if (!formateurDe.has(l.course_id) && l.profiles) {
      formateurDe.set(l.course_id, l.profiles);
    }
  });

  const nb = (cours || []).length;

  return (
    <>
      <nav className="crumbs">
        <Link href="/espace/formations">Formations</Link>
        <span>/</span>

        {cat && (
          <>
            <Link href={`/espace/formations/categorie/${cat.slug}`}>
              {cat.nom}
            </Link>
            <span>/</span>
          </>
        )}

        {niche.nom}
      </nav>

      <div style={{ margin: '10px 0 18px' }}>
        <h1 style={{ margin: 0 }}>{niche.nom}</h1>

        {niche.description && (
          <p className="muted" style={{ margin: '6px 0 0' }}>
            {niche.description}
          </p>
        )}

        <p className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>
          {nb} {nb > 1 ? 'formations' : 'formation'}
        </p>
      </div>

      {nb > 0 ? (
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns:
              'repeat(auto-fill,minmax(min(100%,250px),1fr))',
          }}
        >
          {(cours || []).map((c: any) => {
            const f = formateurDe.get(c.id);

            return (
              <Link
                key={c.id}
                href={`/espace/formations/${c.id}`}
                className="card lift"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  margin: 0,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 40,
                    background: 'linear-gradient(135deg,#1e3a8a,#8b5cf6)',
                    ...(c.thumb
                      ? {
                          backgroundImage: `url('${c.thumb}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}),
                  }}
                >
                  {c.thumb ? '' : c.emoji}

                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(0,0,0,.6)',
                      color: '#fff',
                      borderRadius: 99,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {c.level}
                  </span>
                </div>

                <div
                  style={{
                    padding: 14,
                    display: 'grid',
                    gap: 6,
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      lineHeight: 1.3,
                    }}
                  >
                    {c.title}
                  </h3>

                  <p
                    className="muted"
                    style={{ margin: 0, fontSize: 13 }}
                  >
                    {(c.modules || []).length} modules
                  </p>

                  {f && (
                    <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                      {f.name}

                      {f.certifie && (
                        <span
                          style={{
                            color: 'var(--accent)',
                            fontWeight: 600,
                          }}
                        >
                          {' '}
                          ✓{' '}
                          {f.role === 'partenaire'
                            ? 'Partenaire certifié'
                            : 'Formateur certifié'}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          className="card muted"
          style={{ textAlign: 'center' }}
        >
          Aucune formation dans cette niche pour le moment.
        </div>
      )}
    </>
  );
}
