'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Building, 
  Users, 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  Plus,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { StatsCard, StatsGrid } from '@/components/ui/Stats'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalProperties: number
  publishedProperties: number
  totalUsers: number
  totalContacts: number
  newContacts: number
  totalViews: number
}

interface RecentActivity {
  id: string
  type: 'property' | 'contact' | 'user'
  title: string
  description: string
  time: string
  status: 'success' | 'warning' | 'info'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    publishedProperties: 0,
    totalUsers: 0,
    totalContacts: 0,
    newContacts: 0,
    totalViews: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Récupérer les stats et l'activité en parallèle
      const [statsData, activityData] = await Promise.all([
        fetchStats(),
        fetchRecentActivity()
      ])

      setStats(statsData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [
        propertiesResult,
        usersResult,
        contactsResult,
        viewsResult,
      ] = await Promise.all([
        // Properties stats
        Promise.all([
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true),
        ]),
        // Users stats
        supabase.from('users').select('*', { count: 'exact', head: true }),
        // Contacts stats - utilise la nouvelle API
        fetch('/api/contacts/stats').then(res => res.json()),
        // Views stats
        supabase.from('properties').select('views_count'),
      ])

      const totalViews = viewsResult.data?.reduce((sum, property) => sum + (property.views_count || 0), 0) || 0

      // Parse contacts stats
      const contactsStats = contactsResult.success ? contactsResult.data : { total: 0, new: 0 }

      return {
        totalProperties: propertiesResult[0].count || 0,
        publishedProperties: propertiesResult[1].count || 0,
        totalUsers: usersResult.count || 0,
        totalContacts: contactsStats.total || 0,
        newContacts: contactsStats.new || 0,
        totalViews,
      }
    } catch (supabaseError) {
      console.log('Supabase non disponible, utilisation des données mockées')
      
      // Importer et utiliser les données mockées
      const { mockStats, delay } = await import('@/lib/mockData')
      await delay(500) // Simuler le délai réseau
      
      return mockStats
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/dashboard/activity?limit=8')
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        // Utiliser les données mockées en cas d'erreur
        return data.data || []
      }
    } catch (error) {
      console.error('Erreur récupération activité:', error)
      
      // Fallback avec données mockées
      return [
        {
          id: '1',
          type: 'property',
          title: 'Nouvelle propriété ajoutée',
          description: 'Villa moderne à Bastos',
          time: 'Il y a 2 heures',
          status: 'success'
        },
        {
          id: '2',
          type: 'contact',
          title: 'Nouveau message',
          description: 'Demande d\'information pour terrain Odza',
          time: 'Il y a 4 heures',
          status: 'info'
        },
        {
          id: '3',
          type: 'user',
          title: 'Nouvel utilisateur',
          description: 'Jean Dupont s\'est inscrit',
          time: 'Il y a 6 heures',
          status: 'success'
        },
        {
          id: '4',
          type: 'property',
          title: 'Propriété mise à jour',
          description: 'Appartement 3 pièces Douala',
          time: 'Il y a 1 jour',
          status: 'warning'
        },
      ]
    }
  }

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'property':
        return <Building className="h-4 w-4" />
      case 'contact':
        return <MessageSquare className="h-4 w-4" />
      case 'user':
        return <Users className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleActivityClick = (activity: RecentActivity) => {
    // Rediriger selon le type d'activité
    switch (activity.type) {
      case 'property':
        window.location.href = '/admin/properties'
        break
      case 'contact':
        window.location.href = '/admin/contacts'
        break
      case 'user':
        window.location.href = '/admin/users'
        break
      default:
        console.log('Activité cliquée:', activity)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">
            Bienvenue dans votre espace d'administration SCI Triomphe
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </div>
          <Link href="/admin/properties/new">
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau bien
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsGrid>
        <StatsCard
          title="Total Propriétés"
          value={stats.totalProperties}
          description={`${stats.publishedProperties} publiées`}
          icon={Building}
          color="blue"
          trend={{
            value: 12,
            isPositive: true,
            label: "ce mois"
          }}
          loading={loading}
        />
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers}
          description="Comptes actifs"
          icon={Users}
          color="green"
          trend={{
            value: 8,
            isPositive: true,
            label: "ce mois"
          }}
          loading={loading}
        />
        <StatsCard
          title="Messages"
          value={stats.totalContacts}
          description={`${stats.newContacts} non lus`}
          icon={MessageSquare}
          color="yellow"
          trend={{
            value: 5,
            isPositive: false,
            label: "cette semaine"
          }}
          loading={loading}
        />
        <StatsCard
          title="Vues totales"
          value={stats.totalViews}
          description="Pages visitées"
          icon={Eye}
          color="purple"
          trend={{
            value: 23,
            isPositive: true,
            label: "ce mois"
          }}
          loading={loading}
        />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-primary-600" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link 
                href="/admin/properties/new"
                className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 group-hover:bg-primary-200 rounded-lg flex items-center justify-center transition-colors">
                  <Building className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-900">
                    Ajouter une propriété
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-primary-700">
                    Créer une nouvelle annonce immobilière
                  </p>
                </div>
              </Link>

              <Link 
                href="/admin/contacts"
                className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-900">
                    Gérer les messages
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-green-700">
                    Répondre aux demandes clients
                  </p>
                </div>
              </Link>

              <Link 
                href="/admin/users"
                className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">
                    Gestion des utilisateurs
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-blue-700">
                    Administrer les comptes utilisateurs
                  </p>
                </div>
              </Link>

              <Link 
                href="/admin/analytics"
                className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-900">
                    Voir les statistiques
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-purple-700">
                    Analyser les performances
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              Activité récente
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              className="text-xs"
            >
              Actualiser
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border-l-2 ${
                        index === 0 ? 'border-l-primary-500 bg-primary-50/50' : 'border-l-transparent'
                      }`}
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)} transition-all duration-200`}>
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 text-sm leading-snug">{activity.title}</p>
                          {index === 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-gray-400 text-xs">{activity.time}</p>
                          <div className="flex items-center space-x-1">
                            {activity.type === 'property' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Propriété
                              </span>
                            )}
                            {activity.type === 'contact' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Message
                              </span>
                            )}
                            {activity.type === 'user' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Utilisateur
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Aucune activité récente</p>
                  <p className="text-xs text-gray-500">Les dernières actions apparaîtront ici</p>
                </div>
              )}
            </div>
            
            {recentActivity.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {recentActivity.length} activité{recentActivity.length > 1 ? 's' : ''} récente{recentActivity.length > 1 ? 's' : ''}
                </div>
                <Link 
                  href="/admin/analytics"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group"
                >
                  Voir les analyses
                  <BarChart3 className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
            Aperçu des performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {((stats.publishedProperties / Math.max(stats.totalProperties, 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-blue-800">Taux de publication</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(stats.totalViews / Math.max(stats.publishedProperties, 1))}
              </div>
              <div className="text-sm text-green-800">Vues par propriété</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {((stats.newContacts / Math.max(stats.totalContacts, 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-yellow-800">Messages non traités</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}