'use client';

import { useState } from 'react';
import Link from 'next/link';
import Certifie from '@/components/Certifie';
import FilCommentaires from '@/components/FilCommentaires';
import LecteurVideo from '@/components/LecteurVideo';

type Module = {
  id: number;
  title: string;
  duration: string;
  video_url?: string | null;
  verrouille: boolean;
  fait: boolean;
};

type Commentaire = {
  id: string;
  module_id: number;
  contenu: string;
  auteur: string;
  auteur_id: string;
  auteur_role?: string;
  auteur_certifie?: boolean;
  parent_id?: number | null;
  likes?: number;
  aime?: boolean;
  created_at: string;
};

type Formateur = {
  id: string;
  name: string;
  role?: string;
  certifie?: boolean;
  reseaux?: Record<string, string>;
};

const RESEAUX: Record<string, string> = {
  site: 'Site',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

export default function CoursInteractif({
  courseId,
  modules,
  commentaires,
  acces,
  formateurs,
  envoyerCommentaire,
  marquerModule,
}: {
  courseId: number;
  modules: Module[];
  commentaires: Commentaire[];
  acces: boolean;
  formateurs: Formateur[];
  envoyerCommentaire: (fd: FormData) => Promise<void>;
  marquerModule: (fd: FormData) => Promise<void>;
}) {
  const premier = modules.find((m) => !m.verrouille) || modules[0];

  const [choisi, setChoisi] = useState<number | null>(
    premier ? premier.id : null
  );

  const index = modules.findIndex((m) => m.id === choisi);

  const mod = index >= 0 ? modules[index] : null;

  const suivant =
    index >= 0 &&
    index + 1 < modules.length &&
    !modules[index + 1].verrouille
      ? modules[index + 1]
      : null;

  const liste = commentaires.filter(
    (c) => c.module_id === choisi
  );

  return (
    <>
      <style>{`
        .yt-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
        }

        @media (min-width:960px) {
          .yt-grid {
            grid-template-columns: minmax(0,1fr) 380px;
            align-items: start;
          }
        }

        .yt-grid > * {
          min-width: 0;
        }

        .yt-player {
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 14px;
          overflow: hidden;
        }

        .yt-mods {
          display: grid;
          gap: 4px;
          max-height: 560px;
          overflow: auto;
          padding-right: 4px;
        }

        .yt-mod {
          width: 100%;
          text-align: left;
          background: none;
          border: 0;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          color: inherit;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .yt-mod:hover {
          background: var(--soft);
        }

        .yt-mod.actif {
          background: var(--soft);
          font-weight: 600;
        }

        .yt-mod:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .yt-num {
          min-width: 26px;
          height: 26px;
          border-radius: 99px;
          display: grid;
          place-items: center;
          font-size: 12px;
          background: var(--line);
        }

        .yt-mod.fait .yt-num {
          background: var(--accent);
          color: #fff;
        }
      `}</style>

      <div className="yt-grid">

        {/* LECTEUR ET CONTENU PRINCIPAL */}

        <div style={{ display: 'grid', gap: 16 }}>

          <div className="yt-player">

            {mod && !mod.verrouille ? (
              <LecteurVideo
                key={mod.id}
                url={mod.video_url}
              />
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                }}
              >
                🔒 Module verrouillé
              </div>
            )}

          </div>

          {mod && (
            <div style={{ display: 'grid', gap: 10 }}>

              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  lineHeight: 1.3,
                }}
              >
                {mod.title}
              </h2>

              <div
                className="row"
                style={{
                  gap: 10,
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >

                <span
                  className="muted"
                  style={{ fontSize: 14 }}
                >
                  {mod.duration}
                </span>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >

                  {acces && (
                    <form action={marquerModule}>

                      <input
                        type="hidden"
                        name="module"
                        value={mod.id}
                      />

                      <input
                        type="hidden"
                        name="cours"
                        value={courseId}
                      />

                      <input
                        type="hidden"
                        name="fait"
                        value={mod.fait ? '1' : '0'}
                      />

                      <button
                        className="btn ghost sm"
                        type="submit"
                      >
                        {mod.fait
                          ? '✓ Terminé · revoir'
                          : 'Marquer comme terminé'}
                      </button>

                    </form>
                  )}

                  {suivant && (
                    <button
                      className="btn sm"
                      type="button"
                      onClick={() => setChoisi(suivant.id)}
                    >
                      Module suivant →
                    </button>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* COMMENTAIRES */}

          <div
            className="card"
            style={{ margin: 0 }}
          >

            <h3 style={{ marginTop: 0 }}>
              Commentaires
            </h3>

            {!mod || mod.verrouille ? (
              <p className="muted">
                Les commentaires s'ouvrent avec le module choisi.
              </p>
            ) : (
              <>

                {acces ? (
                  <form
                    action={envoyerCommentaire}
                    style={{
                      display: 'grid',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >

                    <input
                      type="hidden"
                      name="module"
                      value={mod.id}
                    />

                    <input
                      type="hidden"
                      name="cours"
                      value={courseId}
                    />

                    <textarea
                      name="contenu"
                      rows={2}
                      placeholder="Ajouter un commentaire…"
                      required
                      style={{ marginTop: 0 }}
                    />

                    <button
                      className="btn sm"
                      type="submit"
                      style={{ justifySelf: 'end' }}
                    >
                      Publier
                    </button>

                  </form>
                ) : (
                  <p className="muted">
                    Débloquez la formation pour commenter.
                  </p>
                )}

                <FilCommentaires items={liste as any} cours={String(courseId)} module={mod.id} acces={acces} />
              </>
            )}

          </div>

        </div>

        {/* LISTE DES MODULES ET FORMATEURS */}

        <aside
          style={{
            display: 'grid',
            gap: 16,
          }}
        >

          {/* MODULES */}

          <div
            className="card"
            style={{
              margin: 0,
              padding: 12,
            }}
          >

            <h3
              style={{
                margin: '4px 8px 10px',
              }}
            >
              Contenu du cours
            </h3>

            <div className="yt-mods">

              {modules.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  className={`yt-mod ${
                    choisi === m.id ? 'actif' : ''
                  } ${m.fait ? 'fait' : ''}`}
                  disabled={m.verrouille}
                  onClick={() => setChoisi(m.id)}
                >

                  <span className="yt-num">
                    {m.verrouille
                      ? '🔒'
                      : m.fait
                      ? '✓'
                      : i + 1}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >

                    <span
                      style={{
                        display: 'block',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {m.title}
                    </span>

                    <span
                      className="muted"
                      style={{ fontSize: 12 }}
                    >
                      {m.duration}
                    </span>

                  </span>

                </button>
              ))}

            </div>

          </div>

          {/* FORMATEURS */}

          {formateurs.length > 0 && (
            <div
              className="card"
              style={{ margin: 0 }}
            >

              <h3 style={{ marginTop: 0 }}>
                Formateurs
              </h3>

              <div
                style={{
                  display: 'grid',
                  gap: 14,
                }}
              >

                {formateurs.map((f) => {

                  const liensRes = Object.entries(
                    f.reseaux || {}
                  ).filter(
                    ([, v]) => v
                  ) as [string, string][];

                  return (
                    <div
                      key={f.id}
                      style={{
                        display: 'grid',
                        gap: 8,
                      }}
                    >

                      <div
                        className="row"
                        style={{ gap: 12 }}
                      >

                        <div className="avatar">
                          {(f.name || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <Link href={`/espace/membres/${f.id}`} style={{ color: 'inherit' }}><strong>{f.name}</strong></Link>
                          <Certifie certifie={f.certifie} role={f.role} />

                          {f.certifie && (
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--accent)',
                                fontWeight: 600,
                              }}
                            >
                              ✓ {f.role === 'partenaire'
                                ? 'Partenaire certifié'
                                : 'Formateur certifié'}
                            </div>
                          )}

                        </div>

                      </div>

                      {liensRes.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >

                          {liensRes.map(([cle, url]) => (
                            <a
                              key={cle}
                              className="btn ghost sm"
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {RESEAUX[cle] || cle}
                            </a>
                          ))}

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </aside>

      </div>
    </>
  );
              }
