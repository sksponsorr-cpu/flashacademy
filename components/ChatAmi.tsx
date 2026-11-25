'use client';

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';

type Msg = { id: string; role: 'user' | 'assistant'; contenu: string };

// Conversation avec affichage immédiat du message envoyé et indicateur « Ami écrit… ».
export default function ChatAmi({
  initial,
  envoyer,
  erreur,
}: {
  initial: Msg[];
  envoyer: (fd: FormData) => Promise<void>;
  erreur?: string;
}) {
  const [enAttente, setEnAttente] = useState<string | null>(null);
  const [, start] = useTransition();
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [initial, enAttente]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const q = String(fd.get('question') ?? '').trim();
    const video = fd.get('video') as File | null;
    if (!q && !(video && video.size > 0)) return;
    setEnAttente(q || 'Vidéo jointe');
    form.reset();
    start(async () => {
      try {
        await envoyer(fd);
      } finally {
        setEnAttente(null);
      }
    });
  }

  return (
    <>
      <div className="card" style={{ minHeight: 320, display: 'flex', flexDirection: 'column', gap: 6, padding: 16 }}>
        {initial.length === 0 && !enAttente && (
          <div style={{ margin: 'auto', textAlign: 'center', padding: 20 }}>
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Bonjour 👋</p>
            <p className="muted" style={{ margin: 0 }}>Posez votre première question. Vous pouvez aussi joindre une courte vidéo.</p>
          </div>
        )}
        {initial.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div className={`bubble ${m.role === 'user' ? 'me' : 'them'}`} style={{ whiteSpace: 'pre-line', maxWidth: '82%' }}>
              {m.contenu}
            </div>
          </div>
        ))}
        {enAttente && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="bubble me" style={{ whiteSpace: 'pre-line', maxWidth: '82%' }}>{enAttente}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div className="bubble them" style={{ color: 'var(--muted)' }}>Ami écrit…</div>
            </div>
          </>
        )}
        {erreur && <div className="msg erreur" style={{ marginTop: 8 }}>{erreur}</div>}
        <div ref={fin} />
      </div>

      <form onSubmit={onSubmit} className="card" style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        <textarea name="question" rows={3} placeholder="Écrivez votre question…" style={{ marginTop: 0 }} />
        <div className="row" style={{ gap: 10 }}>
          <label className="btn ghost sm" style={{ margin: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            📎 Vidéo
            <input name="video" type="file" accept="video/*" style={{ display: 'none' }} />
          </label>
          <button className="btn sm grow" type="submit" disabled={!!enAttente}>
            {enAttente ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: 12 }}>Vidéo facultative, 4 Mo maximum.</p>
      </form>
    </>
  );
}
