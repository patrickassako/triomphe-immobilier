import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Compter les contacts par statut
    const { data: statusCounts, error: statusError } = await supabaseAdmin
      .from('contacts')
      .select('status')
      
    if (statusError) {
      throw statusError
    }

    const stats = {
      total: statusCounts.length,
      new: statusCounts.filter(c => c.status === 'new').length,
      in_progress: statusCounts.filter(c => c.status === 'in_progress').length,
      completed: statusCounts.filter(c => c.status === 'completed').length,
      cancelled: statusCounts.filter(c => c.status === 'cancelled').length,
    }

    // Contacts récents (dernières 24h)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentContacts, error: recentError } = await supabaseAdmin
      .from('contacts')
      .select('id, created_at')
      .gte('created_at', yesterday.toISOString())

    if (recentError) {
      throw recentError
    }

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        recent_24h: recentContacts.length
      }
    })
  } catch (error: any) {
    console.error('Erreur API contacts stats:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la récupération des statistiques' 
    }, { status: 500 })
  }
}
