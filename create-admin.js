const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcrypt')

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
  try {
    // Hash du mot de passe
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur admin
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@sci-triomphe.com',
          password_hash: hashedPassword,
          first_name: 'Admin',
          last_name: 'SCI Triomphe',
          role: 'admin',
          email_verified: true,
          is_active: true
        }
      ])
      .select()

    if (error) {
      console.error('Erreur lors de la création de l\'admin:', error)
      return
    }

    console.log('✅ Compte administrateur créé avec succès!')
    console.log('📧 Email: admin@sci-triomphe.com')
    console.log('🔑 Mot de passe: admin123')
    console.log('🌐 URL de connexion: http://localhost:3002/auth/signin')
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

createAdmin()