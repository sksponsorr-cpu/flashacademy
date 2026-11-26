import Link from 'next/link';
import { confirmerPaiement } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Succes({ searchParams }: { searchParams: { tx?: string } }) {
  const tx = searchParams?.tx || '';
  const etat = tx ? await confirmerPaiement(tx) : 'echec';

  if (etat === 'ok') {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: 24 }}>
        <h1 style={{ margin: '0 0 8px' }}>Paiement reçu ✓</h1>
        <p className="muted">Votre accès est activé. Bonne formation !</p>
        <Link className="btn" href="/espace/formations">Voir les formations</Link>
      </div>
    );
  }
  if (etat === 'attente') {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: 24 }}>
        <h1 style={{ margin: '0 0 8px' }}>Paiement en attente</h1>
        <p className="muted">Validez la demande sur votre téléphone, puis actualisez cette page.</p>
        <Link className="btn" href={`/espace/paiement/succes?tx=${encodeURIComponent(tx)}`}>Actualiser</Link>
      </div>
    );
  }
  return (
    <div className="card" style={{ textAlign: 'center', marginTop: 24 }}>
      <h1 style={{ margin: '0 0 8px' }}>Paiement non abouti</h1>
      <p className="muted">Le paiement n'a pas été validé. Vous pouvez réessayer.</p>
      <Link className="btn" href="/espace/offres">Retour aux offres</Link>
    </div>
  );
}
