import Link from 'next/link';
import { AccueilVideo, AccueilCompte } from '@/components/AccueilWidgets';
import StatsAccueil from '@/components/StatsAccueil';
import Reveal from '@/components/Reveal';
import { createClient } from '@/lib/supabase/server';
import { fcfa } from '@/lib/access';

export const dynamic = 'force-dynamic';

const TITRE_MOTS = ['Lancez', 'votre', 'activité', 'en', 'ligne,'];
const TITRE_COULEUR = ['pas', 'à', 'pas.'];

export default async function Accueil() {
  const supabase = createClient();

  const [{ data: reg }, { data: offres }, { data: cours }] = await Promise.all([
    supabase.from('settings').select('value').eq('key', 'accueil').maybeSingle(),
    supabase.from('offers').select('id,name,price,per,feat,best').order('price'),
    supabase.from('courses').select('id,title,level,emoji').order('id').limit(3),
  ]);

  const saisi: any = reg?.value || {};
  const video: string = saisi.video || '';
  const compte = saisi.compte_a_rebours || {};

  return (
    <div className="lp">
      <style>{`
        .lp{--bg:#05060b;--card:#0f1220;--line:rgba(255,255,255,.08);--text:#f4f5f8;--muted:#9aa1b5;--blue:#4f8cff;--violet:#8b5cf6;--ease:cubic-bezier(.16,1,.3,1);background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;margin:-24px -20px;overflow-x:hidden}
        .lp *{box-sizing:border-box}
        .lp a{color:inherit;text-decoration:none}
        .lp .container{width:min(1180px,calc(100% - 40px));margin:0 auto}
        .lp .nav{position:fixed;top:0;left:0;right:0;z-index:50;transition:background .4s,border-color .4s;border-bottom:1px solid transparent}
        .lp .nav.scrolled{background:rgba(5,6,11,.75);backdrop-filter:blur(18px);border-color:var(--line)}
        .lp .nav-in{display:flex;align-items:center;justify-content:space-between;height:68px}
        .lp .logo{font-weight:800;font-size:19px;letter-spacing:-.3px;display:flex;align-items:center;gap:10px}
        .lp .logo i{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,var(--blue),var(--violet));display:inline-block}
        .lp .links{display:flex;gap:30px;font-size:14px;color:var(--muted)}
        .lp .links a:hover{color:var(--text)}
        .lp .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;padding:13px 24px;font-weight:600;font-size:15px;transition:transform .35s var(--ease),box-shadow .35s,background .3s}
        .lp .btn-main{background:linear-gradient(135deg,var(--blue),#3b7bff);color:#fff;box-shadow:0 10px 30px rgba(79,140,255,.35)}
        .lp .btn-main:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(79,140,255,.5)}
        .lp .btn-ghost{background:rgba(255,255,255,.06);color:var(--text);border:1px solid var(--line)}
        .lp .btn-ghost:hover{background:rgba(255,255,255,.1)}
        .lp .btn-sm{padding:9px 16px;font-size:14px}
        .lp .hero{position:relative;padding:150px 0 40px;text-align:center;overflow:hidden}
        .lp .hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse at 50% 30%,#000 30%,transparent 75%);pointer-events:none}
        .lp .glow{position:absolute;width:760px;height:760px;left:50%;top:-260px;transform:translateX(-50%);background:radial-gradient(circle,rgba(79,140,255,.28),rgba(139,92,246,.12) 45%,transparent 70%);filter:blur(10px);pointer-events:none;animation:lp-respire 9s ease-in-out infinite}
        @keyframes lp-respire{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.08)}}
        .lp .pill{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.03);font-size:13px;color:var(--muted);position:relative}
        .lp .pill b{color:var(--text);font-weight:600}
        .lp .dot{width:7px;height:7px;border-radius:50%;background:#30d158;box-shadow:0 0 10px #30d158;animation:lp-clignote 2s infinite}
        @keyframes lp-clignote{50%{opacity:.4}}
        .lp h1{font-size:clamp(42px,6.4vw,84px);line-height:1.02;letter-spacing:-2.4px;font-weight:750;margin:26px auto 22px;max-width:1000px}
        .lp h1 .mot{display:inline-block;opacity:0;transform:translateY(.35em);filter:blur(8px);animation:lp-mot 1s var(--ease) forwards;animation-delay:var(--d)}
        @keyframes lp-mot{to{opacity:1;transform:none;filter:none}}
        .lp .grad{background:linear-gradient(120deg,var(--blue) 0%,#a78bfa 55%,var(--violet) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
        .lp .sub{font-size:clamp(16px,1.6vw,19px);color:var(--muted);line-height:1.6;max-width:640px;margin:0 auto 34px;opacity:0;animation:lp-monte 1s var(--ease) .9s forwards}
        @keyframes lp-monte{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        .lp .ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;opacity:0;animation:lp-monte 1s var(--ease) 1.1s forwards}
        .lp .scene{position:relative;margin:70px auto 0;width:min(1040px,100%);height:520px;perspective:1600px;opacity:0;animation:lp-monte 1.2s var(--ease) 1.5s forwards}
        .lp .ordi{position:absolute;left:50%;top:0;width:min(860px,92%);transform:translateX(-50%) rotateX(12deg);transform-origin:top;border-radius:20px;border:1px solid var(--line);background:linear-gradient(180deg,#11152a,#0a0d1a);box-shadow:0 50px 120px rgba(0,0,0,.6);overflow:hidden}
        .lp .barre{height:38px;display:flex;align-items:center;gap:7px;padding:0 16px;border-bottom:1px solid var(--line)}
        .lp .barre i{width:11px;height:11px;border-radius:50%;background:#ff5f57}.lp .barre i:nth-child(2){background:#febc2e}.lp .barre i:nth-child(3){background:#28c840}
        .lp .barre span{margin:0 auto;font-size:12px;color:var(--muted);background:rgba(255,255,255,.04);padding:4px 60px;border-radius:8px}
        .lp .dash{display:grid;grid-template-columns:170px 1fr;min-height:330px}
        .lp .side{border-right:1px solid var(--line);padding:18px 12px;display:grid;align-content:start;gap:6px;font-size:13px;color:var(--muted)}
        .lp .side div{padding:9px 12px;border-radius:10px}
        .lp .side .on{background:rgba(79,140,255,.14);color:#cfe0ff}
        .lp .main{padding:20px;display:grid;gap:14px}
        .lp .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .lp .kpi{border:1px solid var(--line);border-radius:14px;padding:14px;background:rgba(255,255,255,.02)}
        .lp .kpi small{color:var(--muted);font-size:11px}
        .lp .kpi strong{display:block;font-size:20px;margin-top:6px}
        .lp .graph{border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;align-items:flex-end;gap:10px;height:170px}
        .lp .graph b{flex:1;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,var(--blue),rgba(79,140,255,.15));height:0;animation:lp-barre 1.4s var(--ease) forwards;animation-delay:var(--d)}
        @keyframes lp-barre{to{height:var(--h)}}
        .lp .tel{position:absolute;right:4%;bottom:-40px;width:230px;height:470px;border-radius:40px;border:8px solid #1a1d2b;background:#05060b;box-shadow:0 40px 90px rgba(0,0,0,.7);overflow:hidden;animation:lp-flotte 6s ease-in-out infinite;z-index:3}
        @keyframes lp-flotte{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .lp .encoche{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:84px;height:24px;border-radius:20px;background:#000;z-index:2}
        .lp .ecran{padding:52px 18px 18px;text-align:left;height:100%;display:grid;align-content:start;gap:12px}
        .lp .ecran h4{font-size:18px;line-height:1.2}
        .lp .ecran p{color:var(--muted);font-size:12px;line-height:1.5}
        .lp .ecran .bouton{background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;text-align:center;border-radius:12px;padding:10px;font-size:13px;font-weight:600}
        .lp .etape{border:1px solid var(--line);border-radius:12px;padding:10px;font-size:12px;display:flex;gap:10px;align-items:center;color:var(--muted)}
        .lp .etape b{width:22px;height:22px;border-radius:50%;background:#30d158;color:#000;display:grid;place-items:center;font-size:11px;flex-shrink:0}
        .lp .bloc{padding:120px 0}
        .lp .titre-sec{text-align:center;margin-bottom:56px}
        .lp .titre-sec small{color:var(--blue);font-weight:600;letter-spacing:1.5px;text-transform:uppercase;font-size:12px}
        .lp .titre-sec h2{font-size:clamp(32px,4.4vw,52px);letter-spacing:-1.4px;line-height:1.08;margin-top:14px}
        .lp .titre-sec p{color:var(--muted);margin-top:14px;font-size:17px}
        .lp .grille{display:grid;gap:18px;grid-template-columns:1fr}
        @media(min-width:860px){.lp .grille{grid-template-columns:repeat(3,1fr)}}
        .lp .carte{position:relative;border:1px solid var(--line);border-radius:24px;padding:30px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));transition:transform .5s var(--ease),border-color .4s;display:block}
        .lp .carte:hover{transform:translateY(-6px);border-color:rgba(79,140,255,.45)}
        .lp .ico{width:48px;height:48px;border-radius:14px;background:rgba(79,140,255,.12);display:grid;place-items:center;font-size:22px;margin-bottom:22px}
        .lp .carte h3{font-size:21px;letter-spacing:-.4px;margin-bottom:10px}
        .lp .carte p{color:var(--muted);line-height:1.6;font-size:15px}
        .lp .offres{display:grid;gap:18px;grid-template-columns:1fr;max-width:920px;margin:0 auto}
        @media(min-width:760px){.lp .offres{grid-template-columns:1fr 1fr}}
        .lp .offre{border:1px solid var(--line);border-radius:26px;padding:34px;background:var(--card);position:relative;transition:transform .5s var(--ease),box-shadow .4s}
        .lp .offre:hover{transform:translateY(-6px)}
        .lp .offre.best{border:1.5px solid var(--blue);box-shadow:0 30px 80px rgba(79,140,255,.18)}
        .lp .offre .badge{position:absolute;top:-13px;left:34px;background:linear-gradient(135deg,var(--blue),var(--violet));font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px}
        .lp .offre h3{font-size:22px}
        .lp .prix{font-size:44px;font-weight:750;letter-spacing:-2px;margin:14px 0 4px}
        .lp .prix small{font-size:15px;color:var(--muted);font-weight:500;letter-spacing:0}
        .lp .offre ul{list-style:none;margin:24px 0 30px;padding:0;display:grid;gap:12px}
        .lp .offre li{display:flex;gap:12px;color:#d7dbe7;font-size:15px}
        .lp .offre li::before{content:"✓";width:20px;height:20px;border-radius:50%;background:rgba(48,209,88,.15);color:#30d158;display:grid;place-items:center;font-size:12px;font-weight:800;flex-shrink:0}
        .lp .offre .btn{width:100%}
        .lp .vide{color:var(--muted);text-align:center;font-size:15px}
        .lp .final{text-align:center;padding:120px 0 140px;position:relative;overflow:hidden}
        .lp .final h2{font-size:clamp(34px,5vw,60px);letter-spacing:-1.8px;line-height:1.05;position:relative}
        .lp .final p{color:var(--muted);margin:18px 0 34px;font-size:17px;position:relative}
        .lp footer{border-top:1px solid var(--line);padding:30px 0;color:var(--muted);font-size:14px}
        .lp footer .container{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .lp .video-une{margin:0 auto;max-width:960px;padding:0 20px}
        @media(max-width:860px){
          .lp .links{display:none}
          .lp .hero{padding-top:120px}
          .lp .scene{height:430px}
          .lp .dash{grid-template-columns:1fr}
          .lp .side{display:none}
          .lp .tel{width:180px;height:370px;right:50%;transform:translateX(50%);bottom:-70px}
        }
        @media (prefers-reduced-motion:reduce){.lp *{animation:none!important;transition:none!important}.lp .sub,.lp .ctas,.lp .scene,.lp h1 .mot{opacity:1!important;transform:none!important;filter:none!important}}
      `}</style>

      <nav className="nav" id="lp-nav">
        <div className="container nav-in">
          <Link className="logo" href="/"><i />Flash Academy</Link>
          <div className="links">
            <a href="#formations">Formations</a>
            <a href="#offres">Offres</a>
            <Link href="/connexion">Connexion</Link>
          </div>
          <Link className="btn btn-main btn-sm" href="/connexion">Rejoindre</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="glow" />
        <div className="container" style={{ position: 'relative' }}>
          <span className="pill"><span className="dot" /><b>Nouveau</b> Formations TikTok, Instagram et vente en ligne</span>
          <h1>
            {TITRE_MOTS.map((m, i) => (
              <span key={m} className="mot" style={{ ['--d' as any]: `${0.1 + i * 0.15}s` }}>{m} </span>
            ))}
            {TITRE_COULEUR.map((m, i) => (
              <span key={m} className="mot grad" style={{ ['--d' as any]: `${0.85 + i * 0.15}s` }}>{m} </span>
            ))}
          </h1>
          <p className="sub">Des formations claires, des modules à votre rythme et une communauté qui avance avec vous. Passez de l’idée à vos premiers résultats.</p>
          <div className="ctas">
            <Link className="btn btn-main" href="#offres">Commencer maintenant →</Link>
            <Link className="btn btn-ghost" href="#formations">Voir les formations</Link>
          </div>

          <div className="scene">
            <div className="ordi">
              <div className="barre"><i /><i /><i /><span>flashacademy.app/espace</span></div>
              <div className="dash">
                <div className="side">
                  <div className="on">Accueil</div><div>Formations</div><div>Messages</div><div>Mes transactions</div><div>Membres</div><div>Profil</div>
                </div>
                <div className="main">
                  <div className="kpis">
                    <div className="kpi"><small>Formations</small><strong>Pas à pas</strong></div>
                    <div className="kpi"><small>Modules</small><strong>Courts</strong></div>
                    <div className="kpi"><small>Communauté</small><strong>Active</strong></div>
                  </div>
                  <div className="graph">
                    {[38, 52, 44, 68, 58, 80, 72, 96, 84, 110, 92, 124].map((h, i) => (
                      <b key={i} style={{ ['--h' as any]: `${h}px`, ['--d' as any]: `${1.8 + i * 0.07}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="tel">
              <div className="encoche" />
              <div className="ecran">
                <h4>Votre premier module est prêt.</h4>
                <p>Commencez par l’introduction, puis avancez module après module.</p>
                <div className="etape"><b>✓</b> Introduction</div>
                <div className="etape"><b>2</b> Module 1 : Tout savoir</div>
                <div className="etape"><b>3</b> Module 2 : Monter son compte</div>
                <div className="bouton">Continuer la formation</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {video && (
        <section className="bloc" style={{ paddingTop: 60 }}>
          <div className="video-une">
            <AccueilVideo url={video} />
          </div>
        </section>
      )}

      <section className="bloc" id="formations">
        <div className="container">
          <Reveal className="titre-sec">
            <small>Formations</small>
            <h2>Des parcours pensés pour passer à l’action.</h2>
            <p>Chaque formation est découpée en modules courts, avec des exercices concrets.</p>
          </Reveal>
          <div className="grille">
            {(cours || []).length === 0 && <p className="vide">Les formations arrivent très bientôt.</p>}
            {(cours || []).map((c: any, i: number) => (
              <Reveal key={c.id} delai={i * 120}>
                <Link className="carte" href={`/espace/formations/${c.id}`}>
                  <div className="ico">{c.emoji || '🎓'}</div>
                  <h3>{c.title}</h3>
                  <p>{c.level || 'Tous niveaux'} · Découvrir la formation →</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bloc" style={{ paddingTop: 40 }}>
        <div className="container">
          <StatsAccueil />
        </div>
      </section>

      <section className="bloc" id="offres">
        <div className="container">
          <Reveal className="titre-sec">
            <small>Offres</small>
            <h2>Une formule pour chaque étape.</h2>
            <p>Un paiement, un accès immédiat après confirmation.</p>
          </Reveal>

          {compte?.fin && (
            <div style={{ marginBottom: 28 }}>
              <AccueilCompte fin={compte.fin || ''} places={compte.places || 0} />
            </div>
          )}

          <div className="offres">
            {(offres || []).length === 0 && <p className="vide">Aucune offre disponible pour le moment.</p>}
            {(offres || []).map((o: any, i: number) => (
              <Reveal key={o.id} delai={i * 150} className={`offre ${o.best ? 'best' : ''}`}>
                {o.best && <span className="badge">Le plus choisi</span>}
                <h3>{o.name}</h3>
                <div className="prix">{fcfa(o.price)} <small>{o.per}</small></div>
                <ul>
                  {(o.feat || []).map((f: string) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link className={`btn ${o.best ? 'btn-main' : 'btn-ghost'}`} href="/espace/offres">
                  Choisir cette offre
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="final">
        <div className="container">
          <Reveal>
            <h2>Prêt à lancer votre première activité ?</h2>
            <p>Rejoignez Flash Academy aujourd’hui et commencez votre premier module ce soir.</p>
            <Link className="btn btn-main" href="/connexion">Rejoindre Flash Academy →</Link>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="container">
          <span>© Flash Academy</span>
          <span>Paiement mobile money sécurisé avec FlashPay</span>
        </div>
      </footer>
    </div>
  );
}
