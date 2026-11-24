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

  const historique = msgs || [];

  return (
    <>
      <div className="row" style={{ margin: '10px 0 16px', gap: 14 }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
            color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22,
          }}
        >
          ✦
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Agence Ami</h1>
          <p className="muted" style={{ margin: 0 }}>Votre assistante, disponible à tout moment</p>
        </div>
      </div>

      <div
        className="card"
        style={{ minHeight: 320, display: 'flex', flexDirection: 'column', gap: 6, padding: 16 }}
      >
        {historique.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', padding: 20 }}>
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Bonjour 👋</p>
            <p className="muted" style={{ margin: 0 }}>
              Posez votre première question. Vous pouvez aussi joindre une courte vidéo.
            </p>
          </div>
        )}
        {historique.map((m: any) => (
          <div
            key={m.id}
            style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div
              className={`bubble ${m.role === 'user' ? 'me' : 'them'}`}
              style={{ whiteSpace: 'pre-line', maxWidth: '82%' }}
            >
              {m.contenu}
            </div>
          </div>
        ))}
      </div>

      {acces ? (
        <form action={demanderAmi} className="card" style={{ display: 'grid', gap: 10, marginTop: 14 }}>
          <textarea
            name="question"
            rows={3}
            placeholder="Écrivez votre question…"
            required
            style={{ marginTop: 0 }}
          />
          <div className="row" style={{ gap: 10 }}>
            <label
              className="btn ghost sm"
              style={{ margin: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              📎 Vidéo
              <input name="video" type="file" accept="video/*" style={{ display: 'none' }} />
            </label>
            <button className="btn sm grow" type="submit">Envoyer</button>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>Vidéo facultative, 4 Mo maximum.</p>
        </form>
      ) : (
        <div className="card" style={{ textAlign: 'center', marginTop: 14 }}>
          <p className="muted">Agence Ami est réservée aux membres abonnés.</p>
          <a className="btn sm" href="/espace/offres">Voir les offres</a>
        </div>
      )}
    </>
  );
}
