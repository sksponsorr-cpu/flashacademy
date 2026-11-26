import { session } from '@/lib/session';
import { peutAcceder, fcfa } from '@/lib/access';
import { payerOffre } from '../paiement/actions';
import BoutonPayer from '@/components/BoutonPayer';

export const dynamic = 'force-dynamic';

const PAYS = [
  ['GH', '🇬🇭 Ghana'],
  ['SL', '🇸🇱 Sierra Leone'],
  ['NG', '🇳🇬 Nigeria'],
  ['TZ', '🇹🇿 Tanzanie'],
  ['UG', '🇺🇬 Ouganda'],
  ['CD', '🇨🇩 République démocratique du Congo'],
  ['CG', '🇨🇬 République du Congo'],
  ['CM', '🇨🇲 Cameroun'],
  ['CI', "🇨🇮 Côte d'Ivoire"],
  ['SN', '🇸🇳 Sénégal'],
  ['BJ', '🇧🇯 Bénin'],
  ['TG', '🇹🇬 Togo'],
  ['GA', '🇬🇦 Gabon'],
  ['GM', '🇬🇲 Gambie'],
  ['RW', '🇷🇼 Rwanda'],
  ['GN', '🇬🇳 Guinée'],
  ['BF', '🇧🇫 Burkina Faso'],
  ['ML', '🇲🇱 Mali'],
] as const;

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

        @media (min-width:760px) {
          .offres-grid {
            grid-template-columns: repeat(auto-fit,minmax(280px,1fr));
          }
        }

        .offre {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 17px;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid var(--line);
          background: var(--card,#fff);
        }

        .offre.best {
          border: 2px solid var(--accent);
          box-shadow: 0 10px 30px rgba(37,99,235,.15);
        }

        .offre-badge {
          position: absolute;
          top: -12px;
          left: 24px;
          background: var(--accent);
          color: #fff;
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
          gap: 10px;
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
          font-size: 34px;
          font-weight: 850;
          line-height: 1.1;
        }

        .paiement-form {
          display: grid;
          gap: 12px;
        }

        .paiement-form label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .paiement-form input,
        .paiement-form select {
          width: 100%;
          box-sizing: border-box;
          min-height: 46px;
          padding: 11px 13px;
          border: 1px solid var(--line);
          border-radius: 11px;
          background: var(--card,#fff);
          color: inherit;
          font: inherit;
        }

        .paiement-form input:focus,
        .paiement-form select:focus {
          outline: 2px solid var(--accent);
          outline-offset: 1px;
        }

        .paiement-note {
          font-size: 12px;
          line-height: 1.5;
          opacity: .75;
        }
      `}</style>

      <div style={{
        textAlign: 'center',
        margin: '8px 0 25px'
      }}>
        <h1 style={{ margin: 0 }}>Nos offres</h1>

        <p className="muted" style={{ marginTop: 7 }}>
          {acces
            ? 'Vous avez accès à toutes les formations.'
            : 'Choisissez votre formule et profitez de toutes nos formations.'}
        </p>
      </div>

      {searchParams.erreur && (
        <div
          className="msg erreur"
          style={{ maxWidth: 960, margin: '0 auto 18px' }}
        >
          Le paiement n'a pas pu être lancé.
          Code : {searchParams.erreur}.
          Vérifiez vos informations et réessayez.
        </div>
      )}

      <div className="offres-grid">

        {(offres || []).map((o: any) => (
          <div
            key={o.id}
            className={`offre ${o.best ? 'best' : ''}`}
          >

            {o.best && (
              <span className="offre-badge">
                Le plus choisi
              </span>
            )}

            <div>
              <h3 style={{ margin: 0 }}>
                {o.name}
              </h3>

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
                  className="paiement-form"
                >

                  <input
                    type="hidden"
                    name="offre"
                    value={o.id}
                  />

                  <div>
                    <label htmlFor={`nom-${o.id}`}>
                      Votre nom complet
                    </label>

                    <input
                      id={`nom-${o.id}`}
                      type="text"
                      name="nom"
                      placeholder="Entrez votre nom complet"
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`mobile-${o.id}`}>
                      Votre numéro de téléphone
                    </label>

                    <input
                      id={`mobile-${o.id}`}
                      type="tel"
                      name="mobile"
                      placeholder="Votre numéro mobile"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor={`pays-${o.id}`}>
                      Votre pays
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
                    Votre adresse e-mail sera récupérée
                    automatiquement depuis votre compte.
                    Paiement sécurisé avec FlashPay.
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
            fontSize: 14
          }}
        >
          Paiement mobile money sécurisé.
          Votre accès sera activé après confirmation du paiement.
        </p>
      )}
    </>
  );
         }
