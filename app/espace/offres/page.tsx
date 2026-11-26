import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { payerOffre } from '../paiement/actions';
import BoutonPayer from '@/components/BoutonPayer';

export const dynamic = 'force-dynamic';

const PAYS = [
  ['CM', '🇨🇲 Cameroun'],
  ['CI', "🇨🇮 Côte d'Ivoire"],
  ['SN', '🇸🇳 Sénégal'],
  ['BJ', '🇧🇯 Bénin'],
  ['TG', '🇹🇬 Togo'],
];

export default async function Offres({
  searchParams,
}: {
  searchParams: { erreur?: string };
}) {
  const { supabase, profil } = await session();
  const acces = peutAcceder(profil);

  const { data: offres } = await supabase
    .from('offers')
    .select('id,name,price,per,feat,best')
    .order('price');

  return (
    <>
      <style>{`
        .offres-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: 1fr;
          max-width: 960px;
          margin: 0 auto;
        }

        @media (min-width: 760px) {
          .offres-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        .offre {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 25px;
          border-radius: 22px;
          border: 1px solid var(--line);
          background: var(--card, #fff);
        }

        .offre.best {
          border: 2px solid var(--accent);
          box-shadow: 0 12px 35px rgba(37,99,235,.13);
        }

        .offre-badge {
          position: absolute;
          top: -12px;
          left: 24px;
          background: var(--accent);
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 13px;
          border-radius: 99px;
        }

        .offre-feat {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 11px;
        }

        .offre-feat li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 14px;
        }

        .offre-feat li::before {
          content: "✓";
          color: var(--accent);
          font-weight: 800;
        }

        .offre-prix {
          font-size: 35px;
          font-weight: 850;
          line-height: 1.1;
        }

        .paiement-infos {
          display: grid;
          gap: 7px;
        }

        .paiement-infos label {
          font-size: 13px;
          font-weight: 700;
        }

        .paiement-infos input,
        .paiement-infos select {
          width: 100%;
          box-sizing: border-box;
          min-height: 46px;
          padding: 11px 13px;
          border-radius: 11px;
          border: 1px solid var(--line);
          background: var(--card, #fff);
          color: inherit;
          font: inherit;
        }

        .paiement-infos input:focus,
        .paiement-infos select:focus {
          outline: 2px solid var(--accent);
          outline-offset: 1px;
        }

        .paiement-note {
          font-size: 12px;
          line-height: 1.5;
          opacity: .75;
        }
      `}</style>

      <div style={{ textAlign: 'center', margin: '8px 0 25px' }}>
        <h1 style={{ margin: 0 }}>Nos offres</h1>

        <p className="muted" style={{ margin: '7px 0 0' }}>
          {acces
            ? 'Vous avez accès à toutes les formations.'
            : 'Choisissez votre formule et profitez de toutes les fonctionnalités.'}
        </p>
      </div>

      {searchParams.erreur && (
        <div
          className="msg erreur"
          style={{ maxWidth: 960, margin: '0 auto 18px' }}
        >
          Le paiement n'a pas pu être lancé.
          (Code : {searchParams.erreur}). Vérifiez vos informations et réessayez.
        </div>
      )}

      <div className="offres-grid">
        {(offres || []).map((o: any) => (
          <div
            key={o.id}
            className={`offre ${o.best ? 'best' : ''}`}
          >
            {o.best && (
              <span className="offre-badge">Le plus choisi</span>
            )}

            <div>
              <h3 style={{ margin: 0 }}>{o.name}</h3>

              <div
                className="offre-prix"
                style={{ marginTop: 9 }}
              >
                {fcfa(o.price)}
              </div>

              <div className="muted" style={{ fontSize: 14 }}>
                {o.per}
              </div>
            </div>

            {(o.feat || []).length > 0 && (
              <ul className="offre-feat">
                {(o.feat || []).map((f: string) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}

            <div style={{ marginTop: 'auto' }}>
              {acces ? (
                <span
                  className="btn off block"
                  style={{ textAlign: 'center' }}
                >
                  Offre active
                </span>
              ) : (
                <form
                  action={payerOffre}
                  style={{ display: 'grid', gap: 13 }}
                >
                  <input
                    type="hidden"
                    name="offre"
                    value={o.id}
                  />

                  <div className="paiement-infos">
                    <label htmlFor={`nom-${o.id}`}>
                      Nom complet du payeur
                    </label>

                    <input
                      id={`nom-${o.id}`}
                      type="text"
                      name="name"
                      placeholder="Exemple : Jean Dupont"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="paiement-infos">
                    <label htmlFor={`mobile-${o.id}`}>
                      Numéro mobile du payeur
                    </label>

                    <input
                      id={`mobile-${o.id}`}
                      type="tel"
                      name="mobile"
                      placeholder="Exemple : 699000000"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="paiement-infos">
                    <label htmlFor={`pays-${o.id}`}>
                      Pays de paiement
                    </label>

                    <select
                      id={`pays-${o.id}`}
                      name="pays"
                      defaultValue="CM"
                      required
                    >
                      {PAYS.map(([code, nom]) => (
                        <option key={code} value={code}>
                          {nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <BoutonPayer montant={fcfa(o.price)} />

                  <p className="paiement-note">
                    Vos informations servent uniquement à identifier
                    le payeur lors du paiement sécurisé FlashPay.
                  </p>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>

      {!acces && (
        <p
          className="muted"
          style={{
            marginTop: 22,
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          Paiement sécurisé par mobile money avec FlashPay.
          Votre accès sera activé après confirmation du paiement.
        </p>
      )}
    </>
  );
}
