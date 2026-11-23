import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { seConnecter, creerCompte } from './actions';

const ERREURS: Record<string, string> = {
  identifiants: 'Email ou mot de passe incorrect.',
  inscription: 'Impossible de créer le compte. Cette adresse est peut-être déjà utilisée.',
  motdepasse: 'Le mot de passe doit contenir au moins 8 caractères.',
};

export default function Connexion({ searchParams }: { searchParams: { erreur?: string; onglet?: string } }) {
  const inscription = searchParams.onglet === 'inscription';
  return (
    <>
      <div className="bar">
        <Link href="/" className="logo">Flash<span>Academy</span></Link>
        <ThemeToggle />
        </div>
      <main className="auth">
        <div className="auth-head rv">
          <h1>{inscription ? 'Créer votre compte' : 'Bon retour'}</h1>
          <p className="muted">
            {inscription
              ? 'Quelques secondes suffisent. Un code de confirmation vous sera envoyé par email.'
              : 'Connectez-vous pour accéder à vos formations et à la communauté.'}
          </p>
        </div>

        <div className="seg rv">
          <Link href="/connexion" className={!inscription ? 'on' : ''}>Se connecter</Link>
          <Link href="/connexion?onglet=inscription" className={inscription ? 'on' : ''}>S’inscrire</Link>
        </div>

        {searchParams.erreur && <div className="msg erreur rv">{ERREURS[searchParams.erreur] || 'Une erreur est survenue.'}</div>}

        <div className="card auth-card rv">
          {inscription ? (
            <form action={creerCompte}>
              <label>Nom affiché</label>
              <input name="nom" required autoComplete="name" placeholder="Votre prénom" />
              <label>Adresse email</label>
              <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" />
              <label>Mot de passe (8 caractères minimum)</label>
              <input name="motdepasse" type="password" required minLength={8} autoComplete="new-password" />
              <button className="btn block cta" type="submit">Créer mon compte</button>
            </form>
          ) : (
            <form action={seConnecter}>
              <label>Adresse email</label>
              <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" />
              <label>Mot de passe</label>
              <input name="motdepasse" type="password" required autoComplete="current-password" />
              <button className="btn block cta" type="submit">Se connecter</button>
              <div className="auth-links">
                <Link href="/connexion/mot-de-passe-oublie">Mot de passe oublié ?</Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
