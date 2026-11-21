export type Profil = {
  id: string;
  name: string;
  role: string;
  sub: boolean;
  banned: boolean;
  validated: boolean;
  head?: string;
  bio?: string;
  link?: string;
  photo?: string;
};

export const peutAcceder = (p: Profil | null | undefined) =>
  !!p && !p.banned && (p.sub || p.role === 'admin');

export const estAdmin = (p: Profil | null | undefined) => !!p && p.role === 'admin';

export const estPartenaire = (p: Profil | null | undefined) =>
  !!p && (p.role === 'partenaire' || p.role === 'admin');

export const initiale = (n?: string) => (n || '?').trim().charAt(0).toUpperCase();

export const fcfa = (n: number) =>
  Number(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ') + ' FCFA';

export const lignes = (t: string) =>
  t.split('\n').map((l) => l.trim()).filter(Boolean);
