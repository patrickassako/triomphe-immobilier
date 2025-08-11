'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts'
import {
  TrendingUp,
  Users,
  Building,
  MessageSquare,
  Eye,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { StatsCard } from '@/components/ui/Stats'

interface AnalyticsData {
  overview: {
    totalProperties: number
    activeProperties: number
    totalUsers: number
    totalContacts: number
    recentContacts: number
    totalViews: number
  }
  charts: {
    propertiesByType?: any
    usersByRole?: any
    propertiesOverTime?: any[]
    contactsOverTime?: any[]
    usersOverTime?: any[]
  }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [period, activeTab])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?period=${period}&type=${activeTab}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        console.error('Erreur:', result.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDataForChart = (obj: any) => {
    if (!obj) return []
    return Object.entries(obj).map(([key, value]) => ({
      name: key,
      value: value as number,
      label: getTranslatedLabel(key)
    }))
  }

  const getTranslatedLabel = (key: string) => {
    const translations: any = {
      // Types de propriétés
      villa: 'Villa',
      appartement: 'Appartement',
      terrain: 'Terrain',
      bureau: 'Bureau',
      commerce: 'Commerce',
      maison: 'Maison',
      
      // Rôles utilisateurs
      admin: 'Administrateur',
      agent: 'Agent',
      client: 'Client',
      
      // Statuts de contact
      new: 'Nouveau',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      
      // Statuts de propriété
      available: 'Disponible',
      sold: 'Vendu',
      rented: 'Loué',
      pending: 'En attente'
    }
    return translations[key] || key
  }

  const renderOverview = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Propriétés totales"
            value={data.overview.totalProperties}
            icon={Building}
            trend={{ value: 5, isPositive: true, label: 'vs mois dernier' }}
          />
          <StatsCard
            title="Propriétés actives"
            value={data.overview.activeProperties}
            icon={Building}
            trend={{ value: 3, isPositive: true, label: 'vs mois dernier' }}
          />
          <StatsCard
            title="Utilisateurs"
            value={data.overview.totalUsers}
            icon={Users}
            trend={{ value: 10, isPositive: true, label: 'vs mois dernier' }}
          />
          <StatsCard
            title="Messages"
            value={data.overview.totalContacts}
            icon={MessageSquare}
            trend={{ value: 8, isPositive: true, label: 'vs mois dernier' }}
          />
          <StatsCard
            title="Vues totales"
            value={data.overview.totalViews}
            icon={Eye}
            trend={{ value: 15, isPositive: true, label: 'vs mois dernier' }}
          />
          <StatsCard
            title="Nouveaux contacts"
            value={data.overview.recentContacts}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true, label: 'vs mois dernier' }}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Propriétés par type */}
          <Card>
            <CardHeader>
              <CardTitle>Propriétés par type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatDataForChart(data.charts.propertiesByType)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, percent }) => `${label} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatDataForChart(data.charts.propertiesByType).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Utilisateurs par rôle */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs par rôle</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatDataForChart(data.charts.usersByRole)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderTimeSeriesChart = (title: string, data: any[], dataKey: string = 'count') => {
    if (!data || data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible pour cette période
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={dataKey} stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const renderProperties = () => {
    if (!data?.charts) return null

    return (
      <div className="space-y-6">
        {data.charts.propertiesOverTime && renderTimeSeriesChart(
          'Évolution des propriétés créées', 
          data.charts.propertiesOverTime
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatDataForChart(data.charts.propertiesByType)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ label, percent }) => `${label} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  >
                    {formatDataForChart(data.charts.propertiesByType).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


        </div>
      </div>
    )
  }

  const renderUsers = () => {
    if (!data?.charts) return null

    return (
      <div className="space-y-6">
        {data.charts.usersOverTime && renderTimeSeriesChart(
          'Évolution des inscriptions', 
          data.charts.usersOverTime
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Répartition par rôle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatDataForChart(data.charts.usersByRole)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContacts = () => {
    if (!data?.charts) return null

    return (
      <div className="space-y-6">
        {data.charts.contactsOverTime && renderTimeSeriesChart(
          'Évolution des messages', 
          data.charts.contactsOverTime
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Statuts des messages</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ label, percent }) => `${label} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {[].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'properties':
        return renderProperties()
      case 'users':
        return renderUsers()
      case 'contacts':
        return renderContacts()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytiques</h1>
          <p className="text-gray-600 mt-1">
            Suivez les performances de votre plateforme
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'properties', label: 'Propriétés', icon: Building },
            { id: 'users', label: 'Utilisateurs', icon: Users },
            { id: 'contacts', label: 'Messages', icon: MessageSquare }
          ].map((tab) => (
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
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  )
}

