import { redirect } from 'next/navigation';
import { session } from '@/lib/session';
import { estPartenaire } from '@/lib/access';
import { creerFormationPartenaire } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Partenaire() {
  const { supabase, profil } = await session();
  if (!estPartenaire(profil)) redirect('/espace');
  const { data } = await supabase.from('courses').select('id,title,modules(id)').eq('partner_id', profil.id);

  return (
    <>
      <h1>Espace partenaire</h1>
      <details className="card" open>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>Publier une formation</summary>
        <form action={creerFormationPartenaire}>
          <label>Titre</label>
          <input name="titre" required />
          <label>Niveau</label>
          <select name="niveau">
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Avancé</option>
          </select>
          <label>Modules (un par ligne : titre | durée)</label>
          <textarea name="modules" rows={4} />
          <button className="btn block" style={{ marginTop: 12 }} type="submit">Publier</button>
        </form>
      </details>
      {(data || []).map((c: any) => (
        <div key={c.id} className="card">
          <strong>{c.title}</strong>
          <div className="muted">{(c.modules || []).length} modules</div>
        </div>
      ))}
    </>
  );
}
