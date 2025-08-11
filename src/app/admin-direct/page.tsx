'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Shield, ArrowRight } from 'lucide-react'

export default function AdminDirectPage() {
  const router = useRouter()

  const handleDirectAccess = () => {
    // Pour le développement, on simule une session admin
    localStorage.setItem('dev_admin_access', 'true')
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accès Admin Direct
          </h1>
          
          <p className="text-gray-600 mb-6">
            Mode développement - Accès direct à l'interface administrateur
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={handleDirectAccess}
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              Accéder à l'admin
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Note de développement :</strong><br />
              Cette page permet un accès direct sans authentification complète. 
              En production, utilisez le système d'authentification complet.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}