import { connexion } from '../espace/actions';

export default function Connexion({ searchParams }: { searchParams: { envoye?: string; erreur?: string } }) {
  return (
    <>
      <div className="bar">
        <div className="logo">Flash<span>Academy</span></div>
      </div>
      <main>
        <h1>Connexion</h1>
        <div className="card">
          {searchParams.envoye && (
            <div className="msg">Un lien de connexion vient d'être envoyé. Ouvrez votre email et cliquez dessus.</div>
          )}
          {searchParams.erreur && (
            <div className="msg" style={{ background: '#fee2e2', color: '#991b1b' }}>
              Impossible d'envoyer le lien. Vérifiez l'adresse et réessayez.
            </div>
          )}
          <form action={connexion}>
            <label>Adresse email</label>
            <input name="email" type="email" required placeholder="vous@exemple.com" />
            <button className="btn block" style={{ marginTop: 14 }} type="submit">
              Recevoir le lien de connexion
            </button>
          </form>
          <p className="muted">Pas de mot de passe : un lien sécurisé est envoyé par email.</p>
        </div>
      </main>
    </>
  );
}
