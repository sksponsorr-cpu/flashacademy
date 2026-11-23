import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { verifierCode, renvoyerCode } from '../actions';

export default function Verifier({ searchParams }: { searchParams: { email?: string; erreur?: string; info?: string } }) {
  const email = searchParams.email || '';
  return (
    <>
      <div className="bar">
        <Link href="/" className="logo">Flash<span>Academy</span></Link>
        <ThemeToggle />
        </div>
      <main className="auth">
        <div className="auth-head rv">
          <span className="pill">Vérification</span>
          <h1>Saisissez votre code</h1>
          <p className="muted">
            Nous avons envoyé un code à 6 chiffres à <strong>{email || 'votre adresse'}</strong>. Pensez à vérifier vos spams.
          </p>
        </div>
        {searchParams.erreur && <div className="msg erreur rv">Code incorrect ou expiré. Vérifiez-le ou demandez un nouvel envoi.</div>}
        {searchParams.info === 'renvoye' && <div className="msg rv">Un nouveau code vient d’être envoyé.</div>}
        <div className="card auth-card rv">
          <form action={verifierCode}>
            <input type="hidden" name="email" value={email} />
            <label>Code de confirmation</label>
            <input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className="code" autoComplete="one-time-code" placeholder="000000" />
            <button className="btn block cta" type="submit">Valider mon compte</button>
          </form>
          <form action={renvoyerCode} style={{ marginTop: 12 }}>
            <input type="hidden" name="email" value={email} />
            <button className="btn ghost block" type="submit">Renvoyer le code</button>
          </form>
        </div>
        <p className="muted" style={{ textAlign: 'center' }}>
          Mauvaise adresse ? <Link href="/connexion?onglet=inscription" style={{ color: 'var(--accent)', fontWeight: 600 }}>Recommencer l’inscription</Link>
        </p>
      </main>
    </>
  );
}
