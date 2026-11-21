import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { activerAccesDemo } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Offres({ searchParams }: { searchParams: { ok?: string } }) {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);
  const { data: offres } = await supabase.from('offers').select('*').order('price');

  return (
    <>
      <h1>Offres</h1>
      <p className="muted">
        {acces ? 'Vous avez accès à toutes les formations.' : 'Choisissez une offre pour débloquer les formations, les modules et la messagerie.'}
      </p>
      {searchParams.ok && <div className="msg">Accès activé.</div>}
      <div className="offers" style={{ marginTop: 12 }}>
        {(offres || []).map((o: any) => (
          <div key={o.id} className="card">
            {o.best && <span className="tag">Le plus choisi</span>}
            <h3>{o.name}</h3>
            <div style={{ fontSize: 30, fontWeight: 800 }}>
              {fcfa(o.price)} <span className="muted" style={{ fontSize: 14 }}>{o.per}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {(o.feat || []).map((f: string) => <li key={f} className="muted">✓ {f}</li>)}
            </ul>
            {acces ? (
              <span className="btn off block" style={{ textAlign: 'center' }}>Offre active</span>
            ) : (
              <form action={activerAccesDemo}>
                <button className="btn block" type="submit">Choisir {o.name}</button>
              </form>
            )}
          </div>
        ))}
      </div>
      {!acces && (
        <p className="muted" style={{ marginTop: 12 }}>
          Démonstration : le bouton active l'accès sans paiement. Le paiement réel sera branché plus tard.
        </p>
      )}
    </>
  );
}
