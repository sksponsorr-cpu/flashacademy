// Affiché tout de suite pendant le changement de page dans l'espace membre.
export default function Chargement() {
  return (
    <div style={{ display: 'grid', gap: 14, padding: '24px 0' }} aria-busy="true" aria-live="polite">
      <div style={{ height: 22, width: '45%', borderRadius: 8, background: 'var(--line, #e5e7eb)', opacity: 0.7 }} />
      <div style={{ height: 14, width: '70%', borderRadius: 8, background: 'var(--line, #e5e7eb)', opacity: 0.5 }} />
      <div style={{ height: 180, borderRadius: 16, background: 'var(--line, #e5e7eb)', opacity: 0.4 }} />
      <div style={{ height: 180, borderRadius: 16, background: 'var(--line, #e5e7eb)', opacity: 0.4 }} />
    </div>
  );
}
