'use client';

import { useEffect, useState } from 'react';

export default function Compte({ fin, places }: { fin: string; places: number }) {
  const [reste, setReste] = useState<number | null>(null);

  useEffect(() => {
    if (!fin) return;
    const calc = () => setReste(Math.max(0, new Date(fin).getTime() - Date.now()));
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [fin]);

  if (!fin || reste === null || reste === 0) return null;

  const h = Math.floor(reste / 3600000);
  const m = Math.floor((reste % 3600000) / 60000);
  const s = Math.floor((reste % 60000) / 1000);
  const deux = (n: number) => String(n).padStart(2, '0');

  return (
    <section style={{ marginTop: 28 }}>
      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg,#0b1a44,#1e3a8a)', color: '#fff', border: 'none' }}>
        <h3 style={{ color: '#fff', fontSize: 20 }}>Offre de lancement</h3>
        {places > 0 && <p style={{ opacity: 0.85 }}>Plus que {places} places disponibles</p>}
        <div className="row" style={{ justifyContent: 'center', gap: 10, margin: '14px 0' }}>
          {[['Heures', h], ['Minutes', m], ['Secondes', s]].map(([label, val]) => (
            <div key={label as string} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '10px 12px', minWidth: 70 }}>
              <b style={{ display: 'block', fontSize: 24 }}>{deux(val as number)}</b>
              <small style={{ opacity: 0.8, fontSize: 11, textTransform: 'uppercase' }}>{label}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
