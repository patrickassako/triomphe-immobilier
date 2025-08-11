import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/users/[id] - Mettre à jour un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { first_name, last_name, email, role, phone, active } = body

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID utilisateur requis' 
      }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 })
    }

    // Validation du rôle si fourni
    const validRoles = ['admin', 'agent', 'client']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rôle invalide' 
      }, { status: 400 })
    }

    // Construire les données à mettre à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (phone !== undefined) updateData.phone = phone
    if (active !== undefined) updateData.active = active

    // Vérifier si l'email existe déjà (si l'email est modifié)
    if (email) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single()

      if (existingUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'Un autre utilisateur avec cet email existe déjà' 
        }, { status: 400 })
      }
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour utilisateur:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour de l\'utilisateur' 
      }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error: any) {
    console.error('Erreur API users PATCH:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID utilisateur requis' 
      }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 })
    }

    // Vérifier que l'utilisateur existe
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single()

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Empêcher la suppression du dernier admin
    if (user.role === 'admin') {
      const { count: adminCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      if ((adminCount || 0) <= 1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Impossible de supprimer le dernier administrateur' 
        }, { status: 400 })
      }
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur suppression utilisateur:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la suppression de l\'utilisateur' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error: any) {
    console.error('Erreur API users DELETE:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}

