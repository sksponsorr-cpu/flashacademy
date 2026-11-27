import { createClient } from '@/lib/supabase/server';
import Compteur from '@/components/Compteur';

type Stats = { membres?: number; modules_termines?: number; formations?: number };

// Chiffres réels, lus depuis la base à chaque visite de l'accueil.
export default async function StatsAccueil() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('stats_publiques');

  // Si la fonction n'est pas encore installée, on n'affiche rien plutôt qu'un faux chiffre.
  if (error || !data) return null;

  const s = data as Stats;
  const items: [string, number][] = [
    ['membres inscrits', s.membres ?? 0],
    ['modules terminés', s.modules_termines ?? 0],
    ['formations disponibles', s.formations ?? 0],
  ];

  return (
    <div className="stats-accueil">
      <style>{`
        .stats-accueil { display: grid; gap: 18px; grid-template-columns: 1fr; text-align: center; max-width: 1180px; margin: 0 auto; padding: 0 20px; }
        @media (min-width: 760px) { .stats-accueil { grid-template-columns: repeat(3, 1fr); } }
        .stats-accueil strong { display: block; font-size: clamp(40px, 5vw, 64px); letter-spacing: -2px; font-weight: 750; font-variant-numeric: tabular-nums; }
        .stats-accueil span { color: var(--muted); font-size: 15px; }
      `}</style>
      {items.map(([libelle, valeur]) => (
        <div key={libelle}>
          <strong>
            <Compteur valeur={Number(valeur)} />
          </strong>
          <span>{libelle}</span>
        </div>
      ))}
    </div>
  );
}
