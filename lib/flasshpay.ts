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
'Variable FLASHPAY_KEY manquante dans Vercel.'
);
}

return k;
}

// Données nécessaires pour une collecte
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

// Réponse de FlashPay
export type CollecteResponse = {
checkout_url: string;
};

// ============================================
// CRÉATION D'UNE COLLECTE
// ============================================

export async function creerCollecte(
input: CollecteInput
): Promise<CollecteResponse> {

const apiKey = cle();

if (!input.name?.trim()) {
throw new Error('Le nom du payeur est obligatoire.');
}

if (!input.mobile?.trim()) {
throw new Error('Le numéro mobile du payeur est obligatoire.');
}

if (!input.country_code) {
throw new Error('Le pays de paiement est obligatoire.');
}

if (!Number.isFinite(input.amount) || input.amount <= 0) {
throw new Error('Le montant du paiement est invalide.');
}

if (!input.transaction_id) {
throw new Error('Identifiant de transaction manquant.');
}

const payload = {
country_code: input.country_code,
amount: input.amount,
transaction_id: input.transaction_id,
name: input.name.trim(),
mobile: input.mobile.trim(),
description: input.description,
callback_url: input.callback_url,
failed_callback_url: input.failed_callback_url,
checkout: 'hosted',
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
console.error('FlashPay API Error:', {
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
'FlashPay n’a pas retourné de lien checkout_url.'
);
}

return {
checkout_url: checkoutUrl,
};
}

// ============================================
// VÉRIFICATION DU STATUT D'UNE COLLECTE
// ============================================

export async function statutCollecte(
transaction_id: string
): Promise<string> {

const apiKey = cle();

if (!transaction_id) {
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

if (!status) {
throw new Error(
'Statut du paiement introuvable dans la réponse FlashPay.'
);
}

return status;
}
