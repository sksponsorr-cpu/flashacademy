// Client serveur flasshpay. À utiliser uniquement côté serveur : la clé ne doit jamais aller dans le navigateur.
const BASE = 'https://flasshpay.my/api/v1';

function cle(): string {
  const k = process.env.FLASSHPAY_KEY;
  if (!k) throw new Error('Variable FLASSHPAY_KEY manquante');
  return k;
}

type CollecteInput = {
  country_code: string;
  amount: number;
  transaction_id: string;
  description?: string;
  callback_url?: string;
  failed_callback_url?: string;
};

// Crée une collecte en mode hébergé et renvoie l'adresse de paiement vers laquelle rediriger le client.
export async function creerCollecte(input: CollecteInput): Promise<{ checkout_url: string }> {
  const res = await fetch(`${BASE}/collections`, {
    method: 'POST',
    headers: { 'X-flasshpay-Key': cle(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, checkout: 'hosted' }),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || json?.message || `flasshpay ${res.status}`);
  return json.data;
}

// Lit le statut d'une collecte avec l'identifiant de la commande.
// Statuts : pending, successful, failed, cancelled, expired.
export async function statutCollecte(transaction_id: string): Promise<string> {
  const res = await fetch(`${BASE}/collections/${encodeURIComponent(transaction_id)}`, {
    headers: { 'X-flasshpay-Key': cle() },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || json?.message || `flasshpay ${res.status}`);
  return json.data.status as string;
}
