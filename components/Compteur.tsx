'use client';

import { useEffect, useRef, useState } from 'react';

// Affiche un nombre réel. Il s'anime de 0 jusqu'à la valeur quand il entre à l'écran.
// La valeur initiale vient du serveur : aucun « 0 » ne s'affiche avant le chargement.
export default function Compteur({ valeur }: { valeur: number }) {
  const [affiche, setAffiche] = useState(valeur);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    let fait = false;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || fait) return;
        fait = true;
        obs.disconnect();
        const debut = performance.now();
        const duree = 1600;
        const tick = (t: number) => {
          const p = Math.min(1, (t - debut) / duree);
          setAffiche(Math.round(valeur * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        setAffiche(0);
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [valeur]);

  return (
    <span ref={ref}>
      {affiche.toLocaleString('fr-FR')}
      {valeur > 0 ? '+' : ''}
    </span>
  );
}
