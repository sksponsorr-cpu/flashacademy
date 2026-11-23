import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { demanderReinitialisation } from '../actions';

export default function MotDePasseOublie({ searchParams }: { searchParams: { envoye?: string } }) {
  return (
    <>
      <div className="bar">
        <Link href="/" className="logo">Flash<span>Academy</span></Link>
        <ThemeToggle />
        </div>
      <main className="auth">
        <div className="auth-head rv">
          <h1>Mot de passe oublié</h1>
          <p className="muted">Indiquez votre email. Vous recevrez un lien pour choisir un nouveau mot de passe.</p>
        </div>
        {searchParams.envoye ? (
          <div className="card auth-card rv">
            <strong>Email envoyé</strong>
            <p className="muted">Si un compte existe pour cette adresse, le lien arrive dans quelques instants.</p>
            <Link className="btn block cta" href="/connexion">Retour à la connexion</Link>
          </div>
        ) : (
          <div className="card auth-card rv">
            <form action={demanderReinitialisation}>
              <label>Adresse email</label>
              <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" />
              <button className="btn block cta" type="submit">Envoyer le lien</button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
