import { session } from '@/lib/session';
import { peutAcceder } from '@/lib/access';
import { demanderAmi } from './actions';
import ChatAmi from '@/components/ChatAmi';

export const dynamic = 'force-dynamic';

export default async function Ami({ searchParams }: { searchParams: { erreur?: string } }) {
  const { supabase, user, profil } = await session();
  const acces = peutAcceder(profil);
  const { data: msgs } = await supabase
    .from('ami_messages')
    .select('id,role,contenu,created_at')
    .eq('user_id', user.id)
    .order('created_at');

  return (
    <>
      <div className="row" style={{ margin: '10px 0 16px', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22 }}>✦</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Agence Ami</h1>
          <p className="muted" style={{ margin: 0 }}>Votre assistante, disponible à tout moment</p>
        </div>
      </div>

      {acces ? (
        <ChatAmi
          initial={(msgs || []) as any}
          envoyer={demanderAmi}
          erreur={searchParams?.erreur}
        />
      ) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="muted">Agence Ami est réservée aux membres abonnés.</p>
          <a className="btn sm" href="/espace/offres">Voir les offres</a>
        </div>
      )}
    </>
  );
}
