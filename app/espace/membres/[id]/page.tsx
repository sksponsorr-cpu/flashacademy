import { notFound } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, initiale } from '@/lib/access';
import { sauverProfil, publierRecit } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function ProfilMembre({ params }: { params: { id: string } }) {
  const { supabase, user, profil: moi } = await session();
  const { data: p } = await supabase.from('profiles').select('*').eq('id', params.id).maybeSingle();
  if (!p) notFound();

  const isMe = user.id === p.id;
  const acces = peutAcceder(moi);

  const [{ data: recits }, { data: pubs }, { data: recettes }, { count }] = await Promise.all([
    supabase.from('stories').select('*').eq('author_id', p.id).order('created_at', { ascending: false }),
    supabase.from('posts').select('*').eq('author_id', p.id).order('created_at', { ascending: false }),
    supabase.from('recipes').select('*').eq('author_id', p.id).order('created_at', { ascending: false }),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('partner_id', p.id),
  ]);

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="cover" />
        <div style={{ padding: '0 20px 18px' }}>
          <div
            className="avatar"
            style={{
              width: 100, height: 100, fontSize: 38, marginTop: -50, border: '5px solid var(--card)',
              boxShadow: '0 8px 24px rgba(0,0,0,.25)',
              ...(p.photo ? { backgroundImage: `url('${p.photo}')` } : {}),
            }}
          >
            {p.photo ? '' : initiale(p.name)}
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', marginTop: -40, position: 'relative' }}>
            {!isMe && (acces ? (
              <Link className="btn sm" href={`/espace/messages?avec=${p.id}`}>Envoyer un message</Link>
            ) : (
              <Link className="btn sm off" href="/espace/offres">🔒 Message (abonnés)</Link>
            ))}
          </div>

          <h2 style={{ margin: '12px 0 2px' }}>
            {p.name || 'Membre'} {p.validated && <span className="tag">✓</span>}
          </h2>
          <div className="muted">@{(p.name || 'membre').toLowerCase().replace(/\s+/g, '')}{p.role !== 'membre' ? ' · ' + p.role : ''}</div>
          {p.head && <div className="muted" style={{ marginTop: 2 }}>{p.head}</div>}
          <p style={{ whiteSpace: 'pre-line', margin: '12px 0' }}>
            {p.bio || (isMe ? 'Ajoutez une biographie pour vous présenter.' : 'Pas encore de biographie.')}
          </p>
          {p.link && (
            <a href={p.link} target="_blank" rel="noopener" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              🔗 {p.link.replace(/^https?:\/\//, '')}
            </a>
          )}

          <div className="row" style={{ gap: 26, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <div><b>{count ?? 0}</b> <span className="muted">formations</span></div>
            <div><b>{(recettes || []).length}</b> <span className="muted">recettes</span></div>
          </div>
        </div>
      </div>

      {isMe && (
        <details className="card">
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>✏️ Modifier mon profil</summary>
          <form action={sauverProfil}>
            <label>Photo de profil</label>
            <input name="photo" type="file" accept="image/*" style={{ padding: 8 }} />
            <label>Nom affiché</label>
            <input name="name" defaultValue={p.name} />
            <label>Titre</label>
            <input name="head" defaultValue={p.head} placeholder="Votre activité en une phrase" />
            <label>Biographie</label>
            <textarea name="bio" rows={3} defaultValue={p.bio} />
            <label>Lien</label>
            <input name="link" defaultValue={p.link} placeholder="https://" />
            <button className="btn block" style={{ marginTop: 16 }} type="submit">Valider mon profil</button>
          </form>
        </details>
      )}

      {isMe && (
        <details className="card">
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>+ Publier un récit</summary>
          <form action={publierRecit}>
            <textarea name="contenu" rows={2} placeholder="Partagez un récit avec la communauté" required />
            <button className="btn block" style={{ marginTop: 10 }} type="submit">Publier le récit</button>
          </form>
        </details>
      )}

      <h2>Récits</h2>
      {(recits || []).length === 0 && <div className="card muted">Aucun récit pour le moment.</div>}
      {(recits || []).map((r: any) => (
        <div key={r.id} className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="muted" style={{ fontSize: 12 }}>{new Date(r.created_at).toLocaleString('fr-FR')}</div>
          <p style={{ margin: '8px 0 0' }}>{r.content}</p>
        </div>
      ))}

      <h2>Publications</h2>
      {(pubs || []).length === 0 && <div className="card muted">Aucune publication.</div>}
      {(pubs || []).map((r: any) => (
        <div key={r.id} className="card"><p style={{ margin: 0 }}>{r.content}</p></div>
      ))}

      <h2>Recettes</h2>
      {(recettes || []).length === 0 && <div className="card muted">Aucune recette publiée.</div>}
      {(recettes || []).map((r: any) => (
        <div key={r.id} className="card">
          <h3>{r.title}</h3>
          <p className="muted">{r.time}</p>
        </div>
      ))}
    </>
  );
}
