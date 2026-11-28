'use client';

import { useState, type ChangeEvent } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { lienIntegration } from '@/lib/media';

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  // 'image' : miniatures ; 'video' : vidéos depuis la galerie ; 'tout' : les deux
  type?: 'image' | 'video' | 'tout';
};

// Champ d'ajout de média : depuis la galerie du téléphone OU par lien (YouTube, Vimeo, ou fichier direct).
export default function MediaField({ label, value, onChange, type = 'tout' }: Props) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const accept =
    type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'image/*,video/*';

  async function importerDepuisGalerie(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setEnvoi(true);
    setErreur('');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const nom = fichier.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const chemin = `medias/${Date.now()}-${nom}`;
    const { error } = await supabase.storage
      .from('photos')
      .upload(chemin, fichier, { contentType: fichier.type });
    if (error) {
      setErreur(`Envoi impossible : ${error.message}`);
    } else {
      const { data } = supabase.storage.from('photos').getPublicUrl(chemin);
      onChange(data.publicUrl);
    }
    setEnvoi(false);
    e.target.value = '';
  }

  const integration = value ? lienIntegration(value) : null;
  const estVideoFichier = /\.(mp4|webm|mov)(\?|$)/i.test(value);
  const estImage = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(value);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label
          style={{
            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
            background: 'var(--primary, #2563eb)', color: '#fff', fontWeight: 600,
          }}
        >
          {envoi ? 'Envoi en cours…' : 'Choisir depuis la galerie'}
          <input
            type="file"
            accept={accept}
            onChange={importerDepuisGalerie}
            disabled={envoi}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <input
        type="url"
        placeholder={type === 'image' ? 'ou coller un lien d’image' : 'ou coller un lien YouTube / Vimeo'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: 12, borderRadius: 12, border: '1px solid var(--border, #e5e7eb)' }}
      />

      {erreur && <p style={{ color: '#dc2626', margin: 0 }}>{erreur}</p>}

      {value && (
        <div style={{ borderRadius: 14, overflow: 'hidden', background: '#000' }}>
          {integration ? (
            <iframe
              src={integration}
              title="Aperçu vidéo"
              style={{ width: '100%', aspectRatio: '16 / 9', border: 0 }}
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : estVideoFichier ? (
            <video src={value} controls style={{ width: '100%' }} />
          ) : estImage || type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" decoding="async" src={value} alt="Aperçu" style={{ width: '100%', display: 'block' }} />
          ) : (
            <p style={{ color: '#fff', padding: 12, margin: 0 }}>Lien non reconnu : utilisez YouTube, Vimeo ou un fichier.</p>
          )}
        </div>
      )}
    </div>
  );
}
