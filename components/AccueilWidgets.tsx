'use client';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(
  () => import('@/components/ThemeToggle'),
  { ssr: false }
);

const LecteurVideo = dynamic(
  () => import('@/components/LecteurVideo'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: '100%',
        height: '100%',
        background: '#111827',
        display: 'grid',
        placeItems: 'center',
        color: 'white'
      }}>
        Chargement de la vidéo...
      </div>
    )
  }
);

const Compte = dynamic(
  () => import('@/components/Compte'),
  { ssr: false }
);

export function AccueilTheme() {
  return <ThemeToggle />;
}

export function AccueilVideo({ url }: { url: string }) {
  return <LecteurVideo url={url} />;
}

export function AccueilCompte({
  fin,
  places
}: {
  fin: string;
  places: number;
}) {
  return <Compte fin={fin} places={places} />;
}
