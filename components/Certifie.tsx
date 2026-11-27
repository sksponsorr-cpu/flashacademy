// Badge de certification : affiché pour les administrateurs, les partenaires
// et les profils certifiés manuellement par l'admin.
export default function Certifie({
  certifie,
  role,
}: {
  certifie?: boolean | null;
  role?: string | null;
}) {
  const ok = !!certifie || role === 'admin' || role === 'partenaire';
  if (!ok) return null;
  const libelle = role === 'admin' ? 'Administrateur certifié' : 'Certifié Flash Academy';
  return (
    <span
      title={libelle}
      aria-label={libelle}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 16,
        height: 16,
        marginLeft: 4,
        borderRadius: '50%',
        background: 'var(--accent)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 800,
        verticalAlign: 'middle',
      }}
    >
      ✓
    </span>
  );
}
