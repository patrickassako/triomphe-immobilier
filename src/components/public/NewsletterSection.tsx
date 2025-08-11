import { Button } from '@/components/ui'

export function NewsletterSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vous souhaitez recevoir nos offres?
          </h2>
          <p className="text-gray-600 mb-8">
            Laissez nous votre adresse mail pour vous abonner à notre Newsletter.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse Email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3">
              Envoyer
            </Button>
          </div>
        </div>
        
        {/* Decorative wave pattern */}
        <div className="mt-16 text-center">
          <svg className="w-32 h-8 mx-auto text-primary-100" fill="currentColor" viewBox="0 0 200 40">
            <path d="M0,20 Q25,0 50,20 T100,20 T150,20 T200,20 V40 H0 Z" />
          </svg>
        </div>
      </div>
    </section>
  )
}