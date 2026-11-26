import { session } from '@/lib/session';
import { peutAcceder, estAdmin, estPartenaire } from '@/lib/access';
import Menu from '@/components/Menu';
import BottomNav from '@/components/BottomNav';
import ChargementGlobal from '@/components/ChargementGlobal';

export default async function LayoutEspace({ children }: { children: React.ReactNode }) {
  const { supabase, profil } = await session();

  if (profil?.banned) {
    return (
      <main>
        <div className="card">
          <h2>Accès suspendu</h2>
          <p className="muted">Votre accès à Flash Academy est suspendu. Contactez l’équipe.</p>
        </div>
      </main>
    );
  }

  const { data: categories } = await supabase.from('categories').select('slug,nom,emoji').order('ordre');

  return (
    <>
      <Menu
        categories={(categories || []) as any[]}
        acces={peutAcceder(profil)}
        admin={estAdmin(profil)}
        partenaire={estPartenaire(profil)}
        nom={profil?.name || ''}
        photo={profil?.photo || ''}
      />
      <main>{children}</main>
      <BottomNav />
      <ChargementGlobal />
    </>
  );
}
