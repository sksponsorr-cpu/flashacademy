import { basculerGratuit } from '@/app/espace/admin/gratuit-actions';

// Bouton à placer dans la liste des modules de l'admin.
// Fonctionne sans JavaScript côté client : c'est un formulaire serveur.
export default function ModuleGratuit({ id, gratuit }: { id: number; gratuit: boolean }) {
  return (
    <form action={basculerGratuit} style={{ display: 'inline' }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="gratuit" value={gratuit ? 'false' : 'true'} />
      <button
        type="submit"
        className={gratuit ? 'btn sm' : 'btn sm ghost'}
        title={gratuit ? 'Ce module est gratuit pour tous' : 'Rendre ce module gratuit'}
      >
        {gratuit ? '✓ Gratuit' : 'Rendre gratuit'}
      </button>
    </form>
  );
}
