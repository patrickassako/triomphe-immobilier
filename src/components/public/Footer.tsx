import Link from 'next/link'
import { Home } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = [
    { name: 'Accueil', href: '/' },
    { name: 'Maisons', href: '/properties?type=villa' },
    { name: 'Appartements', href: '/properties?type=appartement' },
    { name: 'Terrains', href: '/properties?type=terrain' },
    { name: 'A propos de nous', href: '/about' },
    { name: 'Nous Contacter', href: '/contact' },
  ]

  return (
    <footer className="bg-primary-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <Home className="h-8 w-8 text-white mr-2" />
            <span className="text-2xl font-bold">SCI Triomphe</span>
          </div>
          
          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-primary-100 transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Copyright */}
          <div className="border-t border-primary-400 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <p className="text-primary-100 text-sm">
                © {currentYear} SCI Triomphe. Tous droits réservés.
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}