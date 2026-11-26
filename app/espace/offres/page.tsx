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
  ['RW', '🇷🇼 Rwanda'],
  ['GN', '🇬🇳 Guinée'],
  ['BF', '🇧🇫 Burkina Faso'],
  ['ML', '🇲🇱 Mali'],
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
        .pricing-page {
          max-width: 1080px;
          margin: 0 auto;
          padding: 24px 0 110px;
        }

        .pricing-hero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          text-align: center;
          padding: 34px 22px 30px;
          border: 1px solid var(--line);
          border-radius: 28px;
          background:
            radial-gradient(
              ellipse at 15% 0%,
              rgba(79,140,255,.22),
              transparent 48%
            ),
            radial-gradient(
              ellipse at 90% 100%,
              rgba(139,92,246,.18),
              transparent 42%
            ),
            var(--card);
        }

        .pricing-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border: 1px solid var(--line);
          border-radius: 99px;
          color: var(--accent);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          background: var(--bg);
        }

        .pricing-hero h1 {
          font-size: clamp(30px,6vw,46px);
          letter-spacing: -1.5px;
          line-height: 1.05;
          margin: 18px 0 12px;
        }

        .pricing-hero p {
          max-width: 620px;
          margin: 0 auto;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.65;
        }

        .pricing-trust {
          display: flex;
          justify-content: center;
          gap: 10px 20px;
          flex-wrap: wrap;
          margin-top: 22px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%,280px),1fr)
          );
          gap: 18px;
          margin-top: 24px;
          align-items: stretch;
        }

        .pricing-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 0;
          padding: 24px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: var(--card);
          box-shadow: 0 12px 34px rgba(0,0,0,.07);
          transition:
            transform .2s,
            border-color .2s,
            box-shadow .2s;
        }

        .pricing-card:hover {
          transform: translateY(-3px);
          border-color: var(--accent);
          box-shadow: 0 18px 42px rgba(37,99,235,.12);
        }

        .pricing-card.featured {
          border: 1.5px solid var(--accent);
          background:
            linear-gradient(
              155deg,
              rgba(79,140,255,.10),
              transparent 45%
            ),
            var(--card);
        }

        .pricing-label {
          display: inline-flex;
          width: max-content;
          max-width: 100%;
          padding: 6px 10px;
          border-radius: 99px;
          background: var(--soft);
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .pricing-card h2 {
          font-size: 21px;
          margin: 0;
          letter-spacing: -.4px;
        }

        .pricing-price {
          font-size: clamp(30px,5vw,40px);
          font-weight: 850;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-top: 8px;
          overflow-wrap: anywhere;
        }

        .pricing-period {
          font-size: 13px;
          color: var(--muted);
          margin-top: 6px;
        }

        .pricing-divider {
          height: 1px;
          background: var(--line);
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 13px;
        }

        .pricing-features li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 14px;
          line-height: 1.45;
          color: var(--text);
        }

        .pricing-check {
          width: 21px;
          height: 21px;
          display: grid;
          place-items: center;
          flex: 0 0 21px;
          border-radius: 50%;
          background: rgba(48,209,88,.13);
          color: var(--green);
          font-size: 12px;
          font-weight: 900;
        }

        .pricing-form {
          display: grid;
          gap: 11px;
          margin-top: auto;
        }

        .pricing-form select {
          margin: 0;
          min-height: 50px;
          border-radius: 13px;
          background: var(--bg);
        }

        .pricing-cta {
          width: 100%;
          min-height: 52px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
        }

        .pricing-note {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          max-width: 760px;
          margin: 22px auto 0;
          padding: 16px;
          border: 1px solid var(--line);
          border-radius: 17px;
          background: var(--card);
        }

        .pricing-note-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          flex: 0 0 36px;
          border-radius: 12px;
          background: var(--soft);
        }

        .pricing-error {
          max-width: 760px;
          margin: 18px auto 0;
          padding: 15px 17px;
          border: 1px solid #f2b8b5;
          border-radius: 16px;
          background: #fff1f0;
          color: #9f2823;
          font-size: 14px;
          line-height: 1.5;
        }

        :root[data-theme=dark] .pricing-error {
          background: #351d20;
          color: #ffb8b3;
          border-color: #673438;
        }

        @media(max-width:520px) {
          .pricing-page {
            padding-top: 14px;
          }

          .pricing-hero {
            padding: 28px 17px 24px;
            border-radius: 22px;
          }

          .pricing-card {
            padding: 21px;
            border-radius: 21px;
          }
        }
      `}</style>

      <div className="pricing-page">

        <header className="pricing-hero">

          <span className="pricing-kicker">
            <span>✦</span>
            FlashAcademy · Accès formations
          </span>

          <h1>
            {acces
              ? 'Votre apprentissage continue.'
              : 'Investissez dans vos prochaines compétences.'}
          </h1>

          <p>
            {acces
              ? 'Votre accès aux formations est actif. Retrouvez vos cours et poursuivez votre progression.'
              : 'Choisissez la formule qui correspond à votre rythme. Accédez à des formations structurées, à leurs modules et à une communauté pour avancer concrètement.'}
          </p>

          <div className="pricing-trust">
            <span>✓ Paiement sécurisé</span>
            <span>✓ Accès après confirmation</span>
            <span>✓ Apprentissage à votre rythme</span>
          </div>

        </header>

        {searchParams.erreur && (
          <div className="pricing-error" role="alert">

            <strong>
              Le paiement n’a pas pu être lancé.
            </strong>

            <br />

            Code : {searchParams.erreur}. Réessayez.
            Si le problème persiste, contactez l’équipe
            en indiquant ce code.

          </div>
        )}

        <section
          className="pricing-grid"
          aria-label="Formules disponibles"
        >

          {(offres || []).map((o: any) => (

            <article
              key={o.id}
              className={`pricing-card ${
                o.best ? 'featured' : ''
              }`}
            >

              <div>

                <span className="pricing-label">
                  {o.best
                    ? '✦ Offre recommandée'
                    : 'Votre formule'}
                </span>

                <h2 style={{ marginTop: 15 }}>
                  {o.name}
                </h2>

                <div className="pricing-price">
                  {fcfa(o.price)}
                </div>

                <div className="pricing-period">
                  {o.per}
                </div>

              </div>

              <div className="pricing-divider" />

              <ul className="pricing-features">

                {(o.feat || []).map(
                  (f: string, i: number) => (

                    <li key={`${o.id}-${i}`}>

                      <span className="pricing-check">
                        ✓
                      </span>

                      <span>{f}</span>

                    </li>

                  )
                )}

                {(!o.feat || o.feat.length === 0) && (

                  <li>

                    <span className="pricing-check">
                      ✓
                    </span>

                    <span>
                      Accès aux formations selon votre formule
                    </span>

                  </li>

                )}

              </ul>

              <div className="pricing-form">

                {acces ? (

                  <span
                    className="btn off block pricing-cta"
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    ✓ Accès déjà actif
                  </span>

                ) : (

                  <form
                    action={payerOffre}
                    className="pricing-form"
                  >

                    <input
                      type="hidden"
                      name="offre"
                      value={o.id}
                    />

                    <label
                      htmlFor={`pays-${o.id}`}
                      style={{ margin: 0 }}
                    >
                      Votre pays de paiement
                    </label>

                    <select
                      id={`pays-${o.id}`}
                      name="pays"
                      defaultValue="CD"
                    >

                      {PAYS.map(([code, nom]) => (

                        <option
                          key={code}
                          value={code}
                        >
                          {nom}
                        </option>

                      ))}

                    </select>

                    <BoutonPayer montant={fcfa(o.price)} />

                  </form>

                )}

              </div>

            </article>

          ))}

        </section>

        {!acces && (

          <div className="pricing-note">

            <span className="pricing-note-icon">
              🔒
            </span>

            <div>

              <strong
                style={{
                  display: 'block',
                  marginBottom: 3,
                }}
              >
                Paiement protégé
              </strong>

              <span className="muted">
                Le paiement est effectué sur la page
                sécurisée FlashPay via les moyens disponibles
                dans votre pays. Votre accès est activé
                après confirmation du paiement.
              </span>

            </div>

          </div>

        )}

      </div>
    </>
  );
      }
