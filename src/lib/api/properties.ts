import { supabase } from '@/lib/supabase'
import { Property, PropertyFilters, PaginatedResponse } from '@/types'

// Cache pour les propriétés
const cache = new Map<string, { data: any, timestamp: number, ttl: number }>()

export class PropertiesAPI {
  private static getCacheKey(type: string, params: any): string {
    return `${type}_${JSON.stringify(params)}`
  }

  // Traduire les types de propriété de l'anglais vers le français pour la base de données
  private static translatePropertyType(propertyType: string): string {
    const translation: { [key: string]: string } = {
      'apartment': 'appartement',
      'house': 'maison',
      'villa': 'villa',
      'land': 'terrain',
      'commercial': 'commerce',
      'office': 'bureau'
    }
    return translation[propertyType] || propertyType
  }

  private static getCached<T>(key: string): T | null {
    const cached = cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data as T
    }
    return null
  }

  private static setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  static async getProperties(
    filters: PropertyFilters = {}
  ): Promise<PaginatedResponse<Property>> {
    const cacheKey = this.getCacheKey('properties', filters)
    const cached = this.getCached<PaginatedResponse<Property>>(cacheKey)
    
    if (cached) {
      return cached
    }

    const {
      search,
      property_type,
      min_price,
      max_price,
      location_id,
      bedrooms,
      bathrooms,
      min_surface_area,
      max_surface_area,
      features,
      sort_by = 'date_desc',
      page = 1,
      limit = 12,
    } = filters

    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          location:locations(*),
          category:categories(*),
          agent:users(id, first_name, last_name, email, phone),
          images:property_images(*)
        `)
        .eq('is_published', true)

      // Apply filters
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`
        )
      }

      if (property_type) {
        const translatedType = this.translatePropertyType(property_type)
        query = query.eq('property_type', translatedType)
      }

      if (min_price) {
        query = query.gte('price', min_price)
      }

      if (max_price) {
        query = query.lte('price', max_price)
      }

      if (location_id) {
        query = query.eq('location_id', location_id)
      }

      if (bedrooms) {
        query = query.eq('bedrooms', bedrooms)
      }

      if (bathrooms) {
        query = query.eq('bathrooms', bathrooms)
      }

      if (min_surface_area) {
        query = query.gte('surface_area', min_surface_area)
      }

      if (max_surface_area) {
        query = query.lte('surface_area', max_surface_area)
      }

      if (features && features.length > 0) {
        query = query.contains('features', features)
      }

      // Apply sorting
      switch (sort_by) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        case 'date_asc':
          query = query.order('created_at', { ascending: true })
          break
        case 'date_desc':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      // Count total items avec les mêmes filtres
      let countQuery = supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      // Appliquer les mêmes filtres pour le count
      if (search) {
        countQuery = countQuery.or(
          `title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`
        )
      }

      if (property_type) {
        const translatedType = this.translatePropertyType(property_type)
        countQuery = countQuery.eq('property_type', translatedType)
      }

      if (min_price) {
        countQuery = countQuery.gte('price', min_price)
      }

      if (max_price) {
        countQuery = countQuery.lte('price', max_price)
      }

      if (location_id) {
        countQuery = countQuery.eq('location_id', location_id)
      }

      if (bedrooms) {
        countQuery = countQuery.eq('bedrooms', bedrooms)
      }

      if (bathrooms) {
        countQuery = countQuery.eq('bathrooms', bathrooms)
      }

      if (min_surface_area) {
        countQuery = countQuery.gte('surface_area', min_surface_area)
      }

      if (max_surface_area) {
        countQuery = countQuery.lte('surface_area', max_surface_area)
      }

      if (features && features.length > 0) {
        countQuery = countQuery.contains('features', features)
      }

      const { count } = await countQuery

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error } = await query.range(from, to)

      if (error) {
        throw new Error(error.message)
      }

      const result = {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }

      // Cache pour 5 minutes
      this.setCache(cacheKey, result, 5 * 60 * 1000)

      return result
    } catch (error) {
      console.error('Error in getProperties:', error)
      throw error
    }
  }

  static async getProperty(slug: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        location:locations(*),
        category:categories(*),
        agent:users(id, first_name, last_name, email, phone),
        images:property_images(*)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }

    // Increment view count
    await supabase
      .from('properties')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id)

    return data
  }

  static async getFeaturedProperties(limit = 6): Promise<Property[]> {
    const cacheKey = this.getCacheKey('featured', { limit })
    const cached = this.getCached<Property[]>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // Essayer d'abord les propriétés en vedette
      let { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          location:locations(*),
          category:categories(*),
          images:property_images(*)
        `)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(error.message)
      }

      // Si aucune propriété en vedette, prendre les plus récentes
      if (!data || data.length === 0) {
        console.log('Aucune propriété en vedette, fallback vers propriétés récentes')
        const response = await this.getProperties({
          limit,
          sort_by: 'date_desc',
          page: 1
        })
        data = response.data
      }

      const result = data || []
      
      // Cache pour 5 minutes (permettre plus de refresh avec fallback)
      this.setCache(cacheKey, result, 5 * 60 * 1000)

      return result
    } catch (error) {
      console.error('Error in getFeaturedProperties:', error)
      throw error
    }
  }

  static async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select(`
        *,
        location:locations(*),
        category:categories(*),
        agent:users(id, first_name, last_name, email, phone)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select(`
        *,
        location:locations(*),
        category:categories(*),
        agent:users(id, first_name, last_name, email, phone)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  static async uploadPropertyImages(
    propertyId: string, 
    images: { url: string; alt_text?: string; is_primary?: boolean }[]
  ): Promise<void> {
    const { error } = await supabase
      .from('property_images')
      .insert(
        images.map((img, index) => ({
          property_id: propertyId,
          url: img.url,
          alt_text: img.alt_text || '',
          is_primary: img.is_primary || index === 0,
          sort_order: index,
        }))
      )

    if (error) {
      throw new Error(error.message)
    }
  }
}

export const propertiesApi = PropertiesAPI