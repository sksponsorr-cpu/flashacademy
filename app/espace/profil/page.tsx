import { redirect } from 'next/navigation';
import { session } from '@/lib/session';

// Le bouton « Profil » ouvre directement votre propre profil.
export default async function MonProfil() {
  const { user } = await session();
  redirect(`/espace/membres/${user.id}`);
}
