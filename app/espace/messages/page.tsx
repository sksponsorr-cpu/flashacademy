import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, initiale } from '@/lib/access';
import { envoyerMessage } from '../actions';
import ChatForm from '@/components/ChatForm';

export const dynamic = 'force-dynamic';

const heure = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const jourLong = (d: string) => {
  const x = new Date(d);
  const h = new Date();
  if (x.toDateString() === h.toDateString()) return "Aujourd’hui";
  const hier = new Date(h); hier.setDate(h.getDate() - 1);
  if (x.toDateString() === hier.toDateString()) return 'Hier';
  return x.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};
const heureOuDate = (d: string) => {
  const x = new Date(d);
  return x.toDateString() === new Date().toDateString()
    ? heure(d)
    : x.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

export default async function Messages({ searchParams }: { searchParams: { avec?: string } }) {
  const { supabase, user, profil } = await session();
  const acces = peutAcceder(profil);

  const { data: msgs } = await supabase
    .from('messages')
    .select('id,sender_id,receiver_id,content,created_at')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at');

  const autre = (m: any) => (m.sender_id === user.id ? m.receiver_id : m.sender_id);
  const ids = Array.from(new Set((msgs || []).map(autre)));
  const { data: gens } = ids.length
    ? await supabase.from('profiles').select('id,name,photo,role').in('id', ids)
    : { data: [] as any[] };
  const nomDe = (id: string) => (gens || []).find((g: any) => g.id === id);
  const avec = searchParams.avec;

  const style = `
    .wa{display:flex;flex-direction:column;height:calc(100dvh - 150px);min-height:460px;border:1px solid var(--line);border-radius:24px;overflow:hidden;background:var(--card)}
    .wa-av{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;display:grid;place-items:center;font-weight:700;flex-shrink:0;font-size:17px}
    .wa-liste{border:1px solid var(--line);border-radius:24px;overflow:hidden;background:var(--card)}
    .wa-ligne{display:flex;gap:12px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line);transition:background .2s}
    .wa-ligne:last-child{border-bottom:0}
    .wa-ligne:hover{background:rgba(79,140,255,.06)}
    .wa-meta{flex:1;min-width:0}
    .wa-nom{font-weight:700;font-size:15px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .wa-apercu{display:block;color:var(--muted);font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
    .wa-heure{font-size:12px;color:var(--muted);align-self:flex-start;margin-top:3px}
    .wa-tete{display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--card)}
    .wa-retour{font-size:30px;line-height:1;color:var(--accent);padding:0 8px 0 0;text-decoration:none}
    .wa-tete small{display:block;color:var(--muted);font-size:12px;margin-top:1px}
    .wa-fil{flex:1;overflow-y:auto;padding:14px 14px 8px;display:flex;flex-direction:column;gap:6px;background:radial-gradient(900px 500px at 50% 0%,rgba(79,140,255,.07),transparent 70%),var(--bg)}
    .wa-jour{align-self:center;background:var(--soft);color:var(--muted);font-size:12px;font-weight:600;padding:5px 12px;border-radius:99px;margin:8px 0}
    .wa-bulle{max-width:78%;padding:8px 12px 6px;border-radius:18px;font-size:15px;line-height:1.4;word-wrap:break-word;box-shadow:0 1px 1px rgba(0,0,0,.12)}
    .wa-bulle p{margin:0;white-space:pre-wrap}
    .wa-bulle.moi{align-self:flex-end;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-bottom-right-radius:6px}
    .wa-bulle.eux{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:6px}
    .wa-h{display:block;text-align:right;font-size:11px;opacity:.72;margin-top:3px}
    .wa-compo{display:flex;gap:10px;align-items:center;padding:10px 12px;border-top:1px solid var(--line);background:var(--card);margin:0}
    .wa-compo input{margin:0;border-radius:99px;flex:1;padding:11px 16px}
    .wa-compo button{width:46px;height:46px;border-radius:50%;border:0;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-size:18px;flex-shrink:0;padding:0;margin:0;box-shadow:0 6px 16px rgba(79,140,255,.35);cursor:pointer}
    .wa-vide{text-align:center;color:var(--muted);padding:30px 16px}
  `;

  if (!avec) {
    return (
      <>
        <style>{style}</style>
        <h1 style={{ marginBottom: 14 }}>Messages</h1>
        {ids.length === 0 && (
          <div className="card wa-vide">Aucune conversation pour le moment.</div>
        )}
        {ids.length > 0 && (
          <div className="wa-liste">
            {ids.map((id: any) => {
              const g: any = nomDe(id);
              const dernier: any = [...(msgs || [])].reverse().find((m: any) => autre(m) === id);
              const moi = dernier?.sender_id === user.id;
              return (
                <Link key={id} href={`/espace/messages?avec=${id}`} className="wa-ligne">
                  <div className="wa-av">{initiale(g?.name)}</div>
                  <div className="wa-meta">
                    <span className="wa-nom">{g?.name || 'Membre'}</span>
                    <span className="wa-apercu">{moi ? 'Vous : ' : ''}{dernier?.content}</span>
                  </div>
                  {dernier && <span className="wa-heure">{heureOuDate(dernier.created_at)}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </>
    );
  }

  const g: any = nomDe(avec) || (await supabase.from('profiles').select('id,name,role').eq('id', avec).maybeSingle()).data;
  const fil = (msgs || []).filter((m: any) => autre(m) === avec);

  // Regroupe les messages par jour, avec un séparateur entre chaque jour.
  const elements: JSX.Element[] = [];
  let jourPrecedent = '';
  fil.forEach((m: any) => {
    const jour = jourLong(m.created_at);
    if (jour !== jourPrecedent) {
      elements.push(<div key={`j-${m.id}`} className="wa-jour">{jour}</div>);
      jourPrecedent = jour;
    }
    const moi = m.sender_id === user.id;
    elements.push(
      <div key={m.id} className={`wa-bulle ${moi ? 'moi' : 'eux'}`}>
        <p>{m.content}</p>
        <span className="wa-h">{heure(m.created_at)}</span>
      </div>
    );
  });

  return (
    <>
      <style>{style}</style>
      <div className="wa">
        <div className="wa-tete">
          <Link className="wa-retour" href="/espace/messages" aria-label="Retour">‹</Link>
          <div className="wa-av" style={{ width: 40, height: 40, fontSize: 15 }}>{initiale(g?.name)}</div>
          <div>
            <strong>{g?.name || 'Membre'}</strong>
            <small>{g?.role === 'admin' ? 'Administrateur' : 'Membre Flash Academy'}</small>
          </div>
        </div>

        <div className="wa-fil">
          {elements}
          {fil.length === 0 && <div className="wa-vide">Dites bonjour 👋</div>}
        </div>

        {acces || g?.role === 'admin' ? (
          <ChatForm avec={avec} action={envoyerMessage} />
        ) : (
          <div className="card" style={{ textAlign: 'center', margin: 12 }}>
            <p className="muted">La messagerie est réservée aux membres abonnés.</p>
            <Link className="btn sm" href="/espace/offres">Voir les offres</Link>
          </div>
        )}
      </div>
    </>
  );
}
