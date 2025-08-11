'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, X, MessageSquare, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, Button } from '@/components/ui'

interface ContactStats {
  total: number
  new: number
  in_progress: number
  completed: number
  cancelled: number
  recent_24h: number
}

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  subject?: string
  message: string
  status: string
  created_at: string
}

export function ContactNotifications() {
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      // Récupérer les statistiques
      const statsResponse = await fetch('/api/contacts/stats')
      const statsData = await statsResponse.json()
      
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Récupérer les contacts récents (nouveaux et en cours)
      const contactsResponse = await fetch('/api/contacts?status=new&limit=5')
      const contactsData = await contactsResponse.json()
      
      if (contactsData.success) {
        setRecentContacts(contactsData.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="relative">
        <Button variant="outline" size="sm" disabled>
          <Bell className="h-4 w-4 animate-pulse" />
        </Button>
      </div>
    )
  }

  const hasNewContacts = stats.new > 0
  const hasRecentActivity = stats.recent_24h > 0

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative ${hasNewContacts ? 'border-red-300 bg-red-50' : ''}`}
      >
        <Bell className={`h-4 w-4 ${hasNewContacts ? 'text-red-600' : ''}`} />
        {hasNewContacts && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            {stats.new}
          </span>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border-0 ring-1 ring-black ring-opacity-5">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications Contacts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {/* Résumé des statistiques */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{stats.new}</div>
                      <div className="text-xs text-gray-600">Nouveaux</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{stats.in_progress}</div>
                      <div className="text-xs text-gray-600">En cours</div>
                    </div>
                  </div>
                  {hasRecentActivity && (
                    <div className="mt-2 text-center">
                      <div className="text-xs text-green-600 font-medium">
                        {stats.recent_24h} nouveau{stats.recent_24h > 1 ? 'x' : ''} message{stats.recent_24h > 1 ? 's' : ''} aujourd'hui
                      </div>
                    </div>
                  )}
                </div>

                {/* Liste des contacts récents */}
                <div className="divide-y divide-gray-100">
                  {recentContacts.length > 0 ? (
                    recentContacts.map((contact) => (
                      <div key={contact.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contact.first_name} {contact.last_name}
                              </p>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(contact.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {contact.subject || contact.email}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {contact.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Aucun nouveau message</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <div className="flex space-x-2">
                    <Link href="/admin/contacts" className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowNotifications(false)}
                      >
                        Voir tous les messages
                      </Button>
                    </Link>
                    <Link href="/admin/contacts?status=new" className="flex-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowNotifications(false)}
                      >
                        Nouveaux uniquement
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
