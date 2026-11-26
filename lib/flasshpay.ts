// ============================================
// FLASHPAY - CLIENT SERVEUR
// FlashAcademy
// ============================================

const BASE = 'https://flasshpay.my/api/v1';

// Récupération sécurisée de la clé API
function cle(): string {
  const k = process.env.FLASHPAY_KEY?.trim();

  if (!k) {
    throw new Error(
      'FLASHPAY_KEY manquante dans les variables Vercel.'
    );
  }

  if (!k.startsWith('fp_live_')) {
    throw new Error(
      'La clé FlashPay doit être une véritable clé LIVE.'
    );
  }

  if (k.includes('xxxxxxxx')) {
    throw new Error(
      'La clé FlashPay configurée est une clé exemple.'
    );
  }

  return k;
}

// Structure des données de paiement
export type CollecteInput = {
  country_code: string;
  amount: number;
  transaction_id: string;
  description?: string;
  callback_url?: string;
  failed_callback_url?: string;
};

// Réponse FlashPay
export type CollecteResponse = {
  checkout_url: string;
};

// ============================================
// CRÉER UNE COLLECTE
// ============================================

export async function creerCollecte(
  input: CollecteInput
): Promise<CollecteResponse> {

  if (!input.country_code) {
    throw new Error('Le pays de paiement est obligatoire.');
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Le montant du paiement est invalide.');
  }

  if (!input.transaction_id) {
    throw new Error('Identifiant de transaction manquant.');
  }

  const apiKey = cle();

  const response = await fetch(
    `${BASE}/collections`,
    {
      method: 'POST',

      headers: {
        'X-FlashPay-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },

      body: JSON.stringify({
        ...input,
        checkout: 'hosted',
      }),

      cache: 'no-store',
    }
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Erreur API FlashPay:', {
      status: response.status,
      message: json?.message || json?.error?.message,
    });

    throw new Error(
      json?.message ||
      json?.error?.message ||
      `Erreur FlashPay HTTP ${response.status}`
    );
  }

  const checkoutUrl = json?.data?.checkout_url;

  if (!checkoutUrl) {
    throw new Error(
      'FlashPay n’a pas retourné checkout_url.'
    );
  }

  return {
    checkout_url: checkoutUrl,
  };
}

// ============================================
// VÉRIFIER LE STATUT D'UN PAIEMENT
// ============================================

export async function statutCollecte(
  transaction_id: string
): Promise<string> {

  if (!transaction_id) {
    throw new Error('Identifiant de transaction manquant.');
  }

  const apiKey = cle();

  const response = await fetch(
    `${BASE}/collections/${encodeURIComponent(transaction_id)}`,
    {
      method: 'GET',

      headers: {
        'X-FlashPay-Key': apiKey,
        'Accept': 'application/json',
      },

      cache: 'no-store',
    }
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      json?.message ||
      json?.error?.message ||
      `Erreur FlashPay HTTP ${response.status}`
    );
  }

  const status = json?.data?.status;

  if (!status) {
    throw new Error(
      'FlashPay n’a pas retourné le statut du paiement.'
    );
  }

  return status;
}
