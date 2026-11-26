'use client';

import { useState } from 'react';

type Module = { id?: number; titre: string; duree: string; video: string };

// Éditeur de modules : un bloc par module (titre, durée, lien vidéo). Envoie la liste en JSON dans un champ caché.
// initial : modules déjà enregistrés (avec leur id) quand on modifie une formation.
export default function ModulesEditor({ name = 'modules', initial }: { name?: string; initial?: Module[] }) {
  const [modules, setModules] = useState<Module[]>(
    initial && initial.length ? initial : [{ titre: '', duree: '', video: '' }]
  );

  const modifier = (i: number, champ: keyof Module, valeur: string) =>
    setModules((m) => m.map((x, k) => (k === i ? { ...x, [champ]: valeur } : x)));
  const retirer = (i: number) => setModules((m) => m.filter((_, k) => k !== i));
  const ajouter = () => setModules((m) => [...m, { titre: '', duree: '', video: '' }]);
  const monter = (i: number) =>
    setModules((m) => {
      if (i === 0) return m;
      const copie = [...m];
      [copie[i - 1], copie[i]] = [copie[i], copie[i - 1]];
      return copie;
    });

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
      {modules.map((m, i) => (
        <div key={m.id ?? `nouveau-${i}`} className="card" style={{ margin: 0, display: 'grid', gap: 8 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>Module {i + 1}{m.id ? '' : ' (nouveau)'}</strong>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn ghost sm" onClick={() => monter(i)} disabled={i === 0}>↑</button>
              <button type="button" className="btn danger sm" onClick={() => retirer(i)} disabled={modules.length === 1}>Retirer</button>
            </div>
          </div>
          <label>Titre du module</label>
          <input value={m.titre} onChange={(e) => modifier(i, 'titre', e.target.value)} placeholder="Ex : Créer son compte" />
          <label>Durée</label>
          <input value={m.duree} onChange={(e) => modifier(i, 'duree', e.target.value)} placeholder="Ex : 12 min" />
          <label>Lien vidéo (YouTube, Vimeo ou fichier direct)</label>
          <input type="url" value={m.video} onChange={(e) => modifier(i, 'video', e.target.value)} placeholder="https://..." />
        </div>
      ))}
      <button type="button" className="btn ghost block" onClick={ajouter}>+ Ajouter un module</button>
      <input type="hidden" name={name} value={JSON.stringify(modules.filter((m) => m.titre.trim()))} />
    </div>
  );
}
