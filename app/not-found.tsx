import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="auth" style={{ textAlign: 'center' }}>
      <h1>Page introuvable</h1>
      <p className="muted">Le lien que vous avez suivi n’existe pas ou a été déplacé.</p>
      <Link className="btn" href="/espace">Retour à l’accueil</Link>
    </main>
  );
}
