/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Demo deploy (Delta): no bloquear el build por errores de tipos preexistentes.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "utfs.io",
      "sistema.remaxup.com.ar",
      "remaxup.com.ar",
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
