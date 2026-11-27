'use client';

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

// Fait apparaître son contenu en douceur quand il entre dans l'écran.
// `delai` (ms) permet de décaler plusieurs éléments pour un effet en cascade.
export default function Reveal({
  children,
  delai = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delai?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }
    const obs = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('in');
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style = { '--d': `${delai}ms` } as CSSProperties;

  return (
    <Tag ref={ref as any} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}
