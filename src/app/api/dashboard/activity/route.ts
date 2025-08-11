import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface ActivityItem {
  id: string
  type: 'property' | 'contact' | 'user'
  title: string
  description: string
  time: string
  status: 'success' | 'warning' | 'info'
  metadata?: any
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Récupérer les dernières propriétés ajoutées
    const { data: recentProperties } = await supabase
      .from('properties')
      .select('id, title, property_type, location, created_at, is_published')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 5))

    // Récupérer les derniers contacts
    const { data: recentContacts } = await supabase
      .from('contacts')
      .select('id, subject, name, created_at, status')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 5))

    // Récupérer les derniers utilisateurs inscrits
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at, role')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 3))

    // Construire le tableau d'activités
    const activities: ActivityItem[] = []

    // Ajouter les propriétés
    recentProperties?.forEach(property => {
      activities.push({
        id: `property-${property.id}`,
        type: 'property',
        title: 'Nouvelle propriété ajoutée',
        description: `${property.property_type || 'Bien'} - ${property.title}`,
        time: formatTimeAgo(property.created_at),
        status: property.is_published ? 'success' : 'warning',
        metadata: property
      })
    })

    // Ajouter les contacts
    recentContacts?.forEach(contact => {
      activities.push({
        id: `contact-${contact.id}`,
        type: 'contact',
        title: contact.status === 'new' ? 'Nouveau message' : 'Message traité',
        description: `${contact.name}: ${contact.subject}`,
        time: formatTimeAgo(contact.created_at),
        status: contact.status === 'new' ? 'info' : 'success',
        metadata: contact
      })
    })

    // Ajouter les utilisateurs
    recentUsers?.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: 'Nouvel utilisateur',
        description: `${user.first_name || ''} ${user.last_name || ''} s'est inscrit`,
        time: formatTimeAgo(user.created_at),
        status: 'success',
        metadata: user
      })
    })

    // Trier par date de création (plus récent en premier)
    activities.sort((a, b) => {
      const timeA = a.metadata?.created_at || new Date().toISOString()
      const timeB = b.metadata?.created_at || new Date().toISOString()
      return new Date(timeB).getTime() - new Date(timeA).getTime()
    })

    // Limiter le nombre d'activités retournées
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedActivities,
      total: activities.length
    })

  } catch (error: any) {
    console.error('Erreur récupération activité:', error)
    
    // Retourner des données mockées en cas d'erreur
    const mockActivities: ActivityItem[] = [
      {
        id: 'mock-1',
        type: 'property',
        title: 'Nouvelle propriété ajoutée',
        description: 'Villa moderne à Bastos',
        time: 'Il y a 2 heures',
        status: 'success'
      },
      {
        id: 'mock-2',
        type: 'contact',
        title: 'Nouveau message',
        description: 'Demande d\'information pour terrain Odza',
        time: 'Il y a 4 heures',
        status: 'info'
      },
      {
        id: 'mock-3',
        type: 'user',
        title: 'Nouvel utilisateur',
        description: 'Jean Dupont s\'est inscrit',
        time: 'Il y a 6 heures',
        status: 'success'
      },
      {
        id: 'mock-4',
        type: 'property',
        title: 'Propriété mise à jour',
        description: 'Appartement 3 pièces Douala',
        time: 'Il y a 1 jour',
        status: 'warning'
      }
    ]

    return NextResponse.json({
      success: false,
      data: mockActivities,
      error: 'Données mockées utilisées',
      total: mockActivities.length
    })
  }
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMilliseconds = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return 'À l\'instant'
  } else if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
  } else if (diffInDays === 1) {
    return 'Il y a 1 jour'
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours`
  } else {
    return date.toLocaleDateString('fr-FR')
  }
}
