'use client'

import { useState, useEffect } from 'react'
import { Location } from '@/types'

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/locations')
      const result = await response.json()
      
      if (result.success) {
        setLocations(result.data || [])
      } else {
        setError(result.error || 'Erreur lors du chargement des quartiers')
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError('Erreur lors du chargement des quartiers')
    } finally {
      setLoading(false)
    }
  }

  return { locations, loading, error, refetch: fetchLocations }
}

