import Link from 'next/link';
import { session } from '@/lib/session';
import { peutAcceder, initiale } from '@/lib/access';
import { publierRecette } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Recettes() {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);
  const { data } = await supabase
    .from('recipes')
    .select('id,title,time,ingredients,steps,created_at,profiles(id,name,photo)')
    .order('created_at', { ascending: false });

  return (
    <>
      <h1>Recettes</h1>
      <p className="muted">Recettes publiées par les membres.</p>

      {acces ? (
        <details className="card" style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>+ Publier une recette</summary>
          <form action={publierRecette}>
            <label>Titre</label>
            <input name="titre" required />
            <label>Temps de préparation</label>
            <input name="temps" placeholder="Ex : 30 min" />
            <label>Ingrédients (séparés par des virgules)</label>
            <textarea name="ingredients" rows={2} />
            <label>Étapes</label>
            <textarea name="etapes" rows={3} />
            <button className="btn block" style={{ marginTop: 12 }} type="submit">Publier la recette</button>
          </form>
        </details>
      ) : (
        <div className="card" style={{ textAlign: 'center', marginTop: 12 }}>
          <p className="muted">Pour publier une recette, abonnez-vous à une offre.</p>
          <Link className="btn sm" href="/espace/offres">Voir les offres</Link>
        </div>
      )}

      {(data || []).map((r: any) => (
        <div key={r.id} className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 14 }}>{initiale(r.profiles?.name)}</div>
            <div className="grow">
              <Link href={`/espace/membres/${r.profiles?.id}`}><strong>{r.profiles?.name}</strong></Link>
              <div className="muted" style={{ fontSize: 12 }}>{r.time}</div>
            </div>
          </div>
          <h3>{r.title}</h3>
          <p className="muted"><b>Ingrédients :</b> {r.ingredients}</p>
          <details>
            <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }}>Voir la préparation</summary>
            <p>{r.steps}</p>
          </details>
        </div>
      ))}
    </>
  );
}
