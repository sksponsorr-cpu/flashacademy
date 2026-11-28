'use client';

import { useState } from 'react';
import { lienIntegration } from '@/lib/media';

// Lit la vidéo sur le site : YouTube / Vimeo en lecteur intégré, sinon fichier vidéo direct (mp4, webm, mov, ou tout lien https).
export default function LecteurVideo({ url, poster }: { url?: string | null; poster?: string | null }) {
  const [erreur, setErreur] = useState(false);

  if (!url) {
    return <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#fff', opacity: 0.85 }}>Vidéo bientôt disponible</div>;
  }

  const integration = lienIntegration(url);
  if (integration) {
    return (
      <iframe
        src={integration}
        title="Vidéo"
        style={{ width: '100%', height: '100%', border: 0 }}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (erreur) {
    return <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#fff', padding: 16, textAlign: 'center' }}>La vidéo ne peut pas être lue. Vérifiez le lien.</div>;
  }

  return (
    <video
      key={url}
      src={url}
      poster={poster || undefined}
      controls
      playsInline
      preload="none"
      onError={() => setErreur(true)}
      style={{ width: '100%', height: '100%', background: '#000' }}
    />
  );
}
