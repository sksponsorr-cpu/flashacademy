'use client';

import { useState } from 'react';
import MediaField from '@/components/MediaField';

// Relie le champ galerie/lien à un formulaire serveur : la valeur est envoyée avec le nom indiqué.
export default function MediaInput({
  name,
  label,
  defaultValue = '',
  type = 'tout',
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: 'image' | 'video' | 'tout';
}) {
  const [valeur, setValeur] = useState(defaultValue);
  return (
    <div style={{ margin: '8px 0 14px' }}>
      <MediaField label={label} value={valeur} onChange={setValeur} type={type} />
      <input type="hidden" name={name} value={valeur} />
    </div>
  );
}
