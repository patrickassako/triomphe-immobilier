'use client'

import { useEffect, useState } from 'react'
import { 
  Building, 
  Users, 
  MessageSquare, 
  Clock,
  Filter,
  Calendar,
  Search,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'

interface ActivityItem {
  id: string
  type: 'property' | 'contact' | 'user'
  title: string
  description: string
  time: string
  status: 'success' | 'warning' | 'info'
  metadata?: any
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'property' | 'contact' | 'user'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchActivity()
  }, [])

  const fetchActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/activity?limit=50')
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.data)
      }
    } catch (error) {
      console.error('Erreur récupération activité:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building className="h-5 w-5" />
      case 'contact':
        return <MessageSquare className="h-5 w-5" />
      case 'user':
        return <Users className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property':
        return 'bg-blue-100 text-blue-800'
      case 'contact':
        return 'bg-green-100 text-green-800'
      case 'user':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal d'activité</h1>
          <p className="text-gray-600 mt-1">
            Historique complet des actions sur la plateforme
          </p>
        </div>
        <Button
          onClick={fetchActivity}
          className="bg-primary-600 hover:bg-primary-700 mt-4 sm:mt-0"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans l'activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Tout
              </Button>
              <Button
                variant={filter === 'property' ? 'default' : 'outline'}
                onClick={() => setFilter('property')}
                size="sm"
                className="flex items-center"
              >
                <Building className="h-4 w-4 mr-1" />
                Propriétés
              </Button>
              <Button
                variant={filter === 'contact' ? 'default' : 'outline'}
                onClick={() => setFilter('contact')}
                size="sm"
                className="flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Messages
              </Button>
              <Button
                variant={filter === 'user' ? 'default' : 'outline'}
                onClick={() => setFilter('user')}
                size="sm"
                className="flex items-center"
              >
                <Users className="h-4 w-4 mr-1" />
                Utilisateurs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Activités récentes
            </span>
            <span className="text-sm font-normal text-gray-500">
              {filteredActivities.length} résultat{filteredActivities.length > 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="space-y-2">
              {filteredActivities.map((activity, index) => (
                <div 
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <p className="text-gray-400 text-sm">{activity.time}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                            {activity.type === 'property' && 'Propriété'}
                            {activity.type === 'contact' && 'Message'}
                            {activity.type === 'user' && 'Utilisateur'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status === 'success' && 'Succès'}
                            {activity.status === 'warning' && 'Attention'}
                            {activity.status === 'info' && 'Info'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité trouvée</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Les activités récentes apparaîtront ici'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
