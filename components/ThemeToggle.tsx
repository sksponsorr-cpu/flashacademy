'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [sombre, setSombre] = useState(false);

  useEffect(() => {
    setSombre(document.documentElement.dataset.theme === 'dark');
  }, []);

  const basculer = () => {
    const suivant = !sombre;
    setSombre(suivant);
    document.documentElement.dataset.theme = suivant ? 'dark' : 'light';
    try { localStorage.setItem('theme', suivant ? 'dark' : 'light'); } catch {}
  };

  return (
    <button type="button" className="theme-btn" onClick={basculer} aria-label={sombre ? 'Passer au thème clair' : 'Passer au thème sombre'}>
      {sombre ? '☀️' : '🌙'}
    </button>
  );
}
