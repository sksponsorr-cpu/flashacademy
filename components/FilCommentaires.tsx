import Link from 'next/link';
import Certifie from '@/components/Certifie';
import { repondreCommentaire, basculerLike } from '@/app/espace/commentaires-actions';

export type Fil = {
  id: string;
  contenu: string;
  created_at: string;
  auteur: string;
  auteur_id: string;
  auteur_role?: string;
  auteur_certifie?: boolean;
  parent_id?: string | null;
  likes?: number;
  aime?: boolean;
};

const quand = (d: string) => {
  const x = new Date(d);
  const maintenant = new Date();
  if (x.toDateString() === maintenant.toDateString()) {
    return x.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return x.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

function Ligne({ c, cours, module, acces }: { c: Fil; cours: string; module: number; acces: boolean }) {
  return (
    <div className="fc-ligne">
      <div className="fc-av">{(c.auteur || '?').charAt(0).toUpperCase()}</div>
      <div className="fc-corps">
        <div className="fc-tete">
          <Link href={`/espace/membres/${c.auteur_id}`} className="fc-nom">{c.auteur}</Link>
          <Certifie certifie={c.auteur_certifie} role={c.auteur_role} />
          <span className="fc-date">· {quand(c.created_at)}</span>
        </div>
        <p className="fc-txt">{c.contenu}</p>
        <div className="fc-actions">
          {acces ? (
            <form action={basculerLike}>
              <input type="hidden" name="comment" value={c.id} />
              <input type="hidden" name="cours" value={cours} />
              <button type="submit" className={`fc-like ${c.aime ? 'on' : ''}`}>
                {c.aime ? '♥' : '♡'} {c.likes || 0}
              </button>
            </form>
          ) : (
            <span className="fc-like">♡ {c.likes || 0}</span>
          )}
          {acces && (
            <details className="fc-rep">
              <summary>Répondre</summary>
              <form action={repondreCommentaire}>
                <input type="hidden" name="parent" value={c.id} />
                <input type="hidden" name="module" value={module} />
                <input type="hidden" name="cours" value={cours} />
                <textarea name="contenu" rows={2} required placeholder={`Répondre à ${c.auteur}…`} />
                <button className="btn sm" type="submit">Envoyer</button>
              </form>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FilCommentaires({
  items,
  cours,
  module,
  acces,
}: {
  items: Fil[];
  cours: string;
  module: number;
  acces: boolean;
}) {
  if (items.length === 0) {
    return <p className="muted">Soyez le premier à commenter ce module.</p>;
  }

  const ids = new Set(items.map((i) => i.id));
  const racines = items.filter((i) => !i.parent_id || !ids.has(i.parent_id));
  const reponsesDe = (id: string) => items.filter((i) => i.parent_id === id);

  return (
    <div className="fc">
      <style>{`
        .fc{display:grid;gap:18px}
        .fc-ligne{display:flex;gap:12px;align-items:flex-start}
        .fc-av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;display:grid;place-items:center;font-weight:700;flex-shrink:0;font-size:15px}
        .fc-corps{flex:1;min-width:0}
        .fc-tete{display:flex;flex-wrap:wrap;align-items:center;gap:4px;font-size:14px}
        .fc-nom{font-weight:700;color:var(--text)}
        .fc-date{color:var(--muted);font-size:12px}
        .fc-txt{margin:4px 0 0;white-space:pre-line;font-size:15px;line-height:1.5}
        .fc-actions{display:flex;align-items:center;gap:14px;margin-top:8px;flex-wrap:wrap}
        .fc-like{background:none;border:0;padding:4px 2px;color:var(--muted);font:inherit;font-size:14px;cursor:pointer}
        .fc-like.on{color:#ff4d6d}
        .fc-rep summary{list-style:none;cursor:pointer;color:var(--muted);font-size:14px;font-weight:600}
        .fc-rep summary::-webkit-details-marker{display:none}
        .fc-rep form{display:grid;gap:8px;margin-top:10px}
        .fc-rep textarea{margin-top:0}
        .fc-rep button{justify-self:end}
        .fc-reps{margin:12px 0 0 50px;display:grid;gap:14px;padding-left:14px;border-left:2px solid var(--line)}
      `}</style>
      {racines.map((r) => (
        <div key={r.id}>
          <Ligne c={r} cours={cours} module={module} acces={acces} />
          {reponsesDe(r.id).length > 0 && (
            <div className="fc-reps">
              {reponsesDe(r.id).map((x) => (
                <Ligne key={x.id} c={x} cours={cours} module={module} acces={acces} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
