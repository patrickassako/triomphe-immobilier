'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Lock, 
  Settings as SettingsIcon, 
  LogOut, 
  Save, 
  Eye, 
  EyeOff,
  Shield,
  Bell,
  Globe,
  Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/Modal'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
}

interface PasswordData {
  current_password: string
  new_password: string
  confirm_password: string
}

export default function AdminSettingsPage() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: ''
  })

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Application settings
  const [appSettings, setAppSettings] = useState({
    site_name: 'TRIOMPHE Immobilier',
    site_description: 'Plateforme immobilière au Cameroun',
    contact_email: 'contact@triomphe.cm',
    contact_phone: '+237 xxx xxx xxx',
    notifications_enabled: true,
    maintenance_mode: false
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone: profileData.phone
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Profil mis à jour avec succès !')
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (passwordData.new_password.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setLoading(true)
      // Ici vous pouvez implémenter la logique de changement de mot de passe
      // avec Supabase auth ou votre système d'authentification
      alert('Changement de mot de passe non implémenté pour cette démo')
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/auth/signin'
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const handleBackupDatabase = async () => {
    try {
      setLoading(true)
      
      // Créer un backup des principales tables
      const tables = ['properties', 'contacts', 'users', 'locations', 'categories']
      const backupData: any = {}
      
      for (const table of tables) {
        const response = await fetch(`/api/backup/${table}`)
        if (response.ok) {
          const data = await response.json()
          backupData[table] = data
        }
      }
      
      // Créer un fichier de sauvegarde
      const backupContent = JSON.stringify(backupData, null, 2)
      const blob = new Blob([backupContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Télécharger le fichier
      const a = document.createElement('a')
      a.href = url
      a.download = `triomphe-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('Sauvegarde créée avec succès !')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la création de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    try {
      setLoading(true)
      
      // Vider le cache du navigateur pour cette application
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }
      
      // Vider le localStorage et sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      alert('Cache vidé avec succès ! La page va se recharger.')
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error)
      alert('Erreur lors du vidage du cache')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Mon profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'app', label: 'Application', icon: SettingsIcon },
    { id: 'system', label: 'Système', icon: Database }
  ]

  const renderProfileTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={profileData.first_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={profileData.last_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                <Shield className="h-4 w-4 mr-2 text-purple-600" />
                <span className="font-medium text-gray-900">
                  {profileData.role === 'admin' ? 'Administrateur' : profileData.role}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Changer le mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe *
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <LogOut className="h-5 w-5 mr-2" />
            Zone de danger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="font-medium text-red-800 mb-2">Déconnexion</h4>
            <p className="text-sm text-red-700 mb-4">
              Vous serez déconnecté de votre session et redirigé vers la page de connexion.
            </p>
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" />
          Paramètres de l'application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du site
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={appSettings.site_name}
              onChange={(e) => setAppSettings(prev => ({ ...prev, site_name: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du site
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={appSettings.site_description}
              onChange={(e) => setAppSettings(prev => ({ ...prev, site_description: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={appSettings.contact_email}
                onChange={(e) => setAppSettings(prev => ({ ...prev, contact_email: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone de contact
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={appSettings.contact_phone}
                onChange={(e) => setAppSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Notifications</label>
                  <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                </div>
              </div>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  appSettings.notifications_enabled ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                onClick={() => setAppSettings(prev => ({ ...prev, notifications_enabled: !prev.notifications_enabled }))}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    appSettings.notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-orange-600" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Mode maintenance</label>
                  <p className="text-sm text-gray-500">Désactiver l'accès public au site</p>
                </div>
              </div>
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  appSettings.maintenance_mode ? 'bg-orange-600' : 'bg-gray-200'
                }`}
                onClick={() => setAppSettings(prev => ({ ...prev, maintenance_mode: !prev.maintenance_mode }))}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    appSettings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les paramètres
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderSystemTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Informations système
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Version de l'application</h4>
              <p className="text-2xl font-bold text-primary-600">v1.0.0</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Environnement</h4>
              <p className="text-2xl font-bold text-green-600">Développement</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Base de données</h4>
              <p className="text-lg font-medium text-gray-700">Supabase PostgreSQL</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Dernière mise à jour</h4>
              <p className="text-lg font-medium text-gray-700">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Actions système</h4>
            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                variant="outline"
                onClick={handleBackupDatabase}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Sauvegarder la base
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                onClick={handleClearCache}
                disabled={loading}
              >
                <Globe className="h-4 w-4 mr-2" />
                Vider le cache
              </Button>
            </div>
            
            {/* Informations développeur */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Développé par</h5>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Patrick Essomba</p>
                <p className="flex items-center mt-1">
                  <span className="mr-2">📞</span>
                  <a href="tel:+237694788215" className="hover:underline">
                    +237 694 788 215
                  </a>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Application développée avec Next.js, TypeScript et Supabase
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'security':
        return renderSecurityTab()
      case 'app':
        return renderAppTab()
      case 'system':
        return renderSystemTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre profil et les paramètres de l'application
          </p>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu */}
        {renderContent()}
      </div>

      {/* Modal de déconnexion */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirmer la déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à l'administration."
        confirmText="Se déconnecter"
        type="warning"
      />
    </>
  )
}
