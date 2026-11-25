'use client';

import { useState } from 'react';
import LecteurVideo from '@/components/LecteurVideo';

type Module = { id: number; title: string; duration: string; video_url?: string | null; verrouille: boolean; fait: boolean };
type Commentaire = { id: string; module_id: number; contenu: string; auteur: string; created_at: string };

// Page de cours : lecteur + modules à gauche, commentaires du module choisi à droite.
export default function CoursInteractif({
  courseId,
  modules,
  commentaires,
  acces,
  envoyerCommentaire,
  marquerModule,
}: {
  courseId: number;
  modules: Module[];
  commentaires: Commentaire[];
  acces: boolean;
  envoyerCommentaire: (fd: FormData) => Promise<void>;
  marquerModule: (fd: FormData) => Promise<void>;
}) {
  const premier = modules.find((m) => !m.verrouille) || modules[0];
  const [choisi, setChoisi] = useState<number | null>(premier ? premier.id : null);
  const mod = modules.find((m) => m.id === choisi) || null;
  const liste = commentaires.filter((c) => c.module_id === choisi);

  return (
    <>
      <style>{`
        .cours-grid{display:grid;gap:16px;grid-template-columns:1fr}
        @media (min-width:900px){.cours-grid{grid-template-columns:minmax(0,1fr) 360px;align-items:start}}
        .cours-liste button.mod{width:100%;text-align:left;background:none;border:0;padding:12px;border-radius:12px;cursor:pointer;color:inherit;display:flex;justify-content:space-between;gap:8px;align-items:center}
        .cours-liste button.mod.actif{background:var(--soft)}
        .cours-liste button.mod:disabled{opacity:.55;cursor:not-allowed}
      `}</style>

      <div className="cours-grid">
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ aspectRatio: '16/9', background: '#000' }}>
              {mod && !mod.verrouille ? (
                <LecteurVideo url={mod.video_url} />
              ) : (
                <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#fff' }}>🔒 Module verrouillé</div>
              )}
            </div>
            {mod && (
              <div style={{ padding: 16 }}>
                <h2 style={{ margin: 0 }}>{mod.title}</h2>
                <p className="muted" style={{ margin: '4px 0 0' }}>{mod.duration}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Commentaires</h3>
            {!mod || mod.verrouille ? (
              <p className="muted">Les commentaires s'ouvrent avec le module choisi.</p>
            ) : (
              <>
                <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
                  {liste.length === 0 && <p className="muted">Aucun commentaire pour ce module.</p>}
                  {liste.map((c) => (
                    <div key={c.id} style={{ background: 'var(--soft)', borderRadius: 14, padding: 12 }}>
                      <strong style={{ fontSize: 14 }}>{c.auteur}</strong>
                      <p style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>{c.contenu}</p>
                    </div>
                  ))}
                </div>
                {acces ? (
                  <form action={envoyerCommentaire} style={{ display: 'grid', gap: 8 }}>
                    <input type="hidden" name="module" value={mod.id} />
                    <input type="hidden" name="cours" value={courseId} />
                    <textarea name="contenu" rows={3} placeholder="Partagez votre avis sur ce module…" required style={{ marginTop: 0 }} />
                    <button className="btn sm" type="submit">Publier</button>
                  </form>
                ) : (
                  <p className="muted">Débloquez la formation pour commenter.</p>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="card cours-liste" style={{ padding: 10 }}>
          <h3 style={{ margin: '6px 10px 10px' }}>Modules</h3>
          {modules.map((m, i) => (
            <div key={m.id}>
              <button
                type="button"
                className={`mod ${choisi === m.id ? 'actif' : ''}`}
                disabled={m.verrouille}
                onClick={() => setChoisi(m.id)}
              >
                <span>{i + 1}. {m.title}</span>
                <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {m.verrouille ? '🔒' : m.fait ? '✓ fait' : m.duration}
                </span>
              </button>
              {acces && choisi === m.id && (
                <form action={marquerModule} style={{ padding: '0 12px 10px' }}>
                  <input type="hidden" name="module" value={m.id} />
                  <input type="hidden" name="cours" value={courseId} />
                  <input type="hidden" name="fait" value={m.fait ? '1' : '0'} />
                  <button className="btn ghost sm" type="submit">{m.fait ? 'Revoir' : 'Marquer fait'}</button>
                </form>
              )}
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
