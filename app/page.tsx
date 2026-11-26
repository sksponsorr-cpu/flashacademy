import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import LecteurVideo from '@/components/LecteurVideo';
import { createClient } from '@/lib/supabase/server';
import { fcfa } from '@/lib/access';
import Compte from '@/components/Compte';

export const dynamic = 'force-dynamic';

// Contenu de secours : affiché si la base est vide ou incomplète
const DEFAUT = {
  titre: 'Lancez votre activité en ligne avec des formations claires',
  texte: "Formations en modules, sessions live et communauté : tout ce qu’il faut pour passer de l’idée à vos premiers résultats.",
  video: '',
  probleme: [
    'Trop de vidéos gratuites, sans plan clair',
    'Des conseils qui ne marchent pas dans votre contexte',
    'L’envie est là, mais les résultats tardent',
  ],
  fondateur_nom: '',
  fondateur_photo: '',
  fondateur: '',
  temoignages: [] as { nom: string; role: string; texte: string }[],
  faq: [
    { q: 'Je n’ai aucune compétence technique, est-ce que je peux suivre ?', a: 'Oui. Les formations sont pensées pour les débutants, avec des explications étape par étape.' },
    { q: 'Comment accéder aux formations après inscription ?', a: 'Vous choisissez une offre, puis vous accédez à toutes les formations et à leurs modules.' },
    { q: 'Puis-je suivre depuis mon téléphone ?', a: 'Oui, l’espace est pensé pour le mobile.' },
    { q: 'Puis-je devenir partenaire ?', a: 'Oui, sur invitation de l’équipe. Vous publiez vos formations et percevez une rémunération.' },
  ],
};

const OFFRES_DEFAUT = [
  { name: 'Accès mensuel', price: 19000, per: 'Par mois', feat: ['Accès aux formations', 'Accès à la communauté'], best: false },
  { name: 'Accès annuel', price: 65000, per: 'Pour 1 an', feat: ['Toutes les formations', 'Sessions live incluses', 'Mises à jour incluses', 'Accès à la communauté'], best: true },
];

export default async function Accueil() {
  const supabase = createClient();
  const [{ data: reg }, { data: offres }, { data: cours }] = await Promise.all([
    supabase.from('settings').select('value').eq('key', 'accueil').maybeSingle(),
    supabase.from('offers').select('*').order('price'),
    supabase.from('courses').select('id,title,emoji').order('id'),
  ]);

  const saisi: any = reg?.value || {};
  const a = {
    titre: saisi.titre || DEFAUT.titre,
    texte: saisi.texte || DEFAUT.texte,
    video: saisi.video || '',
    fondateur: saisi.fondateur || DEFAUT.fondateur,
    fondateur_photo: saisi.fondateur_photo || '',
    probleme: saisi.probleme?.length ? saisi.probleme : DEFAUT.probleme,
    temoignages: saisi.temoignages?.length ? saisi.temoignages : DEFAUT.temoignages,
    faq: saisi.faq?.length ? saisi.faq : DEFAUT.faq,
  };
  const liste: any[] = offres?.length ? offres : OFFRES_DEFAUT;
  const formations: any[] = cours || [];

  return (
    <>
      <div className="bar">
        <div className="logo">Flash<span>Academy</span>  <ThemeToggle />
        </div>
        <Link className="btn sm" href="/connexion">Rejoindre</Link>
      </div>

      <main>
        {/* Accroche */}
        <section style={{ textAlign: 'center', padding: '26px 6px 10px' }}>
          <span className="pill">Formations · Live · Communauté</span>
          <h1 style={{ fontSize: 34, margin: '16px 0 14px' }}>{a.titre}</h1>
          <p className="muted" style={{ fontSize: 17 }}>{a.texte}</p>
          <Link className="btn block" href="/connexion" style={{ maxWidth: 420, margin: '18px auto 6px', padding: 16, fontSize: 17 }}>
            Rejoindre Flash Academy
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>Accès immédiat après inscription</div>
        </section>

        {/* Vidéo de présentation */}
        {a.video && (
          <div
            className="card"
            style={{ width: '100%', maxWidth: 960, margin: '20px auto 0', padding: 0, overflow: 'hidden', aspectRatio: '16/9', borderRadius: 20 }}
          >
            <LecteurVideo url={a.video} />
          </div>
        )}

        {/* Formations */}
        <section style={{ marginTop: 28 }}>
          <span className="pill">Les formations</span>
          <h2>Des formations <span style={{ color: 'var(--accent)' }}>concrètes</span>, sans jargon</h2>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {formations.length > 0 ? formations.map((c: any) => (
              <span key={c.id} className="card" style={{ padding: '8px 14px', margin: 0, borderRadius: 99 }}>{c.emoji} {c.title}</span>
            )) : (
              <>
                <span className="card" style={{ padding: '8px 14px', margin: 0, borderRadius: 99 }}>🎵 Formation TikTok</span>
                <span className="card" style={{ padding: '8px 14px', margin: 0, borderRadius: 99 }}>🚀 Formation SaaS</span>
                <span className="card" style={{ padding: '8px 14px', margin: 0, borderRadius: 99 }}>🎬 Formation Montage Vidéo</span>
              </>
            )}
          </div>
        </section>

        {a.temoignages.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <span className="pill">Témoignages</span>
          <h2>Ils ont déjà <span style={{ color: 'var(--accent)' }}>avancé</span></h2>
          <div className="grid">
            {a.temoignages.map((t: any, i: number) => (
              <div key={i} className="card lift" style={{ marginBottom: 0 }}>
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
        <section style={{ marginTop: 28 }}>
          <span className="pill">Le problème</span>
          <h2>Vous voulez gagner de l’argent en ligne, mais <span style={{ color: 'var(--accent)' }}>vous ne savez pas par où commencer</span> ?</h2>
          <div className="card">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {a.probleme.map((p: string, i: number) => (
                <li key={i} className="muted" style={{ marginBottom: 12 }}>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>✕ </span>{p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Fondateur */}
        {a.fondateur && (
        <section style={{ marginTop: 28 }}>
          <span className="pill">Le fondateur</span>
          <div
            style={{
              width: '100%', aspectRatio: '4/5', borderRadius: 20, marginTop: 12, marginBottom: 14,
              background: a.fondateur_photo ? `url('${a.fondateur_photo}') center/cover` : 'linear-gradient(160deg,#1f2937,#0f172a)',
            }}
          />
          <h2>Un fondateur qui <span style={{ color: 'var(--accent)' }}>accompagne</span> au quotidien</h2>
          <p className="muted">{a.fondateur}</p>
        </section>

        )}

        {/* Offres */}
        <section style={{ marginTop: 28 }}>
          <span className="pill">Nos offres</span>
          <h2>Choisissez votre <span style={{ color: 'var(--accent)' }}>offre</span></h2>
          <div className="offers">
            {liste.map((o: any, i: number) => (
              <div key={o.id ?? i} className="card" style={o.best ? { borderColor: 'var(--accent)', boxShadow: '0 14px 40px rgba(79,140,255,.18)' } : {}}>
                {o.best && <span className="tag">Le plus choisi</span>}
                <h3 style={{ marginTop: 8 }}>{o.name}</h3>
                <div style={{ fontSize: 32, fontWeight: 800 }}>
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
          </div>
        </section>

        {/* Compte à rebours : affiché seulement si une date de fin est saisie */}
        <Compte fin={saisi.compte_a_rebours?.fin || ''} places={saisi.compte_a_rebours?.places || 0} />

        {/* FAQ */}
        <section style={{ marginTop: 28 }}>
          <span className="pill">Questions fréquentes</span>
          <h2>Vos questions</h2>
          <div className="card faq">
            {a.faq.map((f: any, i: number) => (
              <details key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Appel final */}
        <div className="card hero" style={{ textAlign: 'center', marginTop: 28, padding: 28 }}>
          <h2 style={{ color: '#fff', marginTop: 0 }}>Prêt à passer à l’action ?</h2>
          <p style={{ opacity: 0.9 }}>Rejoignez la communauté et commencez votre première formation aujourd’hui.</p>
          <Link className="btn" href="/connexion" style={{ background: '#fff', color: 'var(--accent)' }}>
            Rejoindre Flash Academy
          </Link>
        </div>
      </main>

      <footer className="muted" style={{ textAlign: 'center', padding: 24, fontSize: 13 }}>© {new Date().getFullYear()} Flash Academy</footer>
    </>
  );
                               }
