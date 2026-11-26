import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { payerOffre } from '../paiement/actions';

export const dynamic = 'force-dynamic';

export default async function Offres({ searchParams }: { searchParams: { erreur?: string } }) {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);
  const { data: offres } = await supabase.from('offers').select('*').order('price');

  return (
    <>
      <h1>Offres</h1>
      <p className="muted">
        {acces ? 'Vous avez accès à toutes les formations.' : 'Choisissez une offre pour débloquer les formations, les modules et la messagerie.'}
      </p>
      {searchParams.erreur && <div className="msg erreur">Le paiement n'a pas pu être lancé ({searchParams.erreur}). Réessayez.</div>}
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
              <form action={payerOffre} style={{ display: 'grid', gap: 8 }}>
                <input type="hidden" name="offre" value={o.id} />
                <select name="pays" defaultValue="CM" style={{ marginTop: 0 }}>
                  <option value="CM">Cameroun</option>
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="SN">Sénégal</option>
                  <option value="BJ">Bénin</option>
                  <option value="TG">Togo</option>
                </select>
                <button className="btn block" type="submit">Payer {fcfa(o.price)}</button>
              </form>
            )}
          </div>
        ))}
      </div>
      {!acces && (
        <p className="muted" style={{ marginTop: 12 }}>
          Le paiement se fait par mobile money, sur la page sécurisée FlashPay. L'accès s'active dès la confirmation.
        </p>
      )}
    </>
  );
}
