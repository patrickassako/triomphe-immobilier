import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, admin_notes, notes } = body

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID du contact requis' 
      }, { status: 400 })
    }

    // Valider le statut
    const validStatuses = ['new', 'in_progress', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Statut invalide' 
      }, { status: 400 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    // Mapper admin_notes vers notes (nom de colonne en base)
    if (admin_notes !== undefined || notes !== undefined) {
      updateData.notes = admin_notes || notes
    }

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        property:properties(
          id,
          title,
          slug
        )
      `)
      .single()

    if (error) {
      console.error('Erreur mise à jour contact:', error)
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Erreur API contacts PATCH:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la mise à jour du contact' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID du contact requis' 
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression contact:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur API contacts DELETE:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la suppression du contact' 
    }, { status: 500 })
  }
}
