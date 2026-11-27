import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, initiale } from '@/lib/access';
import { envoyerMessage } from '../actions';
import ChatForm from '@/components/ChatForm';

export const dynamic = 'force-dynamic';

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

  if (!avec) {
    return (
      <>
        <h1>Messages</h1>
        {ids.length === 0 && <div className="card muted">Aucune conversation pour le moment.</div>}
        {ids.map((id: any) => {
          const g: any = nomDe(id);
          const dernier: any = [...(msgs || [])].reverse().find((m: any) => autre(m) === id);
          return (
            <Link key={id} href={`/espace/messages?avec=${id}`} className="card row">
              <div className="avatar">{initiale(g?.name)}</div>
              <div className="grow">
                <strong>{g?.name || 'Membre'}</strong>
                <div className="muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dernier?.content}</div>
              </div>
            </Link>
          );
        })}
      </>
    );
  }

  const g: any = nomDe(avec) || (await supabase.from('profiles').select('id,name').eq('id', avec).maybeSingle()).data;
  const fil = (msgs || []).filter((m: any) => autre(m) === avec);

  return (
    <>
      <div className="row" style={{ marginBottom: 8 }}>
        <Link className="btn ghost sm" href="/espace/messages">← Messages</Link>
        <strong>{g?.name || 'Membre'}</strong>
      </div>
      <div>
        {fil.map((m: any) => (
          <div key={m.id} className={`bubble ${m.sender_id === user.id ? 'me' : 'them'}`}>{m.content}</div>
        ))}
        {fil.length === 0 && <div className="card muted" style={{ textAlign: 'center' }}>Dites bonjour 👋</div>}
      </div>
      {acces || g?.role === 'admin' ? (
        <ChatForm avec={avec} action={envoyerMessage} />
      ) : (
        <div className="card" style={{ textAlign: 'center', marginTop: 12 }}>
          <p className="muted">La messagerie est réservée aux membres abonnés.</p>
          <Link className="btn sm" href="/espace/offres">Voir les offres</Link>
        </div>
      )}
    </>
  );
}
