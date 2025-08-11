/** @type {import('next').NextConfig} */

const nextConfig = {
  // Configuration de base
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Optimisation des images
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'asljbjsrqzawvhqotmpq.supabase.co',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configuration des headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_SITE_URL || 'https://triomphe-immobilier.vercel.app'
              : '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization'
          }
        ]
      }
    ]
  },

  // Redirections
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false
      },
      // Redirection www vers domaine principal
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.(?<domain>.*)',
          },
        ],
        destination: 'https://:domain/:path*',
        permanent: true,
      },
    ]
  },

  // Configuration Webpack
  webpack: (config, { dev, isServer }) => {
    // Optimisations pour la production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }

    return config
  },

  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: 'triomphe-immobilier',
    DEVELOPER: 'Patrick Essomba',
    DEVELOPER_PHONE: '+237 694 788 215'
  },

  // Configuration expérimentale
  experimental: {
    scrollRestoration: true,
  },

  // Configuration du build
  output: 'standalone',
  trailingSlash: false,
  
  // Transpilation des modules
  transpilePackages: ['lucide-react'],

  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
