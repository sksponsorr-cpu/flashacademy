import { redirect } from 'next/navigation';
import { session } from '@/lib/session';

export const dynamic = 'force-dynamic';

// « Profil » ouvre directement votre propre page de profil.
export default async function MonProfil() {
  const { user } = await session();
  redirect(`/espace/membres/${user.id}`);
}
