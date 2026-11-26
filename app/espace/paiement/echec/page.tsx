import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Retour FlashPay en cas d'échec ou d'annulation du paiement.
export default function Echec() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', display: 'grid', gap: 14, justifyItems: 'center' }}>
      <h1 style={{ margin: 0 }}>Paiement non abouti</h1>
      <p className="muted" style={{ margin: 0, maxWidth: 420 }}>
        Le paiement a été annulé ou refusé. Aucun montant n'a été débité pour votre accès.
        Vous pouvez réessayer quand vous voulez.
      </p>
      <Link className="btn" href="/espace/offres">Revoir les offres</Link>
    </div>
  );
}
