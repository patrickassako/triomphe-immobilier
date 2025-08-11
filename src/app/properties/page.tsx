'use client'

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, Filter, Search, Grid, List, Calendar } from 'lucide-react'
import { Layout } from '@/components/public'
import { Card, CardContent, Badge, Button, Input } from '@/components/ui'
import { Property, PropertyFilters, PaginatedResponse } from '@/types'
import { propertiesApi } from '@/lib/api/properties'
import { formatPriceWithType, formatDate } from '@/lib/utils'
import { useLocations } from '@/hooks/useLocations'

// Cache pour les propriétés
const propertiesCache = new Map<string, { data: Property[], timestamp: number, ttl: number }>()

function PropertiesContent() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  
  const { locations, loading: locationsLoading } = useLocations()
  
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    property_type: '',
    listing_type: '',
    min_price: undefined,
    max_price: undefined,
    location_id: '',
    bedrooms: undefined,
    bathrooms: undefined,
    date_added: 'all',
    sort_by: 'date_desc',
    page: 1,
    limit: 12,
  })

  const searchParams = useSearchParams()



  const fetchProperties = useCallback(async (currentFilters: PropertyFilters) => {
    try {
      setLoading(true)
      setError(null)

      // Créer la clé de cache pour ces filtres spécifiques
      const params = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, String(value))
        }
      })
      const currentCacheKey = params.toString()

      // Vérifier le cache
      const cached = propertiesCache.get(currentCacheKey)
      const now = Date.now()
      
      if (cached && (now - cached.timestamp) < cached.ttl) {
        setProperties(cached.data)
        setTotalPages(Math.ceil(cached.data.length / (currentFilters.limit || 12)))
        setTotal(cached.data.length)
        setCurrentPage(currentFilters.page || 1)
        setLoading(false)
        return
      }

      const response: PaginatedResponse<Property> = await propertiesApi.getProperties(currentFilters)
      
      // Mettre en cache pour 5 minutes
      propertiesCache.set(currentCacheKey, {
        data: response.data,
        timestamp: now,
        ttl: 5 * 60 * 1000 // 5 minutes
      })

      setProperties(response.data)
      setTotalPages(response.totalPages)
      setTotal(response.total)
      setCurrentPage(response.page)
    } catch (error) {
      console.error('Error fetching properties:', error)
      setError('Erreur lors du chargement des propriétés. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour charger plus de propriétés
  const loadMoreProperties = useCallback(async () => {
    if (currentPage >= totalPages || loadingMore) return

    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      const newFilters = { ...filters, page: nextPage }
      
      const response = await propertiesApi.getProperties(newFilters)
      
      // Ajouter les nouvelles propriétés à la liste existante
      setProperties(prevProperties => [...prevProperties, ...response.data])
      setCurrentPage(nextPage)
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés supplémentaires:', err)
      setError('Erreur lors du chargement des propriétés supplémentaires')
    } finally {
      setLoadingMore(false)
    }
  }, [currentPage, totalPages, loadingMore, filters])



  // Initialisation des filtres au montage
  useEffect(() => {
    const initialFilters: PropertyFilters = {
      search: '',
      property_type: '',
      listing_type: '',
      min_price: undefined,
      max_price: undefined,
      location_id: '',
      bedrooms: undefined,
      bathrooms: undefined,
      date_added: 'all',
      sort_by: 'date_desc',
      page: 1,
      limit: 12,
    }

    fetchProperties(initialFilters)
  }, []) // Une seule fois au montage

  const handleFilterChange = useCallback((key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    setCurrentPage(1) // Reset la page courante
    fetchProperties(newFilters)
  }, [filters]) // Dépendance seulement sur filters

  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchProperties(newFilters)
  }, [filters])

  const getPropertyTypeLabel = useCallback((type: string) => {
    const types: Record<string, string> = {
      appartement: 'Appartement',
      villa: 'Villa', 
      maison: 'Maison',
      terrain: 'Terrain',
      commerce: 'Commerce',
      bureau: 'Bureau',
    }
    return types[type] || type
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'sold': return 'danger'
      case 'rented': return 'info'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }, [])

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'Disponible'
      case 'sold': return 'Vendu'
      case 'rented': return 'Loué'
      case 'pending': return 'En cours'
      default: return status
    }
  }, [])

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Rechercher une offre
            </h1>
            
            {/* Search Filters */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Type de propriété */}
                <select
                  key={`property_type_${filters.property_type}`}
                  value={filters.property_type || ''}
                  onChange={(e) => handleFilterChange('property_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Tous les types</option>
                  <option value="appartement">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="maison">Maison</option>
                  <option value="terrain">Terrain</option>
                  <option value="bureau">Bureau</option>
                  <option value="commerce">Commerce</option>
                </select>

                {/* Quartier */}
                <select
                  key={`location_${filters.location_id}`}
                  value={filters.location_id || ''}
                  onChange={(e) => handleFilterChange('location_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={locationsLoading}
                >
                  <option value="">Tous les quartiers</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>

                {/* Vente ou Location */}
                <select
                  key={`listing_type_${filters.listing_type}`}
                  value={filters.listing_type || ''}
                  onChange={(e) => handleFilterChange('listing_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Vente et Location</option>
                  <option value="sale">À vendre</option>
                  <option value="rent">À louer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Prix minimum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix min (FCFA)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.min_price || ''}
                    onChange={(e) => handleFilterChange('min_price', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                {/* Prix maximum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix max (FCFA)</label>
                  <Input
                    type="number"
                    placeholder="Illimité"
                    value={filters.max_price || ''}
                    onChange={(e) => handleFilterChange('max_price', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                {/* Date d'ajout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ajouté</label>
                  <select
                    key={`date_added_${filters.date_added}`}
                    value={filters.date_added || 'all'}
                    onChange={(e) => handleFilterChange('date_added', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Toutes périodes</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {total} résultats trouvés
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select
                key={`sort_by_${filters.sort_by}`}
                value={filters.sort_by || 'date_desc'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date_desc">Plus récent</option>
                <option value="date_asc">Plus ancien</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                  <div className="bg-white p-4 rounded-b-lg">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Card className="p-12 text-center">
              <p className="text-red-500 text-lg">{error}</p>
              <p className="text-gray-400 mt-2">
                Veuillez réessayer après quelques secondes.
              </p>
            </Card>
          ) : properties.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                Aucun bien ne correspond à vos critères de recherche.
              </p>
              <p className="text-gray-400 mt-2">
                Essayez de modifier vos filtres pour voir plus de résultats.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link key={property.id} href={`/properties/${property.slug}`} className="block">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer">
                      <div className="relative">
                        <img
                          src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="success" className="bg-primary-500 text-white">
                            À vendre
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                          {property.title}
                        </h3>
                        <p className="text-xl font-bold text-primary-500 mb-1">
                          <span className="text-lg font-bold text-primary-600">
                            {formatPriceWithType(property.price, property.price_type)}
                          </span>
                        </p>
                        <div className="flex items-center justify-between text-gray-500 text-xs mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="line-clamp-1">{property.location?.name || 'Localisation non spécifiée'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(property.created_at)}</span>
                          </div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-4">
                          {property.bedrooms && property.bedrooms > 0 && (
                            <div className="flex items-center">
                              <Bed className="h-3 w-3 mr-1" />
                              <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && property.bathrooms > 0 && (
                            <div className="flex items-center">
                              <Bath className="h-3 w-3 mr-1" />
                              <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.surface_area && property.surface_area > 0 && (
                            <div className="flex items-center">
                              <Square className="h-3 w-3 mr-1" />
                              <span>{property.surface_area}m²</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Voir plus button */}
              {currentPage < totalPages && (
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    className="border-primary-500 text-primary-500 hover:bg-primary-50"
                    onClick={loadMoreProperties}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                        Chargement...
                      </>
                    ) : (
                      'Voir plus'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
          
          {/* Newsletter Section at bottom */}
          <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vous souhaitez recevoir nos offres?
            </h3>
            <p className="text-gray-600 mb-6">
              Laissez nous votre adresse mail pour vous abonner à notre Newsletter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre adresse Email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8">
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    }>
      <PropertiesContent />
    </Suspense>
  )
}