import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fcfa } from '@/lib/access';

export const dynamic = 'force-dynamic';

export default async function Accueil() {
  const supabase = createClient();
  const [{ data: reg }, { data: offres }] = await Promise.all([
    supabase.from('settings').select('value').eq('key', 'accueil').maybeSingle(),
    supabase.from('offers').select('*').order('price'),
  ]);
  const a: any = reg?.value || {};

  return (
    <>
      <div className="bar">
        <div className="logo">Flash<span>Academy</span></div>
        <Link className="btn sm" href="/connexion">Rejoindre</Link>
      </div>
      <main>
        <section style={{ textAlign: 'center', padding: '26px 6px 10px' }}>
          <h1 style={{ fontSize: 34 }}>{a.titre || 'Bienvenue sur Flash Academy'}</h1>
          <p className="muted" style={{ fontSize: 17 }}>{a.texte}</p>
          <Link className="btn block" href="/connexion" style={{ maxWidth: 420, margin: '16px auto' }}>
            Rejoindre Flash Academy
          </Link>
        </section>

        {a.video && (
          <div className="card">
            <a href={a.video} target="_blank" rel="noopener">▶ Voir la vidéo de présentation</a>
          </div>
        )}

        <h2>Nos offres</h2>
        <div className="offers">
          {(offres || []).map((o: any) => (
            <div key={o.id} className="card">
              {o.best && <span className="tag">Le plus choisi</span>}
              <h3>{o.name}</h3>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {fcfa(o.price)} <span className="muted" style={{ fontSize: 14 }}>{o.per}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {(o.feat || []).map((f: string) => (
                  <li key={f} className="muted">✓ {f}</li>
                ))}
              </ul>
              <Link className="btn block" href="/connexion">Choisir {o.name}</Link>
            </div>
          ))}
        </div>

        <h2>Vos questions</h2>
        <div className="card">
          {(a.faq || []).map((f: any, i: number) => (
            <details key={i} style={{ padding: '10px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{f.q}</summary>
              <p className="muted">{f.a}</p>
            </details>
          ))}
        </div>

        {a.fondateur && (
          <>
            <h2>Le fondateur</h2>
            <p className="muted">{a.fondateur}</p>
          </>
        )}
      </main>
    </>
  );
}
