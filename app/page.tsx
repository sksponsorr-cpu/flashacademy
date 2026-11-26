import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import LecteurVideo from '@/components/LecteurVideo';
import { createClient } from '@/lib/supabase/server';
import { fcfa } from '@/lib/access';
import Compte from '@/components/Compte';

export const dynamic = 'force-dynamic';

const DEFAUT = {
  titre: 'Transformez vos idées en compétences qui rapportent.',
  texte: 'Des formations pratiques, un parcours clair et une communauté pour vous aider à passer à l’action, étape par étape.',
  video: '',
  probleme: [
    'Trop de contenus dispersés, sans véritable méthode',
    'Des conseils difficiles à appliquer à votre réalité',
    'La motivation est là, mais vous manquez d’un parcours structuré',
  ],
  fondateur_nom: '',
  fondateur_photo: '',
  fondateur: '',
  temoignages: [] as {
    nom: string;
    role: string;
    texte: string;
  }[],
  faq: [
    {
      q: 'Je débute complètement. Puis-je suivre les formations ?',
      a: 'Oui. Les parcours indiquent leur niveau et vous guident progressivement, étape par étape.',
    },
    {
      q: 'Comment accéder aux formations ?',
      a: 'Créez votre compte, choisissez une offre et votre accès sera activé après confirmation du paiement.',
    },
    {
      q: 'Puis-je apprendre depuis mon téléphone ?',
      a: 'Oui. FlashAcademy est conçu pour être consulté sur téléphone, tablette et ordinateur.',
    },
    {
      q: 'Puis-je devenir formateur ou partenaire ?',
      a: 'Vous pouvez contacter l’équipe pour présenter votre profil et votre proposition de collaboration.',
    },
  ],
};

const OFFRES_DEFAUT = [
  {
    name: 'Accès mensuel',
    price: 19000,
    per: 'Par mois',
    feat: ['Accès aux formations', 'Accès à la communauté'],
    best: false,
  },
  {
    name: 'Accès annuel',
    price: 65000,
    per: 'Pour 1 an',
    feat: [
      'Toutes les formations',
      'Sessions live incluses',
      'Mises à jour incluses',
      'Accès à la communauté',
    ],
    best: true,
  },
];

export default async function Accueil() {
  const supabase = createClient();

  const [{ data: reg }, { data: offres }, { data: cours }] =
    await Promise.all([
      supabase
        .from('settings')
        .select('value')
        .eq('key', 'accueil')
        .maybeSingle(),

      supabase
        .from('offers')
        .select('*')
        .order('price'),

      supabase
        .from('courses')
        .select('id,title,emoji')
        .order('id'),
    ]);

  const saisi: any = reg?.value || {};

  const a = {
    titre: saisi.titre || DEFAUT.titre,
    texte: saisi.texte || DEFAUT.texte,
    video: saisi.video || '',
    fondateur: saisi.fondateur || DEFAUT.fondateur,
    fondateur_photo: saisi.fondateur_photo || '',
    probleme: saisi.probleme?.length
      ? saisi.probleme
      : DEFAUT.probleme,
    temoignages: saisi.temoignages?.length
      ? saisi.temoignages
      : DEFAUT.temoignages,
    faq: saisi.faq?.length
      ? saisi.faq
      : DEFAUT.faq,
  };

  const liste: any[] = offres?.length
    ? offres
    : OFFRES_DEFAUT;

  const formations: any[] = cours || [];

  return (
    <>
      <style>{`
        .landing {
          --land-accent: var(--accent);
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 20px 50px;
        }

        .landing-bar {
          position: sticky;
          top: 0;
          z-index: 8;
          margin: 0 -20px;
          padding: 13px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: color-mix(
            in srgb,
            var(--bg) 86%,
            transparent
          );
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--line);
        }

        .landing-logo {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -.8px;
          margin-right: auto;
        }

        .landing-logo span {
          color: var(--accent);
        }

        .landing-hero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: grid;
          gap: 28px;
          align-items: center;
          padding: 54px 0 46px;
        }

        .landing-hero:before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: 0 -25vw;
          background:
            radial-gradient(
              ellipse at 20% 15%,
              rgba(79,140,255,.20),
              transparent 42%
            ),
            radial-gradient(
              ellipse at 85% 80%,
              rgba(139,92,246,.15),
              transparent 38%
            );
        }

        .landing-eyebrow {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          padding: 7px 12px;
          border: 1px solid var(--line);
          border-radius: 99px;
          background: var(--card);
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .landing-hero h1 {
          font-size: clamp(38px, 7vw, 66px);
          line-height: 1.01;
          letter-spacing: -2.5px;
          margin: 18px 0 16px;
          max-width: 780px;
        }

        .landing-hero p {
          max-width: 650px;
          color: var(--muted);
          font-size: clamp(16px, 2vw, 19px);
          line-height: 1.7;
          margin: 0;
        }

        .landing-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 25px;
        }

        .landing-actions .btn {
          min-width: 190px;
          padding: 15px 20px;
        }

        .landing-proof {
          display: flex;
          gap: 10px 22px;
          flex-wrap: wrap;
          margin-top: 23px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 650;
        }

        .landing-video {
          overflow: hidden;
          max-width: 920px;
          margin: 0 auto 12px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: #000;
          aspect-ratio: 16/9;
          box-shadow: 0 20px 55px rgba(0,0,0,.13);
        }

        .land-section {
          padding: 42px 0 8px;
        }

        .land-section-head {
          max-width: 700px;
          margin-bottom: 22px;
        }

        .land-section-head .pill {
          margin-bottom: 9px;
        }

        .land-section h2 {
          font-size: clamp(27px, 4vw, 38px);
          line-height: 1.1;
          letter-spacing: -1px;
          margin: 10px 0 12px;
        }

        .land-sub {
          color: var(--muted);
          font-size: 15px;
          line-height: 1.65;
          margin: 0;
        }

        .land-courses {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(190px, 1fr)
          );
          gap: 12px;
        }

        .land-course {
          padding: 18px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: var(--card);
          font-weight: 750;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .land-course-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: var(--soft);
          font-size: 21px;
        }

        .land-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%,250px),1fr)
          );
          gap: 14px;
        }

        .land-card {
          height: 100%;
          padding: 21px;
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--card);
        }

        .land-problem {
          display: grid;
          gap: 12px;
        }

        .land-problem-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 16px;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: var(--card);
          line-height: 1.5;
        }

        .land-cross {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          flex: 0 0 25px;
          border-radius: 50%;
          background: rgba(255,69,58,.1);
          color: var(--red);
          font-weight: 900;
        }

        .land-founder {
          display: grid;
          grid-template-columns: minmax(150px,.7fr) 1.3fr;
          gap: 22px;
          align-items: center;
        }

        .land-founder-photo {
          min-height: 250px;
          border-radius: 22px;
          background: linear-gradient(
            145deg,
            #1e3a8a,
            #2563eb 55%,
            #8b5cf6
          );
          background-position: center;
          background-size: cover;
        }

        .land-prices {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%,260px),1fr)
          );
          gap: 16px;
          align-items: stretch;
        }

        .land-price {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 23px;
          border: 1px solid var(--line);
          border-radius: 22px;
          background: var(--card);
        }

        .land-price.best {
          border: 1.5px solid var(--accent);
          background:
            linear-gradient(
              150deg,
              rgba(79,140,255,.12),
              transparent 50%
            ),
            var(--card);
          box-shadow: 0 14px 38px rgba(37,99,235,.1);
        }

        .land-price h3 {
          font-size: 19px;
        }

        .land-price-amount {
          font-size: clamp(27px,4vw,35px);
          font-weight: 900;
          letter-spacing: -1px;
        }

        .land-price ul {
          padding: 0;
          margin: 4px 0 12px;
          list-style: none;
          display: grid;
          gap: 9px;
        }

        .land-price li {
          font-size: 14px;
          color: var(--muted);
        }

        .land-faq {
          padding: 6px 20px;
        }

        .land-faq details {
          border-top: 1px solid var(--line);
          padding: 17px 0;
        }

        .land-faq details:first-child {
          border-top: 0;
        }

        .land-faq summary {
          font-weight: 750;
          cursor: pointer;
          list-style: none;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .land-faq summary:after {
          content: '+';
          color: var(--accent);
          font-size: 21px;
        }

        .land-faq details[open] summary:after {
          content: '−';
        }

        .land-faq p {
          color: var(--muted);
          margin: 9px 0 0;
          line-height: 1.6;
        }

        .land-final {
          margin: 42px 0 0;
          padding: 34px 24px;
          border-radius: 26px;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(255,255,255,.22),
              transparent 35%
            ),
            linear-gradient(
              120deg,
              #1d4ed8,
              #6255d9 65%,
              #7c3aed
            );
          color: white;
          text-align: center;
        }

        .land-final h2 {
          color: white;
          margin-top: 0;
        }

        .land-final p {
          max-width: 590px;
          margin: 0 auto 20px;
          color: rgba(255,255,255,.83);
          line-height: 1.6;
        }

        .land-footer {
          text-align: center;
          padding: 30px 0 10px;
          color: var(--muted);
          font-size: 12px;
        }

        @media(min-width:800px) {
          .landing-hero {
            min-height: 490px;
          }

          .land-founder {
            grid-template-columns: 280px 1fr;
          }

          .land-founder-photo {
            min-height: 330px;
          }
        }

        @media(max-width:560px) {
          .landing {
            padding-left: 16px;
            padding-right: 16px;
          }

          .landing-bar {
            margin: 0 -16px;
            padding: 12px 16px;
          }

          .landing-hero {
            padding: 42px 0 34px;
          }

          .landing-hero h1 {
            letter-spacing: -1.7px;
          }

          .landing-actions {
            display: grid;
          }

          .landing-actions .btn {
            width: 100%;
          }

          .land-section {
            padding-top: 32px;
          }

          .land-founder {
            grid-template-columns: 1fr;
          }

          .land-founder-photo {
            min-height: 210px;
            aspect-ratio: 16/10;
          }
        }
      `}</style>

      <div className="landing">

        <header className="landing-bar">
          <div className="landing-logo">
            Flash<span>Academy</span>
          </div>

          <ThemeToggle />

          <Link className="btn sm" href="/connexion">
            Se connecter
          </Link>
        </header>

        <section className="landing-hero">
          <div>
            <span className="landing-eyebrow">
              ✦ Formations · Pratique · Communauté
            </span>

            <h1>{a.titre}</h1>

            <p>{a.texte}</p>

            <div className="landing-actions">
              <Link className="btn" href="/connexion">
                Découvrir les formations
                <span aria-hidden="true"> →</span>
              </Link>

              <Link className="btn ghost" href="#offres">
                Voir les offres
              </Link>
            </div>

            <div className="landing-proof">
              <span>✓ Parcours structurés</span>
              <span>✓ Accès sur mobile</span>
              <span>✓ Apprenez à votre rythme</span>
            </div>
          </div>
        </section>

        {a.video && (
          <div className="landing-video">
            <LecteurVideo url={a.video} />
          </div>
        )}

        <section className="land-section">
          <div className="land-section-head">
            <span className="pill">L’apprentissage</span>

            <h2>
              Des compétences utiles. Un parcours clair.
            </h2>

            <p className="land-sub">
              Explorez des domaines concrets et avancez avec
              des contenus organisés en modules.
            </p>
          </div>

          <div className="land-courses">
            {formations.length > 0 ? (
              formations.map((c: any) => (
                <div key={c.id} className="land-course">
                  <span className="land-course-icon">
                    {c.emoji || '✦'}
                  </span>

                  <span>{c.title}</span>
                </div>
              ))
            ) : (
              <>
                <div className="land-course">
                  <span className="land-course-icon">🎵</span>
                  <span>Création et monétisation TikTok</span>
                </div>

                <div className="land-course">
                  <span className="land-course-icon">🚀</span>
                  <span>Création de projets SaaS</span>
                </div>

                <div className="land-course">
                  <span className="land-course-icon">🎬</span>
                  <span>Montage et création vidéo</span>
                </div>
              </>
            )}
          </div>
        </section>

        {a.temoignages.length > 0 && (
          <section className="land-section">
            <div className="land-section-head">
              <span className="pill">Témoignages</span>
              <h2>Leurs expériences</h2>
            </div>

            <div className="land-grid">
              {a.temoignages.map((t: any, i: number) => (
                <article key={i} className="land-card">
                  <div
                    className="row"
                    style={{ marginBottom: 12 }}
                  >
                    <div className="avatar">
                      {(t.nom || '?').charAt(0)}
                    </div>

                    <div>
                      <strong>{t.nom}</strong>
                      <div className="muted">{t.role}</div>
                    </div>
                  </div>

                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    « {t.texte} »
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="land-section">
          <div className="land-section-head">
            <span className="pill">Notre approche</span>

            <h2>
              Moins de dispersion. Plus de méthode.
            </h2>

            <p className="land-sub">
              Apprendre en ligne peut devenir compliqué lorsqu’on
              ne sait pas quoi suivre ni dans quel ordre.
            </p>
          </div>

          <div className="land-problem">
            {a.probleme.map((p: string, i: number) => (
              <div key={i} className="land-problem-item">
                <span className="land-cross">×</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </section>

        {a.fondateur && (
          <section className="land-section">
            <div className="land-founder">
              <div
                className="land-founder-photo"
                style={
                  a.fondateur_photo
                    ? {
                        backgroundImage:
                          `url('${a.fondateur_photo}')`,
                      }
                    : {}
                }
              />

              <div>
                <span className="pill">Le fondateur</span>

                <h2>
                  Une vision tournée vers la progression.
                </h2>

                {a.fondateur_nom && (
                  <strong>{a.fondateur_nom}</strong>
                )}

                <p
                  className="land-sub"
                  style={{ marginTop: 10 }}
                >
                  {a.fondateur}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="land-section" id="offres">
          <div className="land-section-head">
            <span className="pill">Les offres</span>

            <h2>Choisissez votre formule.</h2>

            <p className="land-sub">
              Un accès adapté à votre rythme d’apprentissage.
              Comparez les avantages avant de choisir.
            </p>
          </div>

          <div className="land-prices">
            {liste.map((o: any, i: number) => (
              <article
                key={o.id ?? i}
                className={`land-price ${
                  o.best ? 'best' : ''
                }`}
              >
                {o.best && (
                  <span className="tag">
                    ✦ Le plus choisi
                  </span>
                )}

                <h3>{o.name}</h3>

                <div className="land-price-amount">
                  {fcfa(o.price)}
                </div>

                <div className="muted">{o.per}</div>

                <ul>
                  {(o.feat || []).map(
                    (f: string, j: number) => (
                      <li key={j}>
                        <span
                          style={{
                            color: 'var(--green)',
                            fontWeight: 900,
                            marginRight: 8,
                          }}
                        >
                          ✓
                        </span>
                        {f}
                      </li>
                    )
                  )}
                </ul>

                <Link className="btn block" href="/connexion">
                  Choisir cette formule →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <Compte
          fin={saisi.compte_a_rebours?.fin || ''}
          places={saisi.compte_a_rebours?.places || 0}
        />

        <section className="land-section">
          <div className="land-section-head">
            <span className="pill">Besoin d’aide ?</span>
            <h2>Questions fréquentes</h2>
          </div>

          <div className="land-card land-faq">
            {a.faq.map((f: any, i: number) => (
              <details key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="land-final">
          <h2>Prêt à passer à l’action ?</h2>

          <p>
            Créez votre compte, choisissez votre parcours et
            commencez à développer de nouvelles compétences
            avec FlashAcademy.
          </p>

          <Link
            className="btn"
            href="/connexion"
            style={{
              background: '#fff',
              color: '#2454c5',
              boxShadow: 'none',
            }}
          >
            Rejoindre FlashAcademy →
          </Link>
        </section>

        <footer className="land-footer">
          © {new Date().getFullYear()} FlashAcademy.
          Tous droits réservés.
        </footer>

      </div>
    </>
  );
            }
