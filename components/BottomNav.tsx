import Link from 'next/link';

const liens = [
  ['/espace', '🏠', 'Accueil'],
  ['/espace/membres', '👥', 'Membres'],
  ['/espace/messages', '💬', 'Messages'],
  ['/espace/formations', '🎓', 'Formations'],
  ['/espace/profil', '👤', 'Profil'],
];

export default function BottomNav() {
  return (
    <nav className="tabbar">
      {liens.map(([href, ico, label]) => (
        <Link key={href} href={href}>
          <span>{ico}</span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
