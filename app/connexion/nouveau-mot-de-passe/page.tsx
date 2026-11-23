import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { nouveauMotDePasse } from '../actions';

const ERREURS: Record<string, string> = {
  court: 'Le mot de passe doit contenir au moins 8 caractères.',
  echec: 'Le lien a expiré. Refaites une demande de réinitialisation.',
};

export default function NouveauMotDePasse({ searchParams }: { searchParams: { erreur?: string } }) {
  return (
    <>
      <div className="bar">
        <Link href="/" className="logo">Flash<span>Academy</span></Link>
        <ThemeToggle />
        </div>
      <main className="auth">
        <div className="auth-head rv">
          <h1>Nouveau mot de passe</h1>
          <p className="muted">Choisissez un mot de passe d’au moins 8 caractères.</p>
        </div>
        {searchParams.erreur && <div className="msg erreur rv">{ERREURS[searchParams.erreur]}</div>}
        <div className="card auth-card rv">
          <form action={nouveauMotDePasse}>
            <label>Nouveau mot de passe</label>
            <input name="motdepasse" type="password" required minLength={8} autoComplete="new-password" />
            <button className="btn block cta" type="submit">Enregistrer</button>
          </form>
        </div>
      </main>
    </>
  );
}
