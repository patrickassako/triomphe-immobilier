'use client'

import { Layout } from '@/components/public'
import { Card, CardContent } from '@/components/ui'
import { 
  Building, 
  MapPin, 
  Users, 
  Award, 
  Shield, 
  Target, 
  TrendingUp,
  CheckCircle,
  Star,
  Phone,
  Mail,
  Clock
} from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { icon: Building, value: '500+', label: 'Propriétés gérées' },
    { icon: Users, value: '1000+', label: 'Clients satisfaits' },
    { icon: Award, value: '15+', label: 'Années d\'expérience' },
    { icon: Star, value: '4.9/5', label: 'Note moyenne' },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Confiance & Transparence',
      description: 'Nous privilégions la transparence dans toutes nos transactions immobilières.'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Nous visons l\'excellence dans chaque service que nous proposons.'
    },
    {
      icon: Users,
      title: 'Service Client',
      description: 'Notre équipe dédiée est à votre écoute pour répondre à tous vos besoins.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'Nous adoptons les dernières technologies pour améliorer votre expérience.'
    }
  ]

  const team = [
    {
      name: 'Équipe SCI Triomphe',
      role: 'Professionnels de l\'immobilier',
      description: 'Notre équipe expérimentée vous accompagne dans tous vos projets immobiliers.',
      image: '/team-placeholder.jpg'
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                À Propos de <span className="text-yellow-400">SCI Triomphe</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Votre partenaire de confiance pour l'immobilier au Cameroun depuis plus de 15 ans
              </p>
              <div className="flex items-center justify-center space-x-4">
                <MapPin className="h-6 w-6" />
                <span className="text-lg">Yaoundé, Cameroun</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <stat.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Notre Histoire
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>SCI Triomphe</strong> est une société immobilière camerounaise de référence, 
                    basée à Yaoundé au Crédit Mutuel du Cameroun. Depuis notre création, nous nous 
                    sommes engagés à offrir des services immobiliers de qualité supérieure.
                  </p>
                  <p>
                    Notre mission est de faciliter l'accès à la propriété pour tous les Camerounais 
                    en proposant des solutions adaptées à chaque budget et besoin. Nous croyons que 
                    chaque famille mérite d'avoir un toit digne de ce nom.
                  </p>
                  <p>
                    Avec plus de 15 ans d'expérience dans le secteur immobilier, notre équipe 
                    d'experts vous accompagne dans tous vos projets : achat, vente, location, 
                    gestion locative et investissement immobilier.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Pourquoi nous choisir ?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-yellow-300" />
                      Expertise locale et connaissance approfondie du marché
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-yellow-300" />
                      Accompagnement personnalisé et professionnel
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-yellow-300" />
                      Large gamme de propriétés adaptées à tous les budgets
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-yellow-300" />
                      Transparence totale dans toutes nos transactions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-3 text-yellow-300" />
                      Service client disponible 7j/7
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Les principes qui guident nos actions au quotidien
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                      <value.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Notre Équipe
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Des professionnels expérimentés à votre service
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-gray-600">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à réaliser votre projet immobilier ?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contactez-nous dès aujourd'hui pour discuter de vos besoins et découvrir 
              nos solutions personnalisées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/237677855839?text=Bonjour, je suis intéressé par vos services immobiliers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                WhatsApp
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Nous Contacter
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
