'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { MapPin, Bed, Bath, Square, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, Badge, Button, OptimizedImage } from '@/components/ui'
import { Property } from '@/types'
import { propertiesApi } from '@/lib/api/properties'
import { formatPriceWithType, formatDate } from '@/lib/utils'

// Cache pour les propriétés en vedette (en dehors du composant)
let featuredPropertiesCache: { data: Property[], timestamp: number } | null = null

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const fetchFeaturedProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Vérifier le cache (5 minutes)
      const now = Date.now()
      if (featuredPropertiesCache && (now - featuredPropertiesCache.timestamp) < 5 * 60 * 1000) {
        setProperties(featuredPropertiesCache.data)
        setLoading(false)
        return
      }

      // Charger les propriétés en vedette (avec fallback intégré)
      const data = await propertiesApi.getFeaturedProperties(6)
      
      // Mettre en cache
      featuredPropertiesCache = {
        data,
        timestamp: now
      }

      setProperties(data)
    } catch (error) {
      console.error('Error fetching featured properties:', error)
      setError('Erreur lors du chargement des propriétés. Veuillez actualiser la page.')
      
      // En cas d'erreur, essayer de charger depuis le cache même expiré
      if (featuredPropertiesCache && featuredPropertiesCache.data.length > 0) {
        console.log('Utilisation du cache expiré en cas d\'erreur...')
        setProperties(featuredPropertiesCache.data)
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasInitialized) {
      fetchFeaturedProperties()
      setHasInitialized(true)
    }
  }, [fetchFeaturedProperties, hasInitialized])

  const getPropertyTypeLabel = useCallback((type: string) => {
    const types = {
      villa: 'Villa',
      appartement: 'Appartement',
      terrain: 'Terrain',
      bureau: 'Bureau',
      commerce: 'Commerce',
      maison: 'Maison'
    }
    return types[type as keyof typeof types] || type
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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Nos dernières offres
              </h2>
              <p className="text-gray-600">
                Transparence des prix. Expertise juridique et administrative. Large choix de biens et accompagnement de A à Z.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
            <Button onClick={fetchFeaturedProperties} className="mt-4">
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Nos dernières offres
            </h2>
            <p className="text-gray-600">
              Transparence des prix. Expertise juridique et administrative. Large choix de biens et accompagnement de A à Z.
            </p>
            {properties.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {properties.length} propriété{properties.length > 1 ? 's' : ''} disponible{properties.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link href="/properties">
            <Button variant="outline" className="border-primary-500 text-primary-500 hover:bg-primary-50">
              Voir tout
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.slice(0, 4).map((property) => (
            <Link key={property.id} href={`/properties/${property.slug}`} className="block">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white cursor-pointer">
                <div className="relative">
                  <OptimizedImage
                    src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
                    alt={property.title}
                    width={400}
                    height={300}
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
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{property.location?.name || property.address || 'Localisation non spécifiée'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="text-xs">{formatDate(property.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    {property.bedrooms && property.bedrooms > 0 && (
                      <span className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {property.bedrooms} chb
                      </span>
                    )}
                    {property.bathrooms && property.bathrooms > 0 && (
                      <span className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {property.bathrooms} sdb
                      </span>
                    )}
                    {property.surface_area && property.surface_area > 0 && (
                      <span className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        {property.surface_area}m²
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {formatPriceWithType(property.price, property.price_type)}
                    </span>
                    <Badge variant={getStatusColor(property.status)} className="text-xs">
                      {getStatusLabel(property.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}