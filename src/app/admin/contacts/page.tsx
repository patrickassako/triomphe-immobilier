'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { 
  Mail, 
  Phone, 
  Clock, 
  User, 
  MessageSquare, 
  Eye,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageCircle
} from 'lucide-react'
import { Contact, ContactFilters, PaginatedResponse } from '@/types'
import { formatDate } from '@/lib/utils'

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState<ContactFilters>({
    status: 'all',
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  })

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          params.append(key, String(value))
        }
      })

      const response = await fetch(`/api/contacts?${params.toString()}`)
      const data: PaginatedResponse<Contact> = await response.json()

      if (data.success) {
        setContacts(data.data)
        setPagination({
          total: data.total,
          totalPages: data.totalPages,
          currentPage: data.page
        })
      } else {
        setError(data.error || 'Erreur lors du chargement des contacts')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleFilterChange = (key: keyof ContactFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const updateContactStatus = async (contactId: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: adminNotes })
      })

      const data = await response.json()

      if (data.success) {
        // Mise à jour locale
        setContacts(prev => 
          prev.map(contact => 
            contact.id === contactId 
              ? { ...contact, status: status as any, notes: adminNotes, admin_notes: adminNotes, updated_at: new Date().toISOString() }
              : contact
          )
        )
        setShowModal(false)
        setSelectedContact(null)
      } else {
        alert('Erreur lors de la mise à jour: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    }
  }

  const deleteContact = async (contactId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setContacts(prev => prev.filter(contact => contact.id !== contactId))
        setShowModal(false)
        setSelectedContact(null)
      } else {
        alert('Erreur lors de la suppression: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'Nouveau', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      in_progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { label: 'Terminé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Contacts</h1>
              <p className="text-gray-600">Gérez les messages de contact et demandes de clients</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {pagination.total} contact{pagination.total > 1 ? 's' : ''} au total
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Statut */}
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouveau</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>

              {/* Tri */}
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="created_at">Date de création</option>
                <option value="updated_at">Dernière mise à jour</option>
                <option value="status">Statut</option>
                <option value="first_name">Nom</option>
              </select>

              {/* Ordre */}
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="desc">Plus récent d'abord</option>
                <option value="asc">Plus ancien d'abord</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des contacts */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des contacts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={fetchContacts}
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun contact trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {contact.first_name} {contact.last_name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {contact.email}
                              </div>
                              {contact.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(contact.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContact(contact)
                              setShowModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          {contact.subject && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700">Sujet:</span>
                              <p className="text-sm text-gray-600">{contact.subject}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-medium text-gray-700">Message:</span>
                            <p className="text-sm text-gray-600 line-clamp-3">{contact.message}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Créé le {formatDate(contact.created_at)}
                          </div>
                          {contact.updated_at && contact.updated_at !== contact.created_at && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Mis à jour le {formatDate(contact.updated_at)}
                            </div>
                          )}
                          {contact.property && (
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Concernant: {contact.property.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Affichage de {((pagination.currentPage - 1) * (filters.limit || 10)) + 1} à{' '}
              {Math.min(pagination.currentPage * (filters.limit || 10), pagination.total)} sur {pagination.total} résultats
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} sur {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {showModal && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setShowModal(false)
            setSelectedContact(null)
          }}
          onUpdateStatus={updateContactStatus}
          onDelete={deleteContact}
        />
      )}
    </div>
  )
}

// Composant Modal de détail
function ContactDetailModal({ 
  contact, 
  onClose, 
  onUpdateStatus, 
  onDelete 
}: {
  contact: Contact
  onClose: () => void
  onUpdateStatus: (id: string, status: string, notes?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [status, setStatus] = useState(contact.status)
  const [adminNotes, setAdminNotes] = useState(contact.notes || contact.admin_notes || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await onUpdateStatus(contact.id, status, adminNotes)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(contact.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Détails du Contact</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Informations contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                  <p className="text-sm text-gray-900">{contact.first_name} {contact.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{contact.email}</p>
                </div>
                {contact.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="text-sm text-gray-900">{contact.phone}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-sm text-gray-900">{formatDate(contact.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Sujet */}
            {contact.subject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <p className="text-sm text-gray-900">{contact.subject}</p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>

            {/* Propriété liée */}
            {contact.property && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Propriété concernée</label>
                <p className="text-sm text-gray-900">{contact.property.title}</p>
              </div>
            )}

            {/* Gestion du statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="new">Nouveau</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Notes administrateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes de l'administrateur</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ajoutez vos notes ici..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
