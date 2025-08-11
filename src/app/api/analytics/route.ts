import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/analytics - Récupérer les données analytiques
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week, month, year
    const type = searchParams.get('type') || 'overview' // overview, properties, users, contacts

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 })
    }

    // Calcul des dates en fonction de la période
    const now = new Date()
    let startDate: Date
    let groupBy: string

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        groupBy = 'day'
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        groupBy = 'month'
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        groupBy = 'day'
        break
    }

    const startDateStr = startDate.toISOString()

    // Récupération des données selon le type
    switch (type) {
      case 'overview':
        return await getOverviewAnalytics(startDateStr)
      case 'properties':
        return await getPropertiesAnalytics(startDateStr, groupBy)
      case 'users':
        return await getUsersAnalytics(startDateStr, groupBy)
      case 'contacts':
        return await getContactsAnalytics(startDateStr, groupBy)
      default:
        return await getOverviewAnalytics(startDateStr)
    }

  } catch (error: any) {
    console.error('Erreur API analytics:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}

// Analytiques générales
async function getOverviewAnalytics(startDate: string) {
  try {
    const [
      totalPropertiesResult,
      activePropertiesResult,
      totalUsersResult,
      totalContactsResult,
      recentContactsResult,
      totalViewsResult,
      propertiesByTypeResult,
      usersByRoleResult
    ] = await Promise.all([
      // Total des propriétés
      supabaseAdmin!.from('properties').select('*', { count: 'exact', head: true }),
      
      // Propriétés actives
      supabaseAdmin!.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true),
      
      // Total des utilisateurs
      supabaseAdmin!.from('users').select('*', { count: 'exact', head: true }),
      
      // Total des contacts
      supabaseAdmin!.from('contacts').select('*', { count: 'exact', head: true }),
      
      // Nouveaux contacts (période)
      supabaseAdmin!.from('contacts').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
      
      // Total des vues
      supabaseAdmin!.from('properties').select('views_count'),
      
      // Propriétés par type
      supabaseAdmin!.from('properties').select('property_type'),
      
      // Utilisateurs par rôle
      supabaseAdmin!.from('users').select('role')
    ])

    const totalViews = totalViewsResult.data?.reduce((sum, prop) => sum + (prop.views_count || 0), 0) || 0

    // Regroupement par type de propriété
    const propertiesByType = propertiesByTypeResult.data?.reduce((acc: any, prop) => {
      const type = prop.property_type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {}) || {}

    // Regroupement par rôle d'utilisateur
    const usersByRole = usersByRoleResult.data?.reduce((acc: any, user) => {
      const role = user.role || 'client'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalProperties: totalPropertiesResult.count || 0,
          activeProperties: activePropertiesResult.count || 0,
          totalUsers: totalUsersResult.count || 0,
          totalContacts: totalContactsResult.count || 0,
          recentContacts: recentContactsResult.count || 0,
          totalViews
        },
        charts: {
          propertiesByType,
          usersByRole
        }
      }
    })

  } catch (error) {
    console.error('Erreur overview analytics:', error)
    throw error
  }
}

// Analytiques des propriétés
async function getPropertiesAnalytics(startDate: string, groupBy: string) {
  try {
    const { data: properties, error } = await supabaseAdmin!
      .from('properties')
      .select('created_at, views_count, property_type, price')
      .gte('created_at', startDate)

    if (error) throw error

    // Regroupement par période
    const propertiesOverTime = groupDataByPeriod(properties || [], 'created_at', groupBy)
    
    // Répartition par type
    const propertiesByType = (properties || []).reduce((acc: any, prop) => {
      const type = prop.property_type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Répartition par statut
    const propertiesByStatus = (properties || []).reduce((acc: any, prop) => {
      const status = prop.status || 'available'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Prix moyen par type
    const avgPriceByType = Object.keys(propertiesByType).reduce((acc: any, type) => {
      const propsOfType = (properties || []).filter(p => p.property_type === type)
      const avgPrice = propsOfType.reduce((sum, p) => sum + (p.price || 0), 0) / propsOfType.length
      acc[type] = Math.round(avgPrice || 0)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCreated: properties?.length || 0,
          totalViews: properties?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0
        },
        charts: {
          propertiesOverTime,
          propertiesByType,
          propertiesByStatus,
          avgPriceByType
        }
      }
    })

  } catch (error) {
    console.error('Erreur properties analytics:', error)
    throw error
  }
}

// Analytiques des utilisateurs
async function getUsersAnalytics(startDate: string, groupBy: string) {
  try {
    const { data: users, error } = await supabaseAdmin!
      .from('users')
      .select('created_at, role')
      .gte('created_at', startDate)

    if (error) throw error

    const usersOverTime = groupDataByPeriod(users || [], 'created_at', groupBy)
    
    const usersByRole = (users || []).reduce((acc: any, user) => {
      const role = user.role || 'client'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCreated: users?.length || 0
        },
        charts: {
          usersOverTime,
          usersByRole
        }
      }
    })

  } catch (error) {
    console.error('Erreur users analytics:', error)
    throw error
  }
}

// Analytiques des contacts
async function getContactsAnalytics(startDate: string, groupBy: string) {
  try {
    const { data: contacts, error } = await supabaseAdmin!
      .from('contacts')
      .select('created_at, status')
      .gte('created_at', startDate)

    if (error) throw error

    const contactsOverTime = groupDataByPeriod(contacts || [], 'created_at', groupBy)
    
    const contactsByStatus = (contacts || []).reduce((acc: any, contact) => {
      const status = contact.status || 'new'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCreated: contacts?.length || 0
        },
        charts: {
          contactsOverTime,
          contactsByStatus
        }
      }
    })

  } catch (error) {
    console.error('Erreur contacts analytics:', error)
    throw error
  }
}

// Fonction utilitaire pour regrouper les données par période
function groupDataByPeriod(data: any[], dateField: string, groupBy: string) {
  const grouped: any = {}

  data.forEach(item => {
    const date = new Date(item[dateField])
    let key: string

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0] // YYYY-MM-DD
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    grouped[key] = (grouped[key] || 0) + 1
  })

  // Convertir en array pour les graphiques
  return Object.keys(grouped)
    .sort()
    .map(date => ({
      date,
      count: grouped[date]
    }))
}

