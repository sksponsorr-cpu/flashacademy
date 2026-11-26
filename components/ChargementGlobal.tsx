'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Retour visuel immédiat sur tout le site :
// - une barre bleue en haut dès qu'on clique sur un lien ou qu'on envoie un formulaire ;
// - les boutons du formulaire envoyé sont désactivés (plus de double clic) et affichent « … ».
// La barre disparaît au changement de page, ou au plus tard après 10 secondes.
export default function ChargementGlobal() {
  const [actif, setActif] = useState(false);
  const chemin = usePathname();

  useEffect(() => {
    setActif(false);
  }, [chemin]);

  useEffect(() => {
    let minuteur: ReturnType<typeof setTimeout> | undefined;

    const demarrer = () => {
      setActif(true);
      clearTimeout(minuteur);
      minuteur = setTimeout(() => setActif(false), 10000);
    };

    const auClic = (e: MouseEvent) => {
      const lien = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!lien || lien.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(lien.href, location.href);
      if (url.origin === location.origin && url.pathname !== location.pathname) demarrer();
    };

    const auEnvoi = (e: Event) => {
      const formulaire = e.target as HTMLFormElement;
      demarrer();
      setTimeout(() => {
        formulaire.querySelectorAll<HTMLButtonElement>('button[type="submit"],button:not([type])').forEach((b) => {
          b.disabled = true;
          b.setAttribute('aria-busy', 'true');
        });
      }, 0);
      setTimeout(() => {
        formulaire.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
          b.disabled = false;
          b.removeAttribute('aria-busy');
        });
      }, 10000);
    };

    document.addEventListener('click', auClic, true);
    document.addEventListener('submit', auEnvoi, true);
    return () => {
      document.removeEventListener('click', auClic, true);
      document.removeEventListener('submit', auEnvoi, true);
      clearTimeout(minuteur);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes fa-barre { 0% { width: 0% } 60% { width: 75% } 100% { width: 90% } }
        .fa-barre-chargement { position: fixed; top: 0; left: 0; height: 3px; z-index: 9999; background: var(--accent, #2563eb); border-radius: 0 3px 3px 0; animation: fa-barre 8s ease-out forwards; pointer-events: none; }
      `}</style>
      {actif && <div className="fa-barre-chargement" role="progressbar" aria-label="Chargement" />}
    </>
  );
}
