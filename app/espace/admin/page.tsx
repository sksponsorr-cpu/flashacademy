import { redirect } from 'next/navigation';
import Link from 'next/link';
import { session } from '@/lib/session';
import { estAdmin, fcfa } from '@/lib/access';
import {
  ajouterFormation, supprimerFormation, ajouterOffre, supprimerOffre, basculerMembre, sauverAccueil,
} from '../actions';

export const dynamic = 'force-dynamic';

const etapes = [
  ['formations', '1 Formations'],
  ['membres', '2 Membres'],
  ['offres', '3 Offres'],
  ['accueil', '4 Accueil'],
  ['partenaires', '5 Partenaires'],
];

export default async function Admin({ searchParams }: { searchParams: { s?: string } }) {
  const { supabase, profil } = await session();
  if (!estAdmin(profil)) redirect('/espace');
  const s = searchParams.s || 'formations';

  const [{ data: cours }, { data: membres }, { data: offres }, { data: reg }] = await Promise.all([
    supabase.from('courses').select('id,title,level,modules(id)').order('id'),
    supabase.from('profiles').select('id,name,role,sub,banned').order('name'),
    supabase.from('offers').select('*').order('price'),
    supabase.from('settings').select('value').eq('key', 'accueil').maybeSingle(),
  ]);
  const a: any = reg?.value || {};
  const faqTxt = (a.faq || []).map((f: any) => `${f.q} | ${f.a}`).join('\n');

  return (
    <>
      <h1>Bureau administrateur</h1>
      <div className="steps">
        {etapes.map(([k, l]) => (
          <Link key={k} href={`/espace/admin?s=${k}`} className={s === k ? 'on' : ''}>{l}</Link>
        ))}
      </div>

      {s === 'formations' && (
        <>
          <div className="card">
            <h3>Ajouter une formation</h3>
            <form action={ajouterFormation}>
              <label>Titre</label>
              <input name="titre" required placeholder="Ex : Formation Instagram" />
              <label>Niveau</label>
              <select name="niveau">
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>
              <label>Lien de la miniature (facultatif)</label>
              <input name="miniature" placeholder="https://..." />
              <label>Modules (un par ligne : titre | durée)</label>
              <textarea name="modules" rows={4} placeholder="Introduction | 5 min" />
              <button className="btn block" style={{ marginTop: 12 }} type="submit">Publier la formation</button>
            </form>
          </div>
          {(cours || []).map((c: any) => (
            <div key={c.id} className="card row">
              <div className="grow">
                <strong>{c.title}</strong>
                <div className="muted">{(c.modules || []).length} modules · {c.level}</div>
              </div>
              <form action={supprimerFormation}>
                <input type="hidden" name="id" value={c.id} />
                <button className="btn danger sm" type="submit">Supprimer</button>
              </form>
            </div>
          ))}
        </>
      )}

      {s === 'membres' &&
        (membres || []).map((m: any) => (
          <div key={m.id} className="card row">
            <div className="grow">
              <strong>{m.name}</strong>
              <div className="muted">
                {m.role}{m.sub ? ' · abonné' : ' · visiteur'}{m.banned ? ' · banni' : ''}
              </div>
            </div>
            <form action={basculerMembre}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="champ" value="sub" />
              <button className="btn ghost sm" type="submit">{m.sub ? 'Retirer accès' : 'Donner accès'}</button>
            </form>
            <form action={basculerMembre}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="champ" value="ban" />
              <button className={`btn sm ${m.banned ? 'ghost' : 'danger'}`} type="submit">{m.banned ? 'Débannir' : 'Bannir'}</button>
            </form>
          </div>
        ))}

      {s === 'offres' && (
        <>
          <div className="card">
            <h3>Ajouter une offre</h3>
            <form action={ajouterOffre}>
              <label>Nom de l'offre</label>
              <input name="nom" required placeholder="Ex : Accès annuel" />
              <label>Prix (FCFA)</label>
              <input name="prix" type="number" defaultValue={65000} />
              <label>Période</label>
              <select name="periode">
                <option>Pour 1 an</option>
                <option>Par mois</option>
                <option>Unique</option>
              </select>
              <label>Avantages (un par ligne)</label>
              <textarea name="avantages" rows={3} />
              <label className="row" style={{ marginTop: 12 }}>
                <input type="checkbox" name="meilleure" style={{ width: 'auto', margin: 0 }} /> Marquer comme « Le plus choisi »
              </label>
              <button className="btn block" style={{ marginTop: 12 }} type="submit">Ajouter l'offre</button>
            </form>
          </div>
          {(offres || []).map((o: any) => (
            <div key={o.id} className="card row">
              <div className="grow">
                <strong>{o.name}</strong>
                <div className="muted">{fcfa(o.price)} · {o.per}</div>
              </div>
              <form action={supprimerOffre}>
                <input type="hidden" name="id" value={o.id} />
                <button className="btn danger sm" type="submit">Retirer</button>
              </form>
            </div>
          ))}
        </>
      )}

      {s === 'accueil' && (
        <div className="card">
          <h3>Page d'accueil</h3>
          <form action={sauverAccueil}>
            <label>Titre principal</label>
            <input name="titre" defaultValue={a.titre || ''} />
            <label>Texte d'accroche</label>
            <textarea name="texte" rows={2} defaultValue={a.texte || ''} />
            <label>Lien de la vidéo de présentation</label>
            <input name="video" defaultValue={a.video || ''} placeholder="https://..." />
            <label>Texte du fondateur</label>
            <textarea name="fondateur" rows={3} defaultValue={a.fondateur || ''} />
            <label>Questions fréquentes (une par ligne : Question ? | Réponse)</label>
            <textarea name="faq" rows={6} defaultValue={faqTxt} />
            <button className="btn block" style={{ marginTop: 12 }} type="submit">Enregistrer</button>
          </form>
        </div>
      )}

      {s === 'partenaires' &&
        (membres || []).map((m: any) => (
          <div key={m.id} className="card row">
            <div className="grow">
              <strong>{m.name}</strong>
              <div className="muted">{m.role === 'partenaire' ? 'Partenaire' : 'Membre'}</div>
            </div>
            <form action={basculerMembre}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="champ" value="partenaire" />
              <button className="btn ghost sm" type="submit">
                {m.role === 'partenaire' ? 'Retirer le rôle' : 'Rendre partenaire'}
              </button>
            </form>
          </div>
        ))}
    </>
  );
                            }
