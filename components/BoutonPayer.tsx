'use client';

import { useFormStatus } from 'react-dom';

// Bouton de paiement : affiche tout de suite « Redirection… » pendant l'envoi, pour qu'un clic ne reste jamais sans effet.
export default function BoutonPayer({ montant }: { montant: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn block" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Redirection vers le paiement…' : `Payer ${montant}`}
    </button>
  );
}
