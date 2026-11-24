// Transforme un lien YouTube ou Vimeo en adresse d'intégration (lecteur intégré).
// Renvoie null si le lien n'est pas reconnu.
export function lienIntegration(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const hote = u.hostname.replace(/^www\./, '');
    if (hote === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (hote.endsWith('youtube.com')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (hote.endsWith('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}
