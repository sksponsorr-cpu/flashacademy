import { session } from '@/lib/session';
import { peutAcceder } from '@/lib/access';
import { demanderAmi } from './actions';

export const dynamic = 'force-dynamic';

export default async function Ami() {
  const { supabase, user, profil } = await session();
  const acces = peutAcceder(profil);
  const { data: msgs } = await supabase
    .from('ami_messages')
    .select('id,role,contenu,created_at')
    .eq('user_id', user.id)
    .order('created_at');

  return (
    <>
      <h1>Agence Ami</h1>
      <p className="muted">Posez votre question par écrit, ou joignez une courte vidéo (4 Mo maximum).</p>

      {acces ? (
        <form action={demanderAmi} className="card">
          <textarea name="question" rows={3} placeholder="Votre question" />
          <label>Vidéo (facultatif, 4 Mo maximum)</label>
          <input name="video" type="file" accept="video/*" />
          <button className="btn block" style={{ marginTop: 10 }} type="submit">Envoyer</button>
        </form>
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="muted">Agence Ami est réservée aux membres abonnés.</p>
          <a className="btn sm" href="/espace/offres">Voir les offres</a>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {(msgs || []).map((m: any) => (
          <div key={m.id} className={`bubble ${m.role === 'user' ? 'me' : 'them'}`} style={{ whiteSpace: 'pre-line' }}>
            {m.contenu}
          </div>
        ))}
        {(!msgs || msgs.length === 0) && <div className="card muted">Aucun échange pour le moment.</div>}
      </div>
    </>
  );
}
