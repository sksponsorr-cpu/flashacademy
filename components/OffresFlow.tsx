'use client';

import { useState } from 'react';
import { fcfa } from '@/lib/access';
import { TAUX, convertir } from '@/lib/devises';

type Offre = {
  id: number;
  name: string;
  price: number;
  per: string;
  feat: string[] | null;
  best: boolean;
};

type Etape = 'choix' | 'avantages' | 'paiement';

// Parcours d'achat en trois temps : choisir, découvrir les avantages, payer.
export default function OffresFlow({
  offres,
  pays,
  payer,
  erreur,
}: {
  offres: Offre[];
  pays: readonly (readonly [string, string])[];
  payer: (fd: FormData) => Promise<void>;
  erreur?: string;
}) {
  const [etape, setEtape] = useState<Etape>('choix');
  const [choisie, setChoisie] = useState<Offre | null>(null);
  const [code, setCode] = useState('CM');

  const etapes: { cle: Etape; libelle: string }[] = [
    { cle: 'choix', libelle: 'Offre' },
    { cle: 'avantages', libelle: 'Avantages' },
    { cle: 'paiement', libelle: 'Paiement' },
  ];
  const indexEtape = etapes.findIndex((e) => e.cle === etape);

  return (
    <div className="flow">
      <style>{`
        .flow { max-width: 980px; margin: 0 auto; }
        .flow-steps { display: flex; justify-content: center; gap: 10px; margin: 6px 0 28px; flex-wrap: wrap; }
        .flow-step { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
        .flow-step b { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: var(--line); color: var(--text); font-size: 12px; }
        .flow-step.on { color: var(--text); font-weight: 700; }
        .flow-step.on b { background: var(--accent); color: #fff; }
        .flow-line { width: 36px; height: 2px; background: var(--line); }
        @keyframes monte { from { opacity: 0; transform: translateY(18px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
        .anim { animation: monte .7s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
        .cartes { display: grid; gap: 18px; grid-template-columns: 1fr; }
        @media (min-width: 760px) { .cartes { grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); } }
        .carte-offre { position: relative; text-align: left; border: 1px solid var(--line); border-radius: 22px; padding: 26px; background: var(--card, #fff); cursor: pointer; transition: transform .35s cubic-bezier(.16,1,.3,1), border-color .3s, box-shadow .3s; font: inherit; color: inherit; }
        .carte-offre:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: 0 18px 44px rgba(79,140,255,.18); }
        .carte-offre.best { border: 2px solid var(--accent); }
        .badge { position: absolute; top: -12px; left: 24px; background: var(--accent); color: #fff; font-size: 12px; font-weight: 700; padding: 5px 13px; border-radius: 99px; }
        .prix { font-size: 40px; font-weight: 850; letter-spacing: -1px; margin: 10px 0 2px; }
        .liste-avantages { list-style: none; padding: 0; margin: 18px 0 0; display: grid; gap: 12px; }
        .liste-avantages li { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; }
        .coche { width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
        .bouton-principal { display: block; width: 100%; border: 0; border-radius: 16px; padding: 16px; font: inherit; font-weight: 700; font-size: 16px; color: #fff; background: linear-gradient(135deg, var(--accent), #8b5cf6); box-shadow: 0 12px 30px rgba(79,140,255,.3); cursor: pointer; transition: transform .25s; }
        .bouton-principal:hover { transform: translateY(-2px); }
        .bouton-retour { background: none; border: 0; color: var(--muted); font: inherit; cursor: pointer; padding: 10px 0; }
        .champ { display: grid; gap: 6px; margin-bottom: 14px; }
        .champ label { font-size: 13px; font-weight: 700; }
        .champ input, .champ select { min-height: 48px; padding: 11px 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--card, #fff); color: inherit; font: inherit; }
        .resume { border: 1px solid var(--line); border-radius: 18px; padding: 18px; margin-bottom: 18px; background: var(--card, #fff); }
        .conversion { font-size: 13px; color: var(--muted); margin-top: 6px; }
        .conversion b { color: var(--text); }
      `}</style>

      {erreur && (
        <div className="msg erreur" style={{ marginBottom: 18 }}>
          Le paiement n’a pas pu être lancé (code : {erreur}). Vérifiez vos informations et réessayez.
        </div>
      )}

      <div className="flow-steps">
        {etapes.map((e, i) => (
          <span key={e.cle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`flow-step ${i <= indexEtape ? 'on' : ''}`}>
              <b>{i + 1}</b>
              {e.libelle}
            </span>
            {i < etapes.length - 1 && <span className="flow-line" />}
          </span>
        ))}
      </div>

      {etape === 'choix' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 24 }} className="anim">
            <h1 style={{ margin: 0 }}>Choisissez votre formule</h1>
            <p className="muted" style={{ marginTop: 8 }}>Un seul paiement, accès immédiat après confirmation.</p>
          </div>
          <div className="cartes">
            {offres.map((o, i) => (
              <button
                key={o.id}
                type="button"
                className={`carte-offre anim ${o.best ? 'best' : ''}`}
                style={{ ['--d' as any]: `${i * 120}ms` }}
                onClick={() => {
                  setChoisie(o);
                  setEtape('avantages');
                }}
              >
                {o.best && <span className="badge">Le plus choisi</span>}
                <h3 style={{ margin: 0 }}>{o.name}</h3>
                <div className="prix">{fcfa(o.price)}</div>
                <div className="muted">{o.per}</div>
                <div style={{ marginTop: 18, color: 'var(--accent)', fontWeight: 700 }}>Voir ce que j’obtiens →</div>
              </button>
            ))}
          </div>
          {offres.length === 0 && <p className="muted" style={{ textAlign: 'center' }}>Aucune offre disponible pour le moment.</p>}
        </>
      )}

      {etape === 'avantages' && choisie && (
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="anim" style={{ ['--d' as any]: '0ms' }}>
            <span className="muted" style={{ fontSize: 13 }}>Vous choisissez</span>
            <h1 style={{ margin: '4px 0 0' }}>{choisie.name}</h1>
            <div className="prix">{fcfa(choisie.price)}</div>
            <div className="muted">{choisie.per}</div>
          </div>
          <h3 className="anim" style={{ ['--d' as any]: '200ms', marginTop: 26 }}>Ce que vous recevez</h3>
          <ul className="liste-avantages">
            {(choisie.feat || []).map((f, i) => (
              <li key={f} className="anim" style={{ ['--d' as any]: `${300 + i * 140}ms` }}>
                <span className="coche">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="anim" style={{ ['--d' as any]: `${400 + (choisie.feat || []).length * 140}ms`, marginTop: 30 }}>
            <button type="button" className="bouton-principal" onClick={() => setEtape('paiement')}>
              Continuer
            </button>
            <button type="button" className="bouton-retour" onClick={() => setEtape('choix')}>
              ← Changer d’offre
            </button>
          </div>
        </div>
      )}

      {etape === 'paiement' && choisie && (
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="resume anim">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>{choisie.name}</strong>
                <div className="muted" style={{ fontSize: 13 }}>{choisie.per}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 20 }}>{fcfa(choisie.price)}</strong>
                <div className="conversion">
                  {convertir(choisie.price, code)
                    ? <>Soit environ <b>{convertir(choisie.price, code)}</b> (indicatif)</>
                    : 'Montant en FCFA'}
                </div>
              </div>
            </div>
          </div>

          <form action={payer} className="anim" style={{ ['--d' as any]: '150ms' }}>
            <input type="hidden" name="offre" value={choisie.id} />
            <div className="champ">
              <label htmlFor="nom">Votre nom complet</label>
              <input id="nom" name="nom" required minLength={2} maxLength={100} autoComplete="name" placeholder="Nom et prénom" />
            </div>
            <div className="champ">
              <label htmlFor="mobile">Votre numéro mobile money</label>
              <input id="mobile" name="mobile" type="tel" required autoComplete="tel" placeholder="Numéro mobile" />
            </div>
            <div className="champ">
              <label htmlFor="pays">Votre pays</label>
              <select id="pays" name="pays" value={code} onChange={(e) => setCode(e.target.value)} required>
                {pays.map(([c, nom]) => (
                  <option key={c} value={c}>{nom}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bouton-principal">
              Payer {fcfa(choisie.price)}
            </button>
            <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              Paiement mobile money sécurisé avec FlashPay. Votre e-mail est récupéré automatiquement depuis votre compte.
            </p>
          </form>
          <button type="button" className="bouton-retour" onClick={() => setEtape('avantages')}>
            ← Retour aux avantages
          </button>
        </div>
      )}
    </div>
  );
}
