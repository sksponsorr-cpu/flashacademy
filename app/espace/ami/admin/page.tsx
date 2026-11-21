import { redirect } from 'next/navigation';
import { session } from '@/lib/session';
import { estAdmin } from '@/lib/access';
import { ajouterConsigne, supprimerConsigne } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AmiAdmin() {
  const { supabase, profil } = await session();
  if (!estAdmin(profil)) redirect('/espace');
  const { data } = await supabase
    .from('ami_consignes')
    .select('id,type,titre,contenu,created_at')
    .order('created_at', { ascending: false });

  return (
    <>
      <h1>Agence Ami : consignes</h1>
      <p className="muted">Ajoutez des consignes, astuces, tests ou documents. Les vocaux, PDF et vidéos sont transcrits automatiquement.</p>

      <div className="card">
        <h3>Ajouter</h3>
        <form action={ajouterConsigne}>
          <label>Type</label>
          <select name="type">
            <option value="texte">Consigne</option>
            <option value="astuce">Astuce</option>
            <option value="test">Test</option>
          </select>
          <label>Titre</label>
          <input name="titre" required />
          <label>Texte (facultatif)</label>
          <textarea name="contenu" rows={3} />
          <label>Fichier : vocal, PDF ou vidéo (4 Mo maximum)</label>
          <input name="fichier" type="file" accept="audio/*,video/*,application/pdf" />
          <button className="btn block" style={{ marginTop: 12 }} type="submit">Enregistrer</button>
        </form>
      </div>

      {(data || []).map((c: any) => (
        <div key={c.id} className="card">
          <div className="muted" style={{ fontSize: 12 }}>{c.type}</div>
          <strong>{c.titre}</strong>
          <p className="muted">{(c.contenu || '').slice(0, 300)}</p>
          <form action={supprimerConsigne}>
            <input type="hidden" name="id" value={c.id} />
            <button className="btn danger sm" type="submit">Supprimer</button>
          </form>
        </div>
      ))}
    </>
  );
}
