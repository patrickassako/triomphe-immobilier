'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { Property } from '@/types'
import { supabase } from '@/lib/supabase'

export default function EditPropertyPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string)
    }
  }, [params.id])

  const fetchProperty = async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/properties?id=${id}`)
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Erreur de chargement')
      setProperty(json.data)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Propriété introuvable</h1>
        <p className="text-gray-600">La propriété que vous cherchez n'existe pas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Modifier le bien</h1>
        <p className="text-gray-600 mt-1">
          Modifiez les informations de "{property.title}"
        </p>
      </div>

      <PropertyForm property={property} />
    </div>
  )
}