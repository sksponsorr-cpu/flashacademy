/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { bodySizeLimit: '4.5mb' },
  },
  // FlashPay ajoute parfois le chemin de la formation devant le retour de paiement.
  // Ces redirections ramènent les adresses mal formées vers la bonne page (le paramètre ?tx= est conservé).
  async redirects() {
    return [
      {
        source: '/espace/formations/:id/espace/paiement/succes',
        destination: '/espace/paiement/succes',
        permanent: false,
      },
      {
        source: '/espace/formations/:id/espace/paiement/echec',
        destination: '/espace/paiement/echec',
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
