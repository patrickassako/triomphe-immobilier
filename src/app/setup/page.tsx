'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { Shield, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createAdmin = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Erreur de connexion'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuration Initiale
          </h1>
          
          <p className="text-gray-600">
            Créez le compte administrateur pour accéder au panneau d'administration
          </p>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Informations de connexion :</strong><br />
              📧 Email: admin@sci-triomphe.com<br />
              🔑 Mot de passe: admin123
            </div>

            <Button
              onClick={createAdmin}
              disabled={loading}
              isLoading={loading}
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              {loading ? 'Création en cours...' : 'Créer le compte administrateur'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {result.success ? (
              <>
                <div className="flex items-center space-x-2 text-green-600 mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Compte créé avec succès !</span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                  <div className="space-y-2">
                    <div><strong>📧 Email:</strong> {result.credentials.email}</div>
                    <div><strong>🔑 Mot de passe:</strong> {result.credentials.password}</div>
                    <div><strong>🌐 URL de connexion:</strong> /auth/signin</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => window.location.href = '/auth/signin'}
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                  >
                    Se connecter
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = '/admin-direct'}
                    variant="outline"
                    className="flex-1"
                  >
                    Accès direct
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erreur</span>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  {result.error}
                </div>

                {result.error.includes('existe déjà') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <strong>L'admin existe déjà !</strong><br />
                    Utilisez les identifiants :<br />
                    📧 admin@sci-triomphe.com<br />
                    🔑 admin123
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => window.location.href = '/auth/signin'}
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                  >
                    Se connecter
                  </Button>
                  
                  <Button
                    onClick={() => setResult(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Réessayer
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}