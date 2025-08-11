'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save,
  X,
  Upload,
  MapPin,
  Home,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Video,
  Star,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Property, Location, Category, PropertyImage, Feature } from '@/types'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const propertySchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().min(1, 'Le prix doit être supérieur à 0'),
  property_type: z.enum(['apartment', 'house', 'land', 'commercial', 'office']),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  surface_area: z.number().min(1, 'La superficie doit être supérieure à 0'),
  land_size: z.number().min(0).optional(),
  location_id: z.string().min(1, 'Veuillez sélectionner un quartier'),
  category_id: z.string().min(1, 'Veuillez sélectionner une catégorie'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.enum(['available', 'sold', 'rented', 'pending']),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  price_type: z.enum(['fixed', 'per_sqm_per_month', 'per_month']).optional(),
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  property?: Property
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [images, setImages] = useState<PropertyImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string>(property?.video_url || '')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const { user } = useAuth()

  const isEditing = !!property

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property?.title || '',
      description: property?.description || '',
      price: property?.price || 0,
      property_type: property?.property_type || 'apartment',
      bedrooms: property?.bedrooms || 0,
      bathrooms: property?.bathrooms || 0,
      surface_area: property?.surface_area || 0,
      land_size: property?.land_size || 0,
      location_id: property?.location?.id || '',
      category_id: property?.category?.id || '',
      address: property?.address || '',
      latitude: property?.latitude || undefined,
      longitude: property?.longitude || undefined,
      status: property?.status || 'available',
      is_published: property?.is_published || false,
      is_featured: property?.is_featured || false,
      price_type: (property as any)?.price_type || 'fixed',
    },
  })

  useEffect(() => {
    fetchFormData()
    if (property) {
      setImages(property.images || [])
      setSelectedFeatures(
        property.features?.map(f => f.feature_id) || []
      )
      setVideoUrl(property.video_url || '')
    }

    // Vérifier/initialiser les buckets Storage côté serveur (dev helper)
    const warmup = async () => {
      try {
        await fetch('/api/storage/setup')
      } catch {}
    }
    warmup()
  }, [property])

  const fetchFormData = async () => {
    try {
      const [locationsResult, categoriesResult, featuresResult] = await Promise.all([
        supabase.from('locations').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('features').select('*').order('name'),
      ])

      setLocations(locationsResult.data || [])
      setCategories(categoriesResult.data || [])
      setFeatures(featuresResult.data || [])
    } catch (error) {
      console.error('Error fetching form data:', error)
    }
  }

  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    try {
      setUploadingImages(true)
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('properties')
          .upload(fileName, file)

        if (error) throw error

        const { data: publicUrl } = supabase.storage
          .from('properties')
          .getPublicUrl(fileName)

        return {
          url: publicUrl.publicUrl,
          is_primary: images.length === 0,
        }
      })

      const newImages = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...newImages])
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Erreur lors du téléchargement des images')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    if (!file) return
    try {
      setUploadingVideo(true)
      const fileName = `${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('property-videos')
        .upload(fileName, file, { contentType: file.type })
      if (error) throw error
      const { data: publicUrl } = supabase.storage
        .from('property-videos')
        .getPublicUrl(fileName)
      setVideoUrl(publicUrl.publicUrl)
    } catch (error) {
      console.error('Error uploading video:', error)
      alert('Erreur lors du téléchargement de la vidéo')
    } finally {
      setUploadingVideo(false)
    }
  }

  const setPrimaryImage = (index: number) => {
    setImages(prev =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    )
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      if (newImages.length > 0 && prev[index].is_primary) {
        newImages[0].is_primary = true
      }
      return newImages
    })
  }

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    )
  }

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setLoading(true)

      const propertyData = {
        ...data,
        slug: data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        video_url: videoUrl || null,
        agent_id: user?.id || null,
      }

      let propertyId: string

      if (isEditing && property) {
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property: { ...propertyData, id: property.id } })
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Erreur mise à jour')
        propertyId = property.id
      } else {
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property: propertyData })
        })
        const json = await res.json()
        if (!res.ok || !json.success) throw new Error(json.error || 'Erreur création')
        propertyId = json.data.id
      }

      // Handle images
      if (images.length > 0) {
        const resImgs = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property: { id: propertyId }, images })
        })
        if (!resImgs.ok) {
          const j = await resImgs.json().catch(() => ({}))
          throw new Error(j.error || 'Erreur lors de l\'enregistrement des images')
        }
      }

      // Handle features
      if (selectedFeatures.length > 0) {
        const resFeat = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ property: { id: propertyId }, features: selectedFeatures })
        })
        if (!resFeat.ok) {
          const j = await resFeat.json().catch(() => ({}))
          throw new Error(j.error || 'Erreur lors de l\'enregistrement des caractéristiques')
        }
      }

      router.push('/admin/properties')
    } catch (error) {
      console.error('Error saving property:', error)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const propertyTypeOptions = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'land', label: 'Terrain' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Bureau' },
  ]

  const statusOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'sold', label: 'Vendu' },
    { value: 'rented', label: 'Loué' },
    { value: 'pending', label: 'En cours' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="h-5 w-5 mr-2 text-primary-600" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la propriété *
              </label>
              <Input
                {...register('title')}
                placeholder="Villa moderne avec piscine..."
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de propriété *
              </label>
              <select
                {...register('property_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {propertyTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.property_type && (
                <p className="text-red-500 text-sm mt-1">{errors.property_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut *
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Décrivez la propriété en détail..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price and Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
            Prix et spécifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (FCFA) *
              </label>
              <Input
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="50000000"
                error={errors.price?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de prix
              </label>
              <select
                {...register('price_type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="fixed">Fixe</option>
                <option value="per_month">Par mois</option>
                <option value="per_sqm_per_month">Par m² / mois</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Superficie (m²) *
              </label>
              <Input
                type="number"
                {...register('surface_area', { valueAsNumber: true })}
                placeholder="120"
                error={errors.surface_area?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille du terrain (m²)
              </label>
              <Input
                type="number"
                {...register('land_size', { valueAsNumber: true })}
                placeholder="500"
                error={errors.land_size?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chambres
              </label>
              <Input
                type="number"
                {...register('bedrooms', { valueAsNumber: true })}
                placeholder="3"
                error={errors.bedrooms?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salles de bain
              </label>
              <Input
                type="number"
                {...register('bathrooms', { valueAsNumber: true })}
                placeholder="2"
                error={errors.bathrooms?.message}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Localisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quartier *
              </label>
              <select
                {...register('location_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sélectionner un quartier</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="text-red-500 text-sm mt-1">{errors.location_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                {...register('category_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse complète *
              </label>
              <Input
                {...register('address')}
                placeholder="Rue de la République, Douala, Cameroun"
                error={errors.address?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <Input
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                placeholder="4.0511"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <Input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                placeholder="9.7679"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-primary-600" />
            Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={uploadingImages}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">
                {uploadingImages ? 'Téléchargement en cours...' : 'Cliquez pour ajouter des images'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                PNG, JPG, GIF jusqu'à 10MB chacune
              </p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimaryImage(index)}
                      className={cn(
                        'text-white hover:text-yellow-300',
                        image.is_primary && 'text-yellow-300'
                      )}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="text-white hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2 text-primary-600" />
            Vidéo (optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL de la vidéo</label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Télécharger un fichier vidéo</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files && e.target.files[0] && handleVideoUpload(e.target.files[0])}
                disabled={uploadingVideo}
              />
            </div>
          </div>
          {videoUrl && (
            <div className="rounded-lg overflow-hidden border">
              <video src={videoUrl} controls className="w-full max-h-80 bg-black" />
              <div className="p-2 text-right">
                <Button type="button" variant="outline" onClick={() => setVideoUrl('')}>
                  Retirer la vidéo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Caractéristiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {features.map(feature => (
              <label
                key={feature.id}
                className={cn(
                  'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedFeatures.includes(feature.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature.id)}
                  onChange={() => toggleFeature(feature.id)}
                  className="sr-only"
                />
                <span className="text-sm">{feature.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-primary-600" />
            Options de publication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('is_published')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <div>
              <span className="font-medium text-gray-900">Publier cette propriété</span>
              <p className="text-sm text-gray-500">
                La propriété sera visible sur le site public
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('is_featured')}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <div>
              <span className="font-medium text-gray-900">Propriété en vedette</span>
              <p className="text-sm text-gray-500">
                La propriété apparaîtra dans les sections mises en avant
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>

        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Mettre à jour' : 'Créer la propriété'}
        </Button>
      </div>
    </form>
  )
}