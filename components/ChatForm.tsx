'use client';

// Formulaire d'envoi de message avec un petit son à l'envoi.
export default function ChatForm({
  avec,
  action,
}: {
  avec: string;
  action: (formData: FormData) => Promise<void>;
}) {
  function son() {
    try {
      const C = window.AudioContext || (window as any).webkitAudioContext;
      const c = new C();
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.setValueAtTime(988, c.currentTime);
      o.frequency.setValueAtTime(1319, c.currentTime + 0.09);
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.3);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.32);
    } catch {}
  }

  return (
    <form action={action} onSubmit={son} className="row" style={{ marginTop: 12 }}>
      <input type="hidden" name="avec" value={avec} />
      <input name="contenu" placeholder="Votre message" required autoComplete="off" style={{ marginTop: 0 }} />
      <button className="btn" type="submit">Envoyer</button>
    </form>
  );
}
