import { session } from '@/lib/session';
import { peutAcceder } from '@/lib/access';
import { payerOffre } from '../paiement/actions';
import OffresFlow from '@/components/OffresFlow';
import { PAYS } from '@/lib/devises';

export const dynamic = 'force-dynamic';

export default async function Offres({ searchParams }: { searchParams: { erreur?: string } }) {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);

  if (acces) {
    return (
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1>Votre accès est actif</h1>
        <p className="muted">Vous avez accès à toutes les formations.</p>
      </div>
    );
  }

  const { data: offres } = await supabase
    .from('offers')
    .select('id,name,price,per,feat,best')
    .order('price');

  return (
    <OffresFlow
      offres={(offres || []) as any}
      pays={PAYS}
      payer={payerOffre}
      erreur={searchParams.erreur}
    />
  );
}
