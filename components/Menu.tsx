'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { initiale } from '@/lib/access';

type Categorie = { slug: string; nom: string; emoji: string };
type Props = { categories: Categorie[]; acces: boolean; admin: boolean; partenaire: boolean; nom: string; photo: string };

export default function Menu({ categories, acces, admin, partenaire, nom, photo }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);

  const lien = (href: string, icone: string, libelle: string, verrouille = false) => (
    <Link key={href + libelle} href={href} onClick={fermer} className="nav-item">
      <span className="ico">{icone}</span>
      {libelle}
      {verrouille && !acces && <span className="lock">🔒</span>}
    </Link>
  );

  return (
    <>
      <div className="bar">
        <button className={`burger ${ouvert ? 'open' : ''}`} onClick={() => setOuvert(!ouvert)} aria-label="Menu">
          <i /><i /><i />
        </button>
        <Link href="/espace" className="logo">Flash<span>Academy</span></Link>
        <Link href="/espace/profil">
          <div className="avatar" style={photo ? { backgroundImage: `url('${photo}')` } : {}}>
            {photo ? '' : initiale(nom)}
            <ThemeToggle />
        </div>
        </Link>
      </div>

      <div className={`overlay ${ouvert ? 'open' : ''}`} onClick={fermer} />

      <nav className={`drawer ${ouvert ? 'open' : ''}`}>
        <h4>Accueil</h4>
        {lien('/espace', '🏠', 'Actualités')}
        {lien('/espace/ressources/live', '🔴', 'Sessions live', true)}

        <h4>Espace formation</h4>
        {categories.map((c) => lien(`/espace/formations/categorie/${c.slug}`, c.emoji, c.nom))}
        {lien('/espace/formations', '🔎', 'Rechercher une niche')}

        <h4>Communauté</h4>
        {lien('/espace/membres', '👥', 'Membres')}
        {lien('/espace/messages', '💬', 'Messages', true)}

        <h4>Ressources</h4>
        {lien('/espace/recettes', '🍲', 'Recettes')}
        {lien('/espace/ressources/replays', '🎬', 'Replays', true)}
        {lien('/espace/ressources/partenariats', '🤝', 'Partenariats', true)}
        {lien('/espace/ressources/evenements', '📅', 'Événements')}

        <h4>Agence Ami</h4>
        {lien('/espace/ami', '🤖', 'Poser une question', true)}
        {admin && lien('/espace/ami/admin', '🧠', 'Consignes Ami')}

        <h4>Abonnement</h4>
        {lien('/espace/offres', '✨', 'Offres')}

        {(admin || partenaire) && <h4>Espaces</h4>}
        {admin && lien('/espace/admin', '🛠️', 'Bureau administrateur')}
        {partenaire && lien('/espace/partenaire', '💼', 'Espace partenaire')}

        <h4>Compte</h4>
        {lien('/espace/profil', '👤', 'Mon profil')}
        <a href="/deconnexion" className="nav-item">
          <span className="ico">🚪</span>Se déconnecter
        </a>
      </nav>
    </>
  );
}
