import { lienIntegration } from '@/lib/media';

// Lit la vidéo directement sur le site : YouTube et Vimeo en lecteur intégré, fichier direct en lecteur natif.
export default function LecteurVideo({ url, poster }: { url?: string | null; poster?: string | null }) {
  if (!url) {
    return <span style={{ color: '#fff', opacity: 0.85 }}>▶ Vidéo bientôt disponible</span>;
  }
  const integration = lienIntegration(url);
  if (integration) {
    return (
      <iframe
        src={integration}
        title="Vidéo"
        style={{ width: '100%', height: '100%', border: 0, minHeight: 200 }}
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return <video src={url} poster={poster || undefined} controls playsInline style={{ width: '100%', height: '100%' }} />;
  }
  return <span style={{ color: '#fff', opacity: 0.85 }}>Lien vidéo non reconnu</span>;
}
