import { CheckCircle } from 'lucide-react'

const services = [
  'Accompagnement personnalisé.',
  'Achat sécurisé :',
  'Négociation des prix.',
  'Assistance ans les tâches immobilières.',
  'Gestion documentaire :',
  'Rédaction des actes notariés.',
  'Suivi des démarches administratives.',
  'Conseil en fiscalité immobilière.'
]

export function ServicesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Services List */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Nos Services
            </h2>
            <p className="text-gray-600 mb-8">
              Valoriser l'accompagnement personnalisé.
            </p>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <img
              src="/images/Frame 255.png"
              alt="Services immobiliers professionnels TRIOMPHE"
              className="w-full h-96 lg:h-[400px] object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}