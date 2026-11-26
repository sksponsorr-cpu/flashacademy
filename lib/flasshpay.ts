// ============================================
// FLASHPAY - CLIENT SERVEUR
// FLASHACADEMY
// ============================================

// API officielle
const BASE = 'https://flasshpay.my/api/v1';

// Récupération sécurisée de la clé API
function cle(): string {
const key = process.env.FLASHPAY_KEY?.trim();

if (!key) {
throw new Error('Variable FLASHPAY_KEY manquante.');
}

return key;
}

// Données nécessaires à la création du paiement
export type CollecteInput = {
country_code: string;
amount: number;
transaction_id: string;
name: string;
mobile: string;
description?: string;
callback_url?: string;
failed_callback_url?: string;
};

// Réponse de création
export type CollecteResponse = {
checkout_url: string;
};

// ============================================
// CRÉATION D'UN PAIEMENT
// ============================================

export async function creerCollecte(
input: CollecteInput
): Promise<CollecteResponse> {

const apiKey = cle();

// Vérifications
if (!input.country_code) {
throw new Error('Pays du paiement manquant.');
}

if (!Number.isFinite(input.amount) || input.amount <= 0) {
throw new Error('Montant du paiement invalide.');
}

if (!input.transaction_id?.trim()) {
throw new Error('Identifiant de transaction manquant.');
}

if (!input.name?.trim()) {
throw new Error('Le nom du payeur est obligatoire.');
}

if (!input.mobile?.trim()) {
throw new Error('Le numéro mobile du payeur est obligatoire.');
}

const payload = {
country_code: input.country_code.toUpperCase(),
amount: input.amount,
transaction_id: input.transaction_id,
name: input.name.trim(),
mobile: input.mobile.trim(),
description: input.description,
checkout: 'hosted',
callback_url: input.callback_url,
failed_callback_url: input.failed_callback_url,
};

const response = await fetch(
"${BASE}/collections",
{
method: 'POST',
headers: {
'X-FlashPay-Key': apiKey,
'Content-Type': 'application/json',
'Accept': 'application/json',
},
body: JSON.stringify(payload),
cache: 'no-store',
}
);

const json = await response.json().catch(() => null);

if (!response.ok) {
const message =
json?.message ||
json?.error?.message ||
"Erreur FlashPay HTTP ${response.status}";

console.error('Erreur création FlashPay:', {
  status: response.status,
  message,
});

throw new Error(message);

}

const checkoutUrl = json?.data?.checkout_url;

if (
typeof checkoutUrl !== 'string' ||
!checkoutUrl.startsWith('https://')
) {
throw new Error(
'FlashPay n’a pas retourné une adresse checkout_url valide.'
);
}

return {
checkout_url: checkoutUrl,
};
}

// ============================================
// VÉRIFICATION DU STATUT DU PAIEMENT
// ============================================

export async function statutCollecte(
transaction_id: string
): Promise<string> {

const apiKey = cle();

if (!transaction_id?.trim()) {
throw new Error('Identifiant de transaction manquant.');
}

const response = await fetch(
"${BASE}/collections/${encodeURIComponent(transaction_id)}",
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
"Erreur FlashPay HTTP ${response.status}"
);
}

const status = json?.data?.status;

const statutsAutorises = [
'pending',
'successful',
'failed',
'cancelled',
'expired',
];

if (!statutsAutorises.includes(status)) {
throw new Error('Statut FlashPay inconnu.');
}

return status;
}
