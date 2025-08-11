export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  role: 'admin' | 'agent' | 'client'
  avatar_url?: string
  email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  price: number
  currency?: string
  property_type: 'apartment' | 'house' | 'land' | 'commercial' | 'office'
  status: 'available' | 'sold' | 'rented' | 'pending'
  listing_type?: 'sale' | 'rent' | 'both'
  price_type?: 'fixed' | 'per_month' | 'per_sqm_per_month'
  
  // Property details
  bedrooms?: number
  bathrooms?: number
  surface_area?: number
  land_size?: number
  year_built?: number
  parking_spaces?: number
  
  // Location
  address?: string
  location_id?: string
  latitude?: number
  longitude?: number
  
  // Relations
  location?: Location
  category?: Category
  agent?: User
  
  // Features
  features?: PropertyFeature[]
  amenities?: string[]
  
  // Media
  images?: PropertyImage[]
  virtual_tour_url?: string
  video_url?: string
  
  // SEO
  meta_title?: string
  meta_description?: string
  
  // Management
  category_id?: string
  agent_id?: string
  is_featured: boolean
  is_published: boolean
  views_count?: number
  shares_count?: number
  
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id?: string
  property_id?: string
  url: string
  alt_text?: string
  is_primary: boolean
  sort_order?: number
  created_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  created_at: string
}

export interface Location {
  id: string
  name: string
  slug: string
  city: string
  region?: string
  latitude?: number
  longitude?: number
  created_at: string
}

export interface Feature {
  id: string
  name: string
  slug?: string
  icon?: string
  created_at: string
}

export interface PropertyFeature {
  id: string
  property_id: string
  feature_id: string
  features?: Feature
  created_at: string
}

export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  message: string
  subject?: string
  property_id?: string
  property?: Property
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  assigned_to?: string
  assigned_user?: User
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  property_id: string
  property?: Property
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  author_id?: string
  author?: User
  category?: string
  tags: string[]
  meta_title?: string
  meta_description?: string
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface PropertyFilters {
  search?: string
  property_type?: string
  listing_type?: string
  min_price?: number
  max_price?: number
  location_id?: string
  bedrooms?: number
  bathrooms?: number
  min_surface_area?: number
  max_surface_area?: number
  features?: string[]
  date_added?: 'today' | 'week' | 'month' | 'all'
  sort_by?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'relevance'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  subject?: string
  message: string
  property_id?: string
  property?: Property
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string // Correspond à la colonne 'notes' en base, alias admin_notes
  admin_notes?: string // Alias pour notes
  assigned_to?: string
  created_at: string
  updated_at?: string
}

export interface ContactFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}