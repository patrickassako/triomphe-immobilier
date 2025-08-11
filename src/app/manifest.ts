import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TRIOMPHE Immobilier',
    short_name: 'TRIOMPHE',
    description: 'Application immobilière moderne pour le Cameroun - Développée par Patrick Essomba',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3B82F6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['business', 'lifestyle', 'productivity'],
    lang: 'fr',
    dir: 'ltr',
    orientation: 'portrait-primary',
  }
}
