import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, initiale } from '@/lib/access';
import { publierPublication } from './actions';

export const dynamic = 'force-dynamic';

export default async function Flux() {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);
  const { data: posts } = await supabase
    .from('posts')
    .select('id,content,created_at,profiles(id,name,photo)')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: vr } = await supabase.from('settings').select('value').eq('key', 'video_une').maybeSingle();
  const video: any = vr?.value || null;

  return (
    <>
      {video?.titre && (
        <a href={video.url || '#'} target="_blank" rel="noopener" className="card video-une rv">
          <div className="thumb" style={video.image ? { backgroundImage: `url('${video.image}')` } : { background: 'linear-gradient(135deg,#1e3a8a,#8b5cf6)' }}>
            <span className="play">▶</span>
          </div>
          <h2>{video.titre}</h2>
        </a>
      )}

      {!profil?.validated && (
        <div className="card row">
          <div className="grow">
            <strong>Validez votre profil (20 %)</strong>
            <div className="muted">Ajoutez votre photo, votre titre et votre biographie.</div>
          </div>
          <Link className="btn sm" href="/espace/profil">Compléter</Link>
        </div>
      )}

      {!acces && (
        <div className="card row">
          <div className="grow">
            <strong>Vous êtes en accès visiteur</strong>
            <div className="muted">Débloquez toutes les formations et la messagerie.</div>
          </div>
          <Link className="btn sm" href="/espace/offres">Voir les offres</Link>
        </div>
      )}

      <div className="card">
        <form action={publierPublication}>
          <input name="contenu" placeholder="Quoi de neuf ?" required autoComplete="off" />
          <button className="btn block" style={{ marginTop: 8 }} type="submit">Publier</button>
        </form>
      </div>

      {(posts || []).map((p: any) => (
        <div key={p.id} className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <Link href={`/espace/membres/${p.profiles?.id}`}>
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 14 }}>
                {initiale(p.profiles?.name)}
              </div>
            </Link>
            <div>
              <strong>{p.profiles?.name}</strong>
              <div className="muted" style={{ fontSize: 12 }}>
                {new Date(p.created_at).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
          <p style={{ margin: 0 }}>{p.content}</p>
        </div>
      ))}
      {(!posts || posts.length === 0) && <div className="card muted" style={{ textAlign: 'center' }}>Aucune publication pour le moment.</div>}
    </>
  );
}
