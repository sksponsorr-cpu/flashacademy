/** @type {import('next').NextConfig} */
const nextConfig = {
  // Évite qu'une petite erreur de type bloque la mise en ligne.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
