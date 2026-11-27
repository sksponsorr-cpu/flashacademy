// Découpe un titre en mots animés, un par un, avec un léger décalage.
export default function MotTitre({ texte, pas = 70 }: { texte: string; pas?: number }) {
  return (
    <>
      {texte.split(' ').map((mot, i) => (
        <span key={i} className="mot" style={{ ['--d' as any]: `${i * pas}ms`, marginRight: '0.25em' }}>
          {mot}
        </span>
      ))}
    </>
  );
}
