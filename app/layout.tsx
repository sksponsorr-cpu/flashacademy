import './globals.css';

export const metadata = {
  title: 'Flash Academy',
  description: 'Formations en ligne, sessions live et communauté pour lancer vos revenus en ligne.',
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// Applique le thème enregistré avant l'affichage, pour éviter un flash.
const script = "try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
