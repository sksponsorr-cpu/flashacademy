import { accorderAccesManuel } from '@/app/espace/admin/acces-actions';

// Formulaire admin : accorder un abonnement à un membre (e-mail ou identifiant).
export default function AccesManuel({ offres }: { offres: { id: number; name: string }[] }) {
  return (
    <div className="card">
      <h3>Donner un accès manuellement</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Pour un membre qui a payé hors plateforme. Indiquez son e-mail de compte.
      </p>
      <form action={accorderAccesManuel}>
        <label>E-mail du membre</label>
        <input name="cible" type="text" required placeholder="nom@exemple.com" />
        <label>Offre accordée</label>
        <select name="offre" required defaultValue={offres[0]?.id}>
          {offres.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <button className="btn block" style={{ marginTop: 12 }} type="submit">
          Activer l’accès
        </button>
      </form>
    </div>
  );
}
