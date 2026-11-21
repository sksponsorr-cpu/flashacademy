import { notFound, redirect } from 'next/navigation';
import { session } from '@/lib/session';
import { peutAcceder } from '@/lib/access';

export const dynamic = 'force-dynamic';

const titres: Record<string, string> = {
  replays: 'Replays',
  partenariats: 'Partenariats',
  live: 'Sessions live',
  evenements: 'Événements',
};
const reserves = ['replays', 'partenariats'];

export default async function Ressource({ params }: { params: { slug: string } }) {
  const titre = titres[params.slug];
  if (!titre) notFound();
  const { profil } = await session();
  if (reserves.includes(params.slug) && !peutAcceder(profil)) redirect('/espace/offres');

  return (
    <>
      <h1>{titre}</h1>
      <div className="card">
        <p className="muted">Contenu à venir. Les éléments seront ajoutés depuis le bureau administrateur à la prochaine étape.</p>
      </div>
    </>
  );
}
