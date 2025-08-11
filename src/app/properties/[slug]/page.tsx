'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Bed, Bath, Square, Calendar, Phone, Mail, User, Heart, Share2 } from 'lucide-react'
import { Layout } from '@/components/public'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { Property } from '@/types'
import { propertiesApi } from '@/lib/api/properties'
import { formatPriceWithType, formatDate, getWhatsAppUrl } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export default function PropertyDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [property, setProperty] = useState<Property | null>(null)
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [likes, setLikes] = useState(0)
  const [shares, setShares] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likesLoading, setLikesLoading] = useState(false)
  const [sharesLoading, setSharesLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (slug) {
      fetchProperty()
      fetchRelatedProperties()
    }
  }, [slug])

  useEffect(() => {
    if (property) {
      fetchLikesAndShares()
    }
  }, [property, user])

  const fetchProperty = async () => {
    try {
      const data = await propertiesApi.getProperty(slug)
      setProperty(data)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProperties = async () => {
    try {
      const { data } = await propertiesApi.getProperties({ limit: 3 })
      setRelatedProperties(data)
    } catch (error) {
      console.error('Error fetching related properties:', error)
    }
  }

  const fetchLikesAndShares = async () => {
    if (!property?.id) return

    try {
      // Fetch likes count
      const likesResponse = await fetch(`/api/properties/${property.id}/likes`)
      const likesData = await likesResponse.json()
      if (likesData.success) {
        setLikes(likesData.likes)
      }

      // Fetch shares count
      const sharesResponse = await fetch(`/api/properties/${property.id}/shares`)
      const sharesData = await sharesResponse.json()
      if (sharesData.success) {
        setShares(sharesData.shares)
      }

      // Check if current user has liked this property (only if user is logged in)
      if (user?.id) {
        try {
          const checkLikeResponse = await fetch(`/api/properties/${property.id}/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, check_only: true })
          })
          const checkLikeData = await checkLikeResponse.json()
          if (checkLikeData.success) {
            setIsLiked(checkLikeData.is_liked || false)
          }
        } catch (error) {
          console.error('Error checking user like status:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching likes and shares:', error)
    }
  }

  const handleLike = async () => {
    if (!property) return
    
    if (!user) {
      // Rediriger vers la page de connexion ou afficher un message
      alert('Veuillez vous connecter pour liker cette propriété')
      return
    }

    setLikesLoading(true)
    try {
      const response = await fetch(`/api/properties/${property.id}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })

      const data = await response.json()
      if (data.success) {
        if (data.action === 'liked') {
          setLikes(prev => prev + 1)
          setIsLiked(true)
        } else {
          setLikes(prev => Math.max(0, prev - 1))
          setIsLiked(false)
        }
      }
    } catch (error) {
      console.error('Error handling like:', error)
    } finally {
      setLikesLoading(false)
    }
  }

  const handleShare = async () => {
    if (!property) return

    setSharesLoading(true)
    try {
      // Increment share count
      const response = await fetch(`/api/properties/${property.id}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      if (data.success) {
        setShares(data.shares)
      }

      // Share on social media or copy link
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: property.description || `Découvrez ce bien : ${property.title}`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Lien copié dans le presse-papiers !')
      }
    } catch (error) {
      console.error('Error handling share:', error)
    } finally {
      setSharesLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-96 bg-gray-300 rounded-lg mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
                <div>
                  <div className="h-32 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Bien non trouvé
            </h1>
            <p className="text-gray-600 mb-8">
              Le bien que vous recherchez n'existe pas ou n'est plus disponible.
            </p>
            <Link href="/properties">
              <Button>Retour au catalogue</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible'
      case 'sold': return 'Vendu'
      case 'rented': return 'Loué'
      case 'pending': return 'En cours'
      default: return status
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-primary-500">Accueil</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-primary-500">Propriétés</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{property.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="relative mb-6">
                <img
                  src={property.images?.[currentImageIndex]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'}
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="success" className="bg-primary-500 text-white">
                    {getStatusLabel(property.status)}
                  </Badge>
                </div>
              </div>

              {/* Thumbnail Images */}
              {property.images && property.images.length > 1 && (
                <div className="flex space-x-2 mb-6">
                  {property.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                  {property.images.length > 4 && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600">
                      +{property.images.length - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Property Actions */}
              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={handleLike}
                  disabled={likesLoading}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes} j'aime{likes > 1 ? 's' : ''}</span>
                </button>
                <button
                  onClick={handleShare}
                  disabled={sharesLoading}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-500 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{shares} partage{shares > 1 ? 's' : ''}</span>
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Ajouté le {formatDate(property.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{property.views_count || 0} vue{(property.views_count || 0) > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Property Title and Price */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}</span>
                </div>
                <p className="text-3xl font-bold text-primary-500">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPriceWithType(property.price, property.price_type)}
                  </span>
                </p>
              </div>

              {/* Quick Details */}
              <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
                {property.bedrooms && property.bedrooms > 0 && (
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{property.bedrooms} chambres</span>
                  </div>
                )}
                {property.bathrooms && property.bathrooms > 0 && (
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{property.bathrooms} salles de bains</span>
                  </div>
                )}
                {property.surface_area && property.surface_area > 0 && (
                  <div className="flex items-center">
                    <Square className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{property.surface_area} m²</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {property.description || "Cet appartement offre un excellent confort, situé à Odza dans un quartier calme. Il comprend des matériaux modernes, des finitions soignées et tous les équipements nécessaires pour un mode de vie moderne et confortable."}
                  </p>
                </div>
              </div>

              {/* Video */}
              {property.video_url && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Vidéo de présentation</h2>
                  <div className="rounded-lg overflow-hidden border">
                    <video 
                      src={property.video_url} 
                      controls 
                      className="w-full max-h-[520px] bg-black"
                      poster={property.images?.[0]?.url}
                    />
                  </div>
                </div>
              )}

              {/* Characteristics */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Surface habitable</span>
                      <span className="font-medium">{property.surface_area ? `${property.surface_area} m²` : 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chambres</span>
                      <span className="font-medium">{property.bedrooms || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salles de bain</span>
                      <span className="font-medium">{property.bathrooms || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parking</span>
                      <span className="font-medium">{property.parking_spaces ? `${property.parking_spaces} place${property.parking_spaces > 1 ? 's' : ''}` : 'Non spécifié'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Année de construction</span>
                      <span className="font-medium">{property.year_built || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type de bien</span>
                      <span className="font-medium capitalize">{property.property_type || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut</span>
                      <span className="font-medium">{getStatusLabel(property.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Surface du terrain</span>
                      <span className="font-medium">{property.land_size ? `${property.land_size} m²` : 'Non spécifié'}</span>
                    </div>
                    {property.latitude && property.longitude && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coordonnées</span>
                        <span className="font-medium">{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Map Placeholder */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Localisation</h2>
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Carte interactive à venir</p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact and Agent Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  {/* Agent Info */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">SCI Triomphe</p>
                      <p className="text-sm text-gray-600">+237 677 85 58 39</p>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="Votre Nom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="email"
                      placeholder="Votre Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="tel"
                      placeholder="Votre Téléphone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      placeholder="Votre Message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                      Envoyer
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full border-primary-500 text-primary-500 hover:bg-primary-50 h-12">
                      <Phone className="h-4 w-4 mr-2" />
                      Demander un rappel
                    </Button>
                    
                    <a
                      href={getWhatsAppUrl('+237677855839', `Bonjour, je suis intéressé par le bien: ${property.title}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button variant="outline" className="w-full border-green-500 text-green-500 hover:bg-green-50 h-12">
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                  </div>

                  {/* Property Info */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Brève description</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Localisation</span>
                        <span className="font-medium">{property.location?.name || property.address || 'Non spécifié'}</span>
                      </div>
                      {property.surface_area && property.surface_area > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Superficie</span>
                          <span className="font-medium">{property.surface_area} m²</span>
                        </div>
                      )}
                      {property.bedrooms && property.bedrooms > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chambres</span>
                          <span className="font-medium">{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && property.bathrooms > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salles de bain</span>
                          <span className="font-medium">{property.bathrooms}</span>
                        </div>
                      )}
                      {property.parking_spaces && property.parking_spaces > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Parking</span>
                          <span className="font-medium">{property.parking_spaces} place{property.parking_spaces > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {property.latitude && property.longitude && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coordonnées GPS</span>
                          <span className="font-medium">{property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Properties */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Vous pourrez aussi être intéressé par :
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((relatedProperty) => (
                <Link key={relatedProperty.id} href={`/properties/${relatedProperty.slug}`} className="block">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer">
                    <div className="relative">
                      <img
                        src={relatedProperty.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
                        alt={relatedProperty.title}
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
                        {relatedProperty.title}
                      </h3>
                      <p className="text-xl font-bold text-primary-500 mb-1">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPriceWithType(relatedProperty.price, relatedProperty.price_type)}
                        </span>
                      </p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">{relatedProperty.location?.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
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