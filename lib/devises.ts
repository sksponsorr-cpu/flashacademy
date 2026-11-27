// Pays proposés au paiement, et taux indicatifs (unités locales pour 1 FCFA).
// Les montants sont toujours enregistrés en FCFA ; la conversion est affichée pour information.
export const PAYS = [
  ['GH', '🇬🇭 Ghana'],
  ['SL', '🇸🇱 Sierra Leone'],
  ['NG', '🇳🇬 Nigeria'],
  ['TZ', '🇹🇿 Tanzanie'],
  ['UG', '🇺🇬 Ouganda'],
  ['CD', '🇨🇩 République démocratique du Congo'],
  ['CG', '🇨🇬 République du Congo'],
  ['CM', '🇨🇲 Cameroun'],
  ['CI', "🇨🇮 Côte d'Ivoire"],
  ['SN', '🇸🇳 Sénégal'],
  ['BJ', '🇧🇯 Bénin'],
  ['TG', '🇹🇬 Togo'],
  ['GA', '🇬🇦 Gabon'],
  ['GM', '🇬🇲 Gambie'],
  ['RW', '🇷🇼 Rwanda'],
  ['GN', '🇬🇳 Guinée'],
  ['BF', '🇧🇫 Burkina Faso'],
  ['ML', '🇲🇱 Mali'],
] as const;

export const TAUX: Record<string, { devise: string; taux: number }> = {
  CM: { devise: 'XAF', taux: 1 }, CG: { devise: 'XAF', taux: 1 }, GA: { devise: 'XAF', taux: 1 },
  CI: { devise: 'XOF', taux: 1 }, SN: { devise: 'XOF', taux: 1 }, BJ: { devise: 'XOF', taux: 1 },
  TG: { devise: 'XOF', taux: 1 }, BF: { devise: 'XOF', taux: 1 }, ML: { devise: 'XOF', taux: 1 },
  CD: { devise: 'CDF', taux: 3.78 }, GH: { devise: 'GHS', taux: 0.01975 }, NG: { devise: 'NGN', taux: 2.32 },
  SL: { devise: 'SLE', taux: 0.0378 }, TZ: { devise: 'TZS', taux: 4.46 }, UG: { devise: 'UGX', taux: 6.54 },
  GM: { devise: 'GMD', taux: 0.122 }, RW: { devise: 'RWF', taux: 2.46 }, GN: { devise: 'GNF', taux: 14.74 },
};

// Montant converti, ex. « 2 340 000 CDF ». Renvoie null si le pays est inconnu.
export function convertir(fcfa: number, pays: string): string | null {
  const t = TAUX[pays];
  if (!t) return null;
  const valeur = Math.round(fcfa * t.taux);
  return `${valeur.toLocaleString('fr-FR')} ${t.devise}`;
}
