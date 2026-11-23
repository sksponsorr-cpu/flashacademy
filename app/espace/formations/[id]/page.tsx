import { notFound } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { marquerModule } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function Cours({ params }: { params: { id: string } }) {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);

  const { data: c } = await supabase
    .from('courses')
    .select('id,title,level,emoji,thumb,partner_id,niche_id,niches(id,nom,categories(slug)),modules(id,position,title,duration)')
    .eq('id', params.id)
    .maybeSingle();
  if (!c) notFound();

  const { data: offres } = await supabase.from('offers').select('price').order('price').limit(1);
  const { data: fait } = await supabase.from('progress').select('module_id').eq('user_id', profil?.id);
  const faits = new Set((fait || []).map((f: any) => f.module_id));
  const mods = [...((c as any).modules || [])].sort((a: any, b: any) => a.position - b.position);
  const suivi = mods.length ? Math.round((mods.filter((m: any) => faits.has(m.id)).length / mods.length) * 100) : 0;
  const min = offres?.[0]?.price;

  return (
    <>
      <nav className="crumbs">
        <Link href="/espace/formations">Formations</Link>
        {(c as any).niches && <> <span>/</span> <Link href={`/espace/formations/niche/${(c as any).niches.id}`}>{(c as any).niches.nom}</Link></>}
      </nav>
      <div className="card" style={{ marginTop: 12 }}>
        <div
          style={{
            aspectRatio: '16/9', borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 40,
            background: 'linear-gradient(135deg,#1e3a8a,#8b5cf6)',
            ...(c.thumb ? { backgroundImage: `url('${c.thumb}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
          }}
        >
          {c.thumb ? '' : c.emoji}
        </div>
        <h2>{c.title}</h2>
        <p className="muted">{c.level}</p>

        {acces ? (
          <>
            <div style={{ height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden', margin: '10px 0 4px' }}>
              <div style={{ width: `${suivi}%`, height: '100%', background: 'var(--accent)' }} />
            </div>
            <p className="muted">{suivi} % suivi</p>
          </>
        ) : (
          <div className="card" style={{ background: 'var(--soft)', borderColor: 'transparent' }}>
            <strong>Accès visiteur</strong>
            <p className="muted">Vous pouvez regarder le premier module. Les suivants se débloquent avec une offre.</p>
            <Link className="btn block" href="/espace/offres">Débloquer la formation · dès {min ? fcfa(min) : ''}</Link>
          </div>
        )}

        {mods.map((m: any, i: number) => {
          const verrouille = !acces && i > 0;
          return (
            <div key={m.id} className="modrow">
              <span>{i + 1}. {m.title} <span className="muted">({m.duration})</span></span>
              {verrouille ? (
                <Link className="btn sm off" href="/espace/offres">🔒 Verrouillé</Link>
              ) : (
                <form action={marquerModule}>
                  <input type="hidden" name="module" value={m.id} />
                  <input type="hidden" name="cours" value={c.id} />
                  <input type="hidden" name="fait" value={faits.has(m.id) ? '1' : '0'} />
                  <button className="btn ghost sm" type="submit">{faits.has(m.id) ? 'Revoir' : 'Marquer fait'}</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
