import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { payerOffre } from '../paiement/actions';
import BoutonPayer from '@/components/BoutonPayer';

export const dynamic = 'force-dynamic';

const PAYS = [
  ['CM', 'Cameroun'],
  ['CI', "Côte d'Ivoire"],
  ['SN', 'Sénégal'],
  ['BJ', 'Bénin'],
  ['TG', 'Togo'],
];

export default async function Offres({ searchParams }: { searchParams: { erreur?: string } }) {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);
  const { data: offres } = await supabase.from('offers').select('id,name,price,per,feat,best').order('price');

  return (
    <>
      <style>{`
        .offres-grid{display:grid;gap:16px;grid-template-columns:1fr;max-width:960px;margin:0 auto}
        @media (min-width:760px){.offres-grid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}}
        .offre{position:relative;display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:20px;border:1px solid var(--line);background:var(--card,#fff)}
        .offre.best{border:2px solid var(--accent);box-shadow:0 10px 30px rgba(37,99,235,.15)}
        .offre-badge{position:absolute;top:-12px;left:24px;background:var(--accent);color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:99px}
        .offre-feat{list-style:none;padding:0;margin:0;display:grid;gap:10px}
        .offre-feat li{display:flex;gap:10px;align-items:flex-start;font-size:15px}
        .offre-feat li::before{content:"✓";color:var(--accent);font-weight:700}
        .offre-prix{font-size:34px;font-weight:800;line-height:1.1}
      `}</style>

      <div style={{ textAlign: 'center', margin: '8px 0 20px' }}>
        <h1 style={{ margin: 0 }}>Offres</h1>
        <p className="muted" style={{ margin: '6px 0 0' }}>
          {acces
            ? 'Vous avez accès à toutes les formations.'
            : 'Choisissez une offre pour débloquer les formations, les modules et les commentaires.'}
        </p>
      </div>

      {searchParams.erreur && (
        <div className="msg erreur" style={{ maxWidth: 960, margin: '0 auto 16px' }}>
          Le paiement n'a pas pu être lancé (code : {searchParams.erreur}). Réessayez ou contactez l'équipe en indiquant ce code.
        </div>
      )}

      <div className="offres-grid">
        {(offres || []).map((o: any) => (
          <div key={o.id} className={`offre ${o.best ? 'best' : ''}`}>
            {o.best && <span className="offre-badge">Le plus choisi</span>}

            <div>
              <h3 style={{ margin: 0 }}>{o.name}</h3>
              <div className="offre-prix" style={{ marginTop: 8 }}>{fcfa(o.price)}</div>
              <div className="muted" style={{ fontSize: 14 }}>{o.per}</div>
            </div>

            {(o.feat || []).length > 0 && (
              <ul className="offre-feat">
                {(o.feat || []).map((f: string) => <li key={f}>{f}</li>)}
              </ul>
            )}

            <div style={{ marginTop: 'auto' }}>
              {acces ? (
                <span className="btn off block" style={{ textAlign: 'center' }}>Offre active</span>
              ) : (
                <form action={payerOffre} style={{ display: 'grid', gap: 10 }}>
                  <input type="hidden" name="offre" value={o.id} />
                  <select name="pays" defaultValue="CM" style={{ marginTop: 0 }}>
                    {PAYS.map(([code, nom]) => <option key={code} value={code}>{nom}</option>)}
                  </select>
                  <BoutonPayer montant={fcfa(o.price)} />
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {!acces && (
        <p className="muted" style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
          Paiement par mobile money, sur la page sécurisée FlashPay. L'accès s'active dès la confirmation.
        </p>
      )}
    </>
  );
}
