import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';

export const dynamic = 'force-dynamic';

export default async function Formations() {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);
  const [{ data: cours }, { data: offres }] = await Promise.all([
    supabase.from('courses').select('id,title,level,thumb,emoji,modules(id)').order('id'),
    supabase.from('offers').select('price').order('price').limit(1),
  ]);
  const min = offres?.[0]?.price;

  return (
    <>
      <h1>Espace formation</h1>
      <p className="muted">Toutes les formations incluses dans les offres.</p>
      <div className="grid" style={{ marginTop: 12 }}>
        {(cours || []).map((c: any) => (
          <Link key={c.id} href={`/espace/formations/${c.id}`} className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              <p className="muted">
                {(c.modules || []).length} modules · {acces ? 'Accès inclus' : min ? 'À partir de ' + fcfa(min) : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
