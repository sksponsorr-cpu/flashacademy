import { redirect } from 'next/navigation';
import Link from 'next/link';
import MediaInput from '@/components/MediaInput';
import LecteurVideo from '@/components/LecteurVideo';
import ModulesEditor from '@/components/ModulesEditor';
import { session } from '@/lib/session';
import { estAdmin, fcfa } from '@/lib/access';
import AccesManuel from '@/components/AccesManuel';
import {
  ajouterFormation,
  modifierFormation,
  supprimerFormation,
  ajouterOffre,
  supprimerOffre,
  basculerMembre,
  sauverAccueil,
  modifierOffre,
  sauverFormateurs,
  sauverCertification,
  ajouterCategorie,
  supprimerCategorie,
  ajouterNiche,
  supprimerNiche,
  sauverVideoUne,
} from '../actions';

export const dynamic = 'force-dynamic';

const etapes = [
  ['catalogue', '1 Catalogue'],
  ['formations', '2 Formations'],
  ['membres', '3 Membres'],
  ['offres', '4 Offres'],
  ['accueil', '5 Accueil'],
  ['partenaires', '6 Partenaires'],
];

const Etape = ({
  n,
  titre,
  children,
}: {
  n: number;
  titre: string;
  children: React.ReactNode;
}) => (
  <div className="card">
    <div className="row" style={{ marginBottom: 6 }}>
      <span className="step-num">{n}</span>
      <h3 style={{ margin: 0 }}>{titre}</h3>
    </div>
    {children}
  </div>
);

export default async function Admin({
  searchParams,
}: {
  searchParams: { s?: string };
}) {
  const { supabase, profil } = await session();

  if (!estAdmin(profil)) redirect('/espace');

  const s = searchParams.s || 'catalogue';

  const [
    { data: cats },
    { data: niches },
    { data: cours },
    { data: membres },
    { data: offres },
    { data: reg },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id,slug,nom,emoji,description')
      .order('ordre'),

    supabase
      .from('niches')
      .select('id,categorie_id,nom,description,miniature')
      .order('ordre'),

    supabase
      .from('courses')
      .select(
        'id,title,level,niche_id,thumb,modules(id,position,title,duration,video_url)'
      )
      .order('id'),

    supabase
      .from('profiles')
      .select('id,name,role,sub,banned')
      .order('name'),

    supabase.from('offers').select('*').order('price'),

    supabase
      .from('settings')
      .select('value')
      .eq('key', 'accueil')
      .maybeSingle(),
  ]);

  const { data: vu } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'video_une')
    .maybeSingle();

  const { data: profs } = await supabase
    .from('profiles')
    .select('id,name,role,certifie,reseaux')
    .order('name')
    .limit(300);

  const { data: liens } = await supabase
    .from('cours_formateurs')
    .select('course_id,profile_id');

  const une: any = vu?.value || {};
  const a: any = reg?.value || {};

  const faqTxt = (a.faq || [])
    .map((f: any) => `${f.q} | ${f.a}`)
    .join('\n');

  const nomCat = (id: number) =>
    (cats || []).find((c: any) => c.id === id)?.nom || '—';

  const nomNiche = (id: number) =>
    (niches || []).find((n: any) => n.id === id)?.nom || 'Sans niche';

  return (
    <>
      <h1>Bureau administrateur</h1>

      <div className="steps">
        {etapes.map(([k, l]) => (
          <Link
            key={k}
            href={`/espace/admin?s=${k}`}
            className={s === k ? 'on' : ''}
          >
            {l}
          </Link>
        ))}
      </div>

      {s === 'catalogue' && (
        <>
          <p className="muted">
            Organisez le catalogue dans cet ordre : d’abord la catégorie,
            ensuite la niche, puis la formation.
          </p>

          <Etape n={1} titre="Ajouter une catégorie">
            <p className="muted" style={{ marginTop: 0 }}>
              Exemples : TikTok, Montage vidéo, SaaS.
            </p>

            <form action={ajouterCategorie}>
              <label>Nom de la catégorie</label>
              <input name="nom" required placeholder="Ex : TikTok" />

              <label>Emoji</label>
              <input name="emoji" placeholder="🎵" maxLength={4} />

              <label>Description courte</label>
              <input
                name="description"
                placeholder="Créer et monétiser sur TikTok"
              />

              <label>Ordre d’affichage (1 = en premier)</label>
              <input
                name="ordre"
                type="number"
                defaultValue={(cats || []).length + 1}
              />

              <button
                className="btn block"
                style={{ marginTop: 14 }}
                type="submit"
              >
                Créer la catégorie
              </button>
            </form>
          </Etape>

          <Etape n={2} titre="Ajouter une niche">
            <p className="muted" style={{ marginTop: 0 }}>
              Une niche est un domaine précis dans une catégorie. Ex :
              TikTok › Business en ligne.
            </p>

            <form action={ajouterNiche}>
              <label>Catégorie</label>

              <select name="categorie" required>
                <option value="">Choisir…</option>

                {(cats || []).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.nom}
                  </option>
                ))}
              </select>

              <label>Nom de la niche</label>
              <input
                name="nom"
                required
                placeholder="Ex : Business en ligne"
              />

              <label>Description courte</label>
              <input
                name="description"
                placeholder="Vendre sur TikTok sans budget publicitaire"
              />

              <MediaInput
                name="miniature"
                label="Image de la niche (galerie ou lien)"
                type="image"
              />

              <label>Ordre d’affichage</label>
              <input name="ordre" type="number" defaultValue={0} />

              <button
                className="btn block"
                style={{ marginTop: 14 }}
                type="submit"
                disabled={!(cats || []).length}
              >
                Créer la niche
              </button>
            </form>
          </Etape>

          <h3 style={{ marginTop: 22 }}>
            Catégories et niches existantes
          </h3>

          {(cats || []).map((c: any) => (
            <div key={c.id} className="card">
              <div className="row">
                <div className="grow">
                  <strong>
                    {c.emoji} {c.nom}
                  </strong>

                  <div className="muted">{c.description}</div>
                </div>

                <form action={supprimerCategorie}>
                  <input type="hidden" name="id" value={c.id} />

                  <button className="btn danger sm" type="submit">
                    Supprimer
                  </button>
                </form>
              </div>

              {(niches || [])
                .filter((n: any) => n.categorie_id === c.id)
                .map((n: any) => (
                  <div key={n.id} className="modrow">
                    <div
                      className="row"
                      style={{
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {n.miniature ? (
                        <img loading="lazy" decoding="async"
                          src={n.miniature}
                          alt=""
                          style={{
                            width: 54,
                            height: 38,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            width: 54,
                            height: 38,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 8,
                            background: 'var(--soft)',
                          }}
                        >
                          🖼️
                        </span>
                      )}

                      <span>↳ {n.nom}</span>
                    </div>

                    <form action={supprimerNiche}>
                      <input type="hidden" name="id" value={n.id} />

                      <button className="btn ghost sm" type="submit">
                        Retirer
                      </button>
                    </form>
                  </div>
                ))}
            </div>
          ))}
        </>
      )}

      {s === 'formations' && (
        <>
          <Etape n={3} titre="Publier une formation">
            <p className="muted" style={{ marginTop: 0 }}>
              Rattachez la formation à une niche, puis ajoutez ses modules
              (un par ligne : titre | durée).
            </p>

            <form action={ajouterFormation}>
              <label>Niche</label>

              <select name="niche" defaultValue="">
                <option value="">Sans niche (non classée)</option>

                {(niches || []).map((n: any) => (
                  <option key={n.id} value={n.id}>
                    {nomCat(n.categorie_id)} › {n.nom}
                  </option>
                ))}
              </select>

              <label>Titre de la formation</label>
              <input
                name="titre"
                required
                placeholder="Ex : Vendre sur TikTok Shop"
              />

              <label>Niveau</label>

              <select name="niveau">
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>

              <MediaInput
                name="miniature"
                label="Miniature de la formation (galerie ou lien)"
                type="image"
              />

              <label>Modules</label>
              <ModulesEditor />

              <button
                className="btn block"
                style={{ marginTop: 14 }}
                type="submit"
              >
                Publier la formation
              </button>
            </form>
          </Etape>

          <h3 style={{ marginTop: 22 }}>Formations publiées</h3>

          {(cours || []).map((c: any) => (
            <div key={c.id} className="card row">
              <div className="grow">
                <strong>{c.title}</strong>

                <div className="muted">
                  {nomNiche(c.niche_id)} · {(c.modules || []).length} modules
                  · {c.level}
                </div>
              </div>

              <form action={supprimerFormation}>
                <input type="hidden" name="id" value={c.id} />

                <button className="btn danger sm" type="submit">
                  Supprimer
                </button>
              </form>

              <details style={{ width: '100%' }}>
                <summary className="muted" style={{ cursor: 'pointer' }}>
                  Modifier la formation et ses modules
                </summary>

                <form action={modifierFormation} style={{ marginTop: 8 }}>
                  <input type="hidden" name="id" value={c.id} />

                  <label>Niche</label>

                  <select name="niche" defaultValue={c.niche_id || ''}>
                    <option value="">Sans niche (non classée)</option>

                    {(niches || []).map((n: any) => (
                      <option key={n.id} value={n.id}>
                        {nomCat(n.categorie_id)} › {n.nom}
                      </option>
                    ))}
                  </select>

                  <label>Titre de la formation</label>
                  <input name="titre" required defaultValue={c.title} />

                  <label>Niveau</label>

                  <select name="niveau" defaultValue={c.level}>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                  </select>

                  <MediaInput
                    name="miniature"
                    label="Miniature de la formation"
                    defaultValue={c.thumb || ''}
                    type="image"
                  />

                  <label>Modules</label>

                  <ModulesEditor
                    initial={[...(c.modules || [])]
                      .sort(
                        (a: any, b: any) => a.position - b.position
                      )
                      .map((m: any) => ({
                        id: m.id,
                        titre: m.title || '',
                        duree: m.duration || '',
                        video: m.video_url || '',
                      }))}
                  />

                  <p className="muted" style={{ fontSize: 12 }}>
                    Retirer un module supprime aussi les commentaires et la
                    progression qui lui sont liés.
                  </p>

                  <button
                    className="btn block"
                    style={{ marginTop: 10 }}
                    type="submit"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              </details>

              <details style={{ width: '100%' }}>
                <summary className="muted" style={{ cursor: 'pointer' }}>
                  Formateurs du cours
                </summary>

                <form action={sauverFormateurs} style={{ marginTop: 8 }}>
                  <input type="hidden" name="course_id" value={c.id} />

                  {(profs || []).map((p: any) => (
                    <label
                      key={p.id}
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        margin: '6px 0',
                      }}
                    >
                      <input
                        type="checkbox"
                        name="formateur"
                        value={p.id}
                        defaultChecked={(liens || []).some(
                          (l: any) =>
                            l.course_id === c.id &&
                            l.profile_id === p.id
                        )}
                        style={{
                          width: 'auto',
                          margin: 0,
                        }}
                      />

                      {p.name}
                      {p.certifie ? ' ✓ certifié' : ''}
                    </label>
                  ))}

                  <button
                    className="btn sm"
                    style={{ marginTop: 8 }}
                    type="submit"
                  >
                    Enregistrer les formateurs
                  </button>
                </form>
              </details>
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
                {m.role}
                {m.sub ? ' · abonné' : ' · visiteur'}
                {m.banned ? ' · banni' : ''}
              </div>
            </div>

            <form action={basculerMembre}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="champ" value="sub" />

              <button className="btn ghost sm" type="submit">
                {m.sub ? 'Retirer accès' : 'Donner accès'}
              </button>
            </form>

            <form action={basculerMembre}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="champ" value="ban" />

              <button
                className={`btn sm ${m.banned ? 'ghost' : 'danger'}`}
                type="submit"
              >
                {m.banned ? 'Débannir' : 'Bannir'}
              </button>
            </form>

            <details style={{ width: '100%' }}>
              <summary className="muted" style={{ cursor: 'pointer' }}>
                Certification et réseaux
              </summary>

              <form action={sauverCertification} style={{ marginTop: 8 }}>
                <input type="hidden" name="id" value={m.id} />

                <label
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="checkbox"
                    name="certifie"
                    defaultChecked={!!m.certifie}
                    style={{
                      width: 'auto',
                      margin: 0,
                    }}
                  />
                  Certifié (badge affiché sur les formations)
                </label>

                <label>Site</label>
                <input
                  name="site"
                  defaultValue={m.reseaux?.site || ''}
                  placeholder="https://..."
                />

                <label>Instagram</label>
                <input
                  name="instagram"
                  defaultValue={m.reseaux?.instagram || ''}
                  placeholder="https://instagram.com/..."
                />

                <label>YouTube</label>
                <input
                  name="youtube"
                  defaultValue={m.reseaux?.youtube || ''}
                  placeholder="https://youtube.com/..."
                />

                <label>TikTok</label>
                <input
                  name="tiktok"
                  defaultValue={m.reseaux?.tiktok || ''}
                  placeholder="https://tiktok.com/@..."
                />

                <label>LinkedIn</label>
                <input
                  name="linkedin"
                  defaultValue={m.reseaux?.linkedin || ''}
                  placeholder="https://linkedin.com/in/..."
                />

                <button
                  className="btn sm"
                  style={{ marginTop: 10 }}
                  type="submit"
                >
                  Enregistrer
                </button>
              </form>
            </details>
          </div>
        ))}

      {s === 'offres' && (
        <>
          <div className="card">
            <h3>Ajouter une offre</h3>

            <form action={ajouterOffre}>
              <label>Nom de l’offre</label>
              <input
                name="nom"
                required
                placeholder="Ex : Accès annuel"
              />

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
                <input
                  type="checkbox"
                  name="meilleure"
                  style={{ width: 'auto', margin: 0 }}
                />
                Marquer comme « Le plus choisi »
              </label>

              <button
                className="btn block"
                style={{ marginTop: 12 }}
                type="submit"
              >
                Ajouter l’offre
              </button>
            </form>
          </div>

          <AccesManuel offres={(offres || []) as any[]} />

          {(offres || []).map((o: any) => (
            <div key={o.id} className="card">
              <div className="row">
                <div className="grow">
                  <strong>{o.name}</strong>
                  {o.best ? ' · Le plus choisi' : ''}

                  <div className="muted">
                    {fcfa(o.price)} · {o.per}
                  </div>
                </div>

                <form action={supprimerOffre}>
                  <input type="hidden" name="id" value={o.id} />

                  <button className="btn danger sm" type="submit">
                    Retirer
                  </button>
                </form>
              </div>

              <details style={{ marginTop: 10 }}>
                <summary className="muted" style={{ cursor: 'pointer' }}>
                  Modifier cette offre
                </summary>

                <form action={modifierOffre} style={{ marginTop: 8 }}>
                  <input type="hidden" name="id" value={o.id} />

                  <label>Nom de l’offre</label>
                  <input name="nom" defaultValue={o.name} required />

                  <label>Prix (FCFA)</label>
                  <input
                    name="prix"
                    type="number"
                    defaultValue={o.price}
                  />

                  <label>Période</label>

                  <select name="periode" defaultValue={o.per}>
                    <option>Pour 1 an</option>
                    <option>Par mois</option>
                    <option>Unique</option>
                  </select>

                  <label>Avantages (un par ligne)</label>
                  <textarea
                    name="avantages"
                    rows={3}
                    defaultValue={(o.feat || []).join('\n')}
                  />

                  <label className="row" style={{ marginTop: 12 }}>
                    <input
                      type="checkbox"
                      name="meilleure"
                      defaultChecked={!!o.best}
                      style={{
                        width: 'auto',
                        margin: 0,
                      }}
                    />
                    Marquer comme « Le plus choisi »
                  </label>

                  <button
                    className="btn sm"
                    style={{ marginTop: 10 }}
                    type="submit"
                  >
                    Enregistrer l’offre
                  </button>
                </form>
              </details>
            </div>
          ))}
        </>
      )}

      {s === 'accueil' && (
        <div className="card">
          <h3>Vidéo à la une</h3>

          <p className="muted" style={{ marginTop: 0 }}>
            Affichée en haut du fil d’actualités. Laissez le titre vide
            pour la masquer.
          </p>

          <form action={sauverVideoUne}>
            <label>Titre de la vidéo</label>
            <input
              name="titre"
              defaultValue={une.titre || ''}
              placeholder="Vidéo très IMPORTANTE !"
            />

            <MediaInput
              name="image"
              label="Miniature (galerie ou lien)"
              defaultValue={une.image || ''}
              type="image"
            />

            <MediaInput
              name="url"
              label="Vidéo (galerie, YouTube ou Vimeo)"
              defaultValue={une.url || ''}
              type="video"
            />

            <button
              className="btn block"
              style={{ marginTop: 12 }}
              type="submit"
            >
              Enregistrer la vidéo
            </button>
          </form>
        </div>
      )}

      {s === 'accueil' && (
        <div className="card">
          <h3>Page d’accueil</h3>

          <div style={{ margin: '10px 0 16px' }}>
            <strong>Vidéo de présentation</strong>

            <p
              className="muted"
              style={{ margin: '4px 0 10px', fontSize: 13 }}
            >
              Affichée en haut de la page d’accueil. Collez un lien YouTube
              ou Vimeo, ou choisissez un fichier dans la galerie.
            </p>

            {a.video ? (
              <div
                style={{
                  aspectRatio: '16/9',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: '#000',
                }}
              >
                <LecteurVideo url={a.video} />
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>
                Aucune vidéo enregistrée. Elle n’apparaîtra pas sur l’accueil.
              </p>
            )}
          </div>

          <form action={sauverAccueil}>
            <label>Titre principal</label>
            <input name="titre" defaultValue={a.titre || ''} />

            <label>Texte d’accroche</label>
            <textarea
              name="texte"
              rows={2}
              defaultValue={a.texte || ''}
            />

            <MediaInput
              name="video"
              label="Vidéo de présentation (galerie, YouTube ou Vimeo)"
              defaultValue={a.video || ''}
              type="video"
            />

            <label>Nom du fondateur</label>
            <input
              name="fondateur_nom"
              defaultValue={a.fondateur_nom || ''}
            />

            <MediaInput
              name="fondateur_photo"
              label="Photo du fondateur (galerie ou lien)"
              defaultValue={a.fondateur_photo || ''}
              type="image"
            />

            <label>Texte du fondateur</label>
            <textarea
              name="fondateur"
              rows={3}
              defaultValue={a.fondateur || ''}
            />

            <label>
              Questions fréquentes (une par ligne : Question ? | Réponse)
            </label>

            <textarea
              name="faq"
              rows={6}
              defaultValue={faqTxt}
            />

            <button
              className="btn block"
              style={{ marginTop: 12 }}
              type="submit"
            >
              Enregistrer
            </button>
          </form>
        </div>
      )}

      {s === 'partenaires' &&
        (membres || []).map((m: any) => (
          <div key={m.id} className="card row">
            <div className="grow">
              <strong>{m.name}</strong>

              <div className="muted">
                {m.role === 'partenaire' ? 'Partenaire' : 'Membre'}
              </div>
            </div>

            <form action={basculerMembre}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="champ" value="partenaire" />

              <button className="btn ghost sm" type="submit">
                {m.role === 'partenaire'
                  ? 'Retirer le rôle'
                  : 'Rendre partenaire'}
              </button>
            </form>
          </div>
        ))}
    </>
  );
              }
