// Client officiel FlashPay — serveur uniquement

const BASE_URL = 'https://flasshpay.my/api/v1';

function obtenirCle(): string {
  const key = process.env.FLASHPAY_KEY;

  if (!key || !key.trim()) {
    throw new Error('Variable FLASHPAY_KEY manquante');
  }

  return key.trim();
}

type CollecteInput = {
  country_code: string;
  amount: number;
  transaction_id: string;
  name: string;
  mobile: string;
  description?: string;
  callback_url?: string;
  failed_callback_url?: string;
};

async function lireReponse(response: Response) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.error?.message ||
      json?.message ||
      `Erreur FlashPay HTTP ${response.status}`
    );
  }

  return json;
}

// Création du paiement
export async function creerCollecte(
  input: CollecteInput
): Promise<{ checkout_url: string }> {

  if (!input.country_code || !input.transaction_id) {
    throw new Error('Pays ou identifiant de transaction manquant');
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Montant de paiement invalide');
  }

  const endpoint = `${BASE_URL}/collections`;

  const response = await fetch(endpoint, {
    method: 'POST',

    headers: {
      'X-FlashPay-Key': obtenirCle(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },

    body: JSON.stringify({
      country_code: input.country_code,
      amount: input.amount,
      transaction_id: input.transaction_id,
      name: input.name,
      mobile: input.mobile,
      description: input.description,
      callback_url: input.callback_url,
      failed_callback_url: input.failed_callback_url,
      checkout: 'hosted',
    }),

    cache: 'no-store',
  });

  const result = await lireReponse(response);

  const checkoutUrl = result?.data?.checkout_url;

  if (!checkoutUrl) {
    throw new Error('FlashPay n’a pas retourné checkout_url');
  }

  return {
    checkout_url: checkoutUrl,
  };
}

// Vérification du paiement
export async function statutCollecte(
  transaction_id: string
): Promise<string> {

  if (!transaction_id) {
    throw new Error('Identifiant de transaction manquant');
  }

  const endpoint =
    `${BASE_URL}/collections/${encodeURIComponent(transaction_id)}`;

  const response = await fetch(endpoint, {
    method: 'GET',

    headers: {
      'X-FlashPay-Key': obtenirCle(),
      'Accept': 'application/json',
    },

    cache: 'no-store',
  });

  const result = await lireReponse(response);

  const status = result?.data?.status;

  if (!status) {
    throw new Error('Statut FlashPay introuvable');
  }

  return status;
}
