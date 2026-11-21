import { seConnecter, creerCompte } from './actions';

const erreurs: Record<string, string> = {
  identifiants: 'Email ou mot de passe incorrect.',
  inscription: "Inscription impossible. Le mot de passe doit contenir au moins 6 caractères, ou cet email existe déjà.",
};

export default function Connexion({ searchParams }: { searchParams: { erreur?: string } }) {
  const message = searchParams.erreur ? erreurs[searchParams.erreur] : '';

  return (
    <>
      <div className="bar">
        <div className="logo">Flash<span>Academy</span></div>
      </div>
      <main>
        <h1>Connexion</h1>
        {message && (
          <div className="msg" style={{ background: '#fee2e2', color: '#991b1b' }}>{message}</div>
        )}

        <div className="card">
          <h3>Me connecter</h3>
          <form action={seConnecter}>
            <label>Adresse email</label>
            <input name="email" type="email" required placeholder="vous@exemple.com" />
            <label>Mot de passe</label>
            <input name="motdepasse" type="password" required />
            <button className="btn block" style={{ marginTop: 14 }} type="submit">Se connecter</button>
          </form>
        </div>

        <div className="card">
          <h3>Créer mon compte</h3>
          <form action={creerCompte}>
            <label>Adresse email</label>
            <input name="email" type="email" required placeholder="vous@exemple.com" />
            <label>Mot de passe (6 caractères minimum)</label>
            <input name="motdepasse" type="password" required minLength={6} />
            <button className="btn block ghost" style={{ marginTop: 14 }} type="submit">Créer mon compte</button>
          </form>
        </div>
      </main>
    </>
  );
}
