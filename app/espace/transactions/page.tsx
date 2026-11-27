import { session } from '@/lib/session';
import { fcfa, peutAcceder } from '@/lib/access';

export const dynamic = 'force-dynamic';

const dateFR = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

export default async function Transactions() {
  const { supabase, profil } = await session();
  const actif = peutAcceder(profil);

  // La politique RLS « paiements propres » ne renvoie que les lignes de l'utilisateur connecté.
  const { data: paiements } = await supabase
    .from('paiements')
    .select('id,montant,pays,transaction_id,flashpay_ref,created_at,offers(name)')
    .order('created_at', { ascending: false });

  const liste = (paiements || []) as any[];

  return (
    <>
      <h1>Mes transactions</h1>
      <p className="muted">Historique de vos paiements et état de votre abonnement.</p>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <span className="muted" style={{ fontSize: 13 }}>Abonnement</span>
            <h3 style={{ margin: '4px 0 0' }}>{actif ? 'Actif' : 'Inactif'}</h3>
          </div>
          {!actif && (
            <a className="btn sm" href="/espace/offres">Choisir une offre</a>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 18, margin: '22px 0 10px' }}>Paiements</h2>

      {liste.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>Aucun paiement pour le moment.</p>
        </div>
      ) : (
        liste.map((t) => (
          <div key={t.id} className="card" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{t.offers?.name || 'Offre'}</strong>
                <p className="muted" style={{ margin: '4px 0 0' }}>{dateFR(t.created_at)} · {t.pays}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{fcfa(t.montant)}</strong>
                <p className="lock" style={{ margin: '4px 0 0' }}>
                  {t.flashpay_ref ? 'Confirmé' : 'En attente'}
                </p>
              </div>
            </div>
            <p className="lock" style={{ margin: '10px 0 0', wordBreak: 'break-all' }}>
              Réf. {t.transaction_id}
            </p>
          </div>
        ))
      )}
    </>
  );
}
