const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.log('Assurez-vous que ces variables sont définies dans .env.local :')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSupabase() {
  console.log('🚀 Configuration de Supabase...')

  try {
    // Test de connexion
    console.log('🔗 Test de connexion à Supabase...')
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    console.log('✅ Connexion Supabase OK')

    // Lecture et exécution du schéma SQL
    console.log('📋 Création des tables...')
    const schemaPath = path.join(__dirname, '../supabase/schema.sql')
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8')
      
      // Diviser le schéma en commandes individuelles
      const commands = schema
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

      for (const command of commands) {
        if (command.trim()) {
          try {
            console.log(`Exécution: ${command.substring(0, 50)}...`)
            const { error } = await supabase.rpc('exec_sql', { query: command })
            if (error && !error.message.includes('already exists')) {
              console.warn(`⚠️  Warning: ${error.message}`)
            }
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.warn(`⚠️  Warning: ${err.message}`)
            }
          }
        }
      }
    } else {
      console.log('⚠️  Schéma SQL non trouvé, création des tables de base...')
      
      // Créer les tables essentielles directement
      await createEssentialTables()
    }

    // Créer un utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...')
    await createAdminUser()

    console.log('✅ Configuration Supabase terminée!')
    console.log('')
    console.log('📋 Informations de connexion:')
    console.log('🌐 URL: http://localhost:3002/auth/signin')
    console.log('📧 Email: admin@sci-triomphe.com')
    console.log('🔑 Mot de passe: admin123')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
    process.exit(1)
  }
}

async function createEssentialTables() {
  // Fonction pour créer les tables directement via l'API Supabase
  console.log('Création manuelle des tables essentielles...')
  
  // Cette approche nécessiterait d'utiliser l'API SQL de Supabase
  // Pour l'instant, on va indiquer à l'utilisateur comment procéder
  console.log('⚠️  Veuillez exécuter manuellement le schéma SQL dans votre dashboard Supabase')
}

async function createAdminUser() {
  try {
    // Vérifier si l'admin existe déjà
    const { data: existingAdmin } = await supabase.auth.admin.listUsers()
    const adminExists = existingAdmin.users.some(user => user.email === 'admin@sci-triomphe.com')

    if (adminExists) {
      console.log('✅ Utilisateur admin existe déjà')
      return
    }

    // Créer l'utilisateur admin
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: 'admin@sci-triomphe.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'SCI Triomphe',
        role: 'admin'
      }
    })

    if (error) {
      throw error
    }

    console.log('✅ Utilisateur admin créé:', newUser.user.email)

    // Ajouter les métadonnées utilisateur dans une table personnalisée si nécessaire
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: newUser.user.email,
        first_name: 'Admin',
        last_name: 'SCI Triomphe',
        role: 'admin',
        is_active: true
      })

    if (profileError && !profileError.message.includes('does not exist')) {
      console.warn('⚠️  Profil non créé:', profileError.message)
    }

  } catch (error) {
    console.error('❌ Erreur création admin:', error.message)
  }
}

setupSupabase()