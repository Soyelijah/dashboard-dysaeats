/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
<<<<<<< HEAD
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Redirecciones para asegurar rutas internacionales
  async redirects() {
    return [
      {
        source: '/',
        destination: '/es/login',
        permanent: true,
      },
      // Redirección directa al panel de administración para desarrollo
      {
        source: '/admin',
        destination: '/es/admin',
        permanent: false,
      },
      // Elimino la redirección circular en register
    ];
  },
}

module.exports = nextConfig
=======
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
