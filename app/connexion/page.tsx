import Link from 'next/link';
import { seConnecter, creerCompte } from './actions';

export default function Connexion({ searchParams }: { searchParams: { erreur?: string; info?: string } }) {
  return (
    <>
      <div className="bar">
        <Link href="/" className="logo">Flash<span>Academy</span></Link>
      </div>

      <main style={{ paddingTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span className="pill">Espace membre</span>
          <h1 style={{ marginTop: 14 }}>Bienvenue</h1>
          <p className="muted">Connectez-vous pour accéder à vos formations, à la communauté et à Agence Ami.</p>
        </div>

        {searchParams.erreur && <div className="msg erreur">{searchParams.erreur}</div>}
        {searchParams.info && <div className="msg">{searchParams.info}</div>}

        <div className="card" style={{ padding: 22 }}>
          <h3>Se connecter</h3>
          <p className="muted" style={{ marginTop: 0 }}>Vous avez déjà un compte.</p>
          <form action={seConnecter}>
            <label>Adresse email</label>
            <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" />
            <label>Mot de passe</label>
            <input name="motdepasse" type="password" required autoComplete="current-password" />
            <button className="btn block" style={{ marginTop: 20, padding: 14 }} type="submit">Se connecter</button>
          </form>
        </div>

        <details className="card" style={{ padding: 22 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>Pas encore de compte ? Créer mon compte</summary>
          <form action={creerCompte} style={{ marginTop: 16 }}>
            <label>Adresse email</label>
            <input name="email" type="email" required autoComplete="email" placeholder="vous@exemple.com" />
            <label>Mot de passe (6 caractères minimum)</label>
            <input name="motdepasse" type="password" required minLength={6} autoComplete="new-password" />
            <button className="btn block ghost" style={{ marginTop: 20, padding: 14 }} type="submit">Créer mon compte</button>
          </form>
        </details>
      </main>
    </>
  );
}
