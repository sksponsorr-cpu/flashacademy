import Link from 'next/link';
import { session } from '@/lib/session';
import { initiale } from '@/lib/access';
import Certifie from '@/components/Certifie';

export const dynamic = 'force-dynamic';

export default async function Membres() {
  const { supabase } = await session();
  const { data } = await supabase
    .from('profiles')
    .select('id,name,role,head,photo,certifie')
    .eq('banned', false)
    .order('name');

  return (
    <>
      <h1>Membres de la communauté</h1>
      <p className="muted">Touchez une personne pour voir son profil.</p>
      {(data || []).map((m: any) => (
        <Link key={m.id} href={`/espace/membres/${m.id}`} className="card row">
          <div className="avatar" style={m.photo ? { backgroundImage: `url('${m.photo}')` } : {}}>
            {m.photo ? '' : initiale(m.name)}
          </div>
          <div className="grow">
            <strong>{m.name}</strong><Certifie certifie={m.certifie} role={m.role} /> {m.role !== 'membre' && <span className="tag">{m.role}</span>}
            <div className="muted">{m.head}</div>
          </div>
          <span className="muted">›</span>
        </Link>
      ))}
    </>
  );
}
