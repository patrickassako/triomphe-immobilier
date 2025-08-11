'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, MoreHorizontal, MapPin } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { DataTable } from '@/components/ui/DataTable'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { Property } from '@/types'
import { supabase } from '@/lib/supabase'
import { formatPriceWithType, formatDate } from '@/lib/utils'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; property: Property | null }>({
    isOpen: false,
    property: null,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  useEffect(() => {
    fetchProperties()
  }, [pagination.page])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      
      try {
        const { data, error, count } = await supabase
          .from('properties')
          .select(`
            *,
            location:locations(name),
            category:categories(name),
            agent:users(first_name, last_name),
            images:property_images(url, is_primary)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(
            (pagination.page - 1) * pagination.limit,
            pagination.page * pagination.limit - 1
          )

        if (error) throw error

        setProperties(data || [])
        setPagination(prev => ({ ...prev, total: count || 0 }))
      } catch (supabaseError) {
        console.log('Supabase non disponible, utilisation des données mockées')
        
        // Utiliser les données mockées
        const { mockProperties, delay } = await import('@/lib/mockData')
        await delay(300) // Simuler le délai réseau
        
        // Simuler la pagination
        const startIndex = (pagination.page - 1) * pagination.limit
        const endIndex = startIndex + pagination.limit
        const paginatedData = mockProperties.slice(startIndex, endIndex) as Property[]
        
        setProperties(paginatedData)
        setPagination(prev => ({ ...prev, total: mockProperties.length }))
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.property) return

    try {
      setDeleteLoading(true)
      
      try {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', deleteModal.property.id)

        if (error) throw error
      } catch (supabaseError) {
        console.log('Mode mock - suppression simulée')
        // En mode mock, on simule juste la suppression
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setProperties(properties.filter(p => p.id !== deleteModal.property!.id))
      setDeleteModal({ isOpen: false, property: null })
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Erreur lors de la suppression de la propriété')
    } finally {
      setDeleteLoading(false)
    }
  }

  const togglePublished = async (property: Property) => {
    try {
      try {
        const { error } = await supabase
          .from('properties')
          .update({ is_published: !property.is_published })
          .eq('id', property.id)

        if (error) throw error
      } catch (supabaseError) {
        console.log('Mode mock - mise à jour simulée')
        // En mode mock, on simule juste la mise à jour
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      setProperties(properties.map(p => 
        p.id === property.id ? { ...p, is_published: !property.is_published } : p
      ))
    } catch (error) {
      console.error('Error updating property status:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const getStatusBadge = (property: Property) => {
    if (!property.is_published) {
      return <Badge variant="warning">Brouillon</Badge>
    }
    
    switch (property.status) {
      case 'available':
        return <Badge variant="success">Disponible</Badge>
      case 'sold':
        return <Badge variant="danger">Vendu</Badge>
      case 'rented':
        return <Badge variant="info">Loué</Badge>
      case 'pending':
        return <Badge variant="warning">En cours</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  const columns = [
    {
      key: 'title',
      label: 'Propriété',
      sortable: true,
      render: (value: string, property: Property) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src={property.images?.find(img => img.is_primary)?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=100'}
              alt={property.title}
              className="w-12 h-12 object-cover rounded-md"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{property.title}</p>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{property.location?.name}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-primary-600">
          {formatPriceWithType(value, undefined, 'XAF')}
        </span>
      ),
    },
    {
      key: 'property_type',
      label: 'Type',
      render: (value: string) => (
        <span className="capitalize text-gray-700">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: string, property: Property) => getStatusBadge(property),
    },
    {
      key: 'views_count',
      label: 'Vues',
      sortable: true,
      render: (value: number) => (
        <span className="text-gray-600">{value || 0}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Créée le',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-500 text-sm">
          {formatDate(value)}
        </span>
      ),
    },
  ]

  const renderActions = (property: Property) => (
    <div className="flex items-center space-x-2">
      <Link href={`/properties/${property.slug}`} target="_blank">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      
      <Link href={`/admin/properties/${property.id}/edit`}>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>

      <Button
        variant={property.is_published ? "outline" : "secondary"}
        size="sm"
        onClick={() => togglePublished(property)}
        className="text-xs px-2 h-8"
      >
        {property.is_published ? 'Masquer' : 'Publier'}
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={() => setDeleteModal({ isOpen: true, property })}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des biens</h1>
            <p className="text-gray-600 mt-1">
              Gérez votre catalogue de propriétés immobilières
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className="text-sm text-gray-500">
              {pagination.total} bien{pagination.total > 1 ? 's' : ''} au total
            </div>
            <Link href="/admin/properties/new">
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau bien
              </Button>
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={properties}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Rechercher par titre, adresse..."
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
          }}
          actions={renderActions}
          emptyMessage="Aucune propriété trouvée. Créez votre première annonce !"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, property: null })}
        onConfirm={handleDelete}
        title="Supprimer la propriété"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.property?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        type="danger"
        loading={deleteLoading}
      />
    </>
  )
}