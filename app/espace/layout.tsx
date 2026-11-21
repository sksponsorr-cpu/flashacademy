import Link from 'next/link';
import { session } from '@/lib/session';
import { initiale } from '@/lib/access';
import BottomNav from '@/components/BottomNav';

export default async function LayoutEspace({ children }: { children: React.ReactNode }) {
  const { profil } = await session();

  if (profil?.banned) {
    return (
      <main>
        <div className="card">
          <h2>Accès suspendu</h2>
          <p className="muted">Votre accès à Flash Academy est suspendu. Contactez l'équipe.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="bar">
        <Link href="/espace" className="logo">Flash<span>Academy</span></Link>
        <Link href="/espace/profil">
          <div className="avatar" style={profil?.photo ? { backgroundImage: `url('${profil.photo}')` } : {}}>
            {profil?.photo ? '' : initiale(profil?.name)}
          </div>
        </Link>
      </div>
      <main>{children}</main>
      <BottomNav />
    </>
  );
}
