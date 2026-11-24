import { session } from '@/lib/session';

export const dynamic = 'force-dynamic';

// Page temporaire de diagnostic : à supprimer une fois le problème réglé.
export default async function Diagnostic() {
  const { supabase, user, profil } = await session();
  const { data: lignes, error } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id);

  return (
    <main>
      <div className="card">
        <h2>Diagnostic</h2>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Identifiant connecté :</strong> {user.id}</p>
        <p><strong>Fiche vue par la session :</strong> {profil ? 'oui' : 'non'}</p>
        <p><strong>Lecture directe de la fiche :</strong> {JSON.stringify(lignes)}</p>
        <p><strong>Erreur éventuelle :</strong> {error ? error.message : 'aucune'}</p>
        <p><strong>URL Supabase utilisée :</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NON DÉFINIE'}</p>
      </div>
    </main>
  );
}
