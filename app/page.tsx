import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fcfa } from '@/lib/access';
import Compte from '@/components/Compte';

export const dynamic = 'force-dynamic';

export default async function Accueil() {
  const supabase = createClient();
  const [{ data: reg }, { data: offres }, { data: cours }] = await Promise.all([
    supabase.from('settings').select('value').eq('key', 'accueil').maybeSingle(),
    supabase.from('offers').select('*').order('price'),
    supabase.from('courses').select('id,title,level,emoji').order('id'),
  ]);
  const a: any = reg?.value || {};
  const temoignages: any[] = a.temoignages || [];
  const probleme: string[] = a.probleme || [];
  const faq: any[] = a.faq || [];

  return (
    <>
      <div className="bar">
        <div className="logo">Flash<span>Academy</span></div>
        <Link className="btn sm" href="/connexion">Rejoindre</Link>
      </div>

      <main>
        {/* Accroche */}
        <section style={{ textAlign: 'center', padding: '26px 6px 10px' }}>
          <span className="tag">Formations · Live · Communauté</span>
          <h1 style={{ fontSize: 34, lineHeight: 1.12, margin: '16px 0 14px' }}>{a.titre}</h1>
          <p className="muted" style={{ fontSize: 17 }}>{a.texte}</p>
          <Link className="btn block" href="/connexion" style={{ maxWidth: 420, margin: '18px auto 6px' }}>
            Rejoindre Flash Academy
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>Accès immédiat après inscription</div>
        </section>

        {/* Vidéo de présentation */}
        <div
          className="card"
          style={{
            aspectRatio: '16/9', display: 'grid', placeItems: 'center', padding: 0, overflow: 'hidden',
            background: 'linear-gradient(135deg,#0b1a44,#2563eb 60%,#8b5cf6)', marginTop: 20,
          }}
        >
          {a.video ? (
            <a href={a.video} target="_blank" rel="noopener" style={{ color: '#fff', fontWeight: 700 }}>
              ▶ Regarder la vidéo de présentation
            </a>
          ) : (
            <span style={{ color: '#fff', opacity: 0.8 }}>Vidéo de présentation (à ajouter dans le bureau admin)</span>
          )}
        </div>

        {/* Formations */}
        <section style={{ marginTop: 28 }}>
          <span className="tag">Les formations</span>
          <h2>Des formations <span style={{ color: 'var(--accent)' }}>concrètes</span>, sans jargon</h2>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {(cours || []).map((c: any) => (
              <span key={c.id} className="card" style={{ padding: '8px 14px', margin: 0, borderRadius: 99 }}>
                {c.emoji} {c.title}
              </span>
            ))}
            {(!cours || cours.length === 0) && <span className="muted">Les formations seront affichées ici.</span>}
          </div>
        </section>

        {/* Témoignages */}
        {temoignages.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <span className="tag">Témoignages</span>
            <h2>Ils ont déjà <span style={{ color: 'var(--accent)' }}>avancé</span></h2>
            <div className="grid">
              {temoignages.map((t: any, i: number) => (
                <div key={i} className="card" style={{ marginBottom: 0 }}>
                  <div className="row" style={{ marginBottom: 10 }}>
                    <div className="avatar" style={{ width: 42, height: 42 }}>{(t.nom || '?').charAt(0)}</div>
                    <div>
                      <strong>{t.nom}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>{t.role}</div>
                    </div>
                  </div>
                  <p style={{ margin: 0 }}>« {t.texte} »</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Problème */}
        {probleme.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <span className="tag">Le problème</span>
            <h2>Vous voulez gagner de l’argent en ligne, mais <span style={{ color: 'var(--accent)' }}>vous ne savez pas par où commencer</span> ?</h2>
            <div className="card">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {probleme.map((p, i) => (
                  <li key={i} className="muted" style={{ marginBottom: 10 }}>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>✕ </span>{p}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Fondateur */}
        <section style={{ marginTop: 28 }}>
          <span className="tag">Le fondateur</span>
          <div
            style={{
              width: '100%', aspectRatio: '4/5', borderRadius: 20, marginTop: 10, marginBottom: 14,
              background: a.fondateur_photo
                ? `url('${a.fondateur_photo}') center/cover`
                : 'linear-gradient(160deg,#1f2937,#0f172a)',
            }}
          />
          <h2>Un fondateur qui <span style={{ color: 'var(--accent)' }}>accompagne</span> au quotidien</h2>
          <p className="muted">{a.fondateur}</p>
        </section>

        {/* Offres */}
        <section style={{ marginTop: 28 }}>
          <span className="tag">Nos offres</span>
          <h2>Choisissez votre <span style={{ color: 'var(--accent)' }}>offre</span></h2>
          <div className="offers">
            {(offres || []).map((o: any) => (
              <div key={o.id} className="card" style={o.best ? { borderColor: 'var(--accent)' } : {}}>
                {o.best && <span className="tag">Le plus choisi</span>}
                <h3 style={{ marginTop: 6 }}>{o.name}</h3>
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  {fcfa(o.price)} <span className="muted" style={{ fontSize: 14, fontWeight: 500 }}>{o.per}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0' }}>
                  {(o.feat || []).map((f: string) => (
                    <li key={f} className="muted" style={{ marginBottom: 8 }}>
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ </span>{f}
                    </li>
                  ))}
                </ul>
                <Link className="btn block" href="/connexion">Choisir {o.name}</Link>
              </div>
            ))}
            {(!offres || offres.length === 0) && <div className="card muted">Les offres seront affichées ici.</div>}
          </div>
        </section>

        {/* Compte à rebours (seulement si une date est définie dans le bureau admin) */}
        <Compte fin={a.compte_a_rebours?.fin || ''} places={a.compte_a_rebours?.places || 0} />

        {/* FAQ */}
        <section style={{ marginTop: 28 }}>
          <span className="tag">Questions fréquentes</span>
          <h2>Vos questions</h2>
          <div className="card">
            {faq.map((f: any, i: number) => (
              <details key={i} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{f.q}</summary>
                <p className="muted" style={{ marginBottom: 0 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Appel final */}
        <div className="card" style={{ textAlign: 'center', marginTop: 28, padding: 28, background: 'linear-gradient(135deg,#1e3a8a,#2563eb 60%,#8b5cf6)', color: '#fff', border: 'none' }}>
          <h2 style={{ color: '#fff', marginTop: 0 }}>Prêt à passer à l’action ?</h2>
          <p style={{ opacity: 0.9 }}>Rejoignez la communauté et commencez votre première formation aujourd’hui.</p>
          <Link className="btn" href="/connexion" style={{ background: '#fff', color: 'var(--accent)' }}>
            Rejoindre Flash Academy
          </Link>
        </div>
      </main>

      <footer className="muted" style={{ textAlign: 'center', padding: 24, fontSize: 13 }}>
        © 2026 Flash Academy
      </footer>
    </>
  );
            }
