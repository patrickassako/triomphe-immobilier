const { createClient } = require('@supabase/supabase-js')

// Vous devez remplacer ces valeurs par vos vraies clés Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Clé service pour bypasser RLS

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Veuillez configurer vos variables d\'environnement Supabase')
  console.log('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  try {
    console.log('🌱 Initialisation de la base de données...')

    // 1. Créer des localisations
    const locations = [
      { name: 'Douala', city: 'Douala', slug: 'douala' },
      { name: 'Yaoundé', city: 'Yaoundé', slug: 'yaounde' },
      { name: 'Bafoussam', city: 'Bafoussam', slug: 'bafoussam' },
      { name: 'Bamenda', city: 'Bamenda', slug: 'bamenda' },
    ]

    const { data: locationsData, error: locationsError } = await supabase
      .from('locations')
      .upsert(locations)
      .select()

    if (locationsError) throw locationsError
    console.log('✅ Localisations créées')

    // 2. Créer des catégories
    const categories = [
      { name: 'Vente', slug: 'vente' },
      { name: 'Location', slug: 'location' },
      { name: 'Location vacances', slug: 'location-vacances' },
    ]

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories)
      .select()

    if (categoriesError) throw categoriesError
    console.log('✅ Catégories créées')

    // 3. Créer des caractéristiques
    const features = [
      { name: 'Piscine', slug: 'piscine' },
      { name: 'Garage', slug: 'garage' },
      { name: 'Jardin', slug: 'jardin' },
      { name: 'Climatisation', slug: 'climatisation' },
      { name: 'Sécurité 24h', slug: 'securite-24h' },
      { name: 'Ascenseur', slug: 'ascenseur' },
      { name: 'Balcon', slug: 'balcon' },
      { name: 'Terrasse', slug: 'terrasse' },
    ]

    const { data: featuresData, error: featuresError } = await supabase
      .from('features')
      .upsert(features)
      .select()

    if (featuresError) throw featuresError
    console.log('✅ Caractéristiques créées')

    // 4. Créer un utilisateur admin (méthode simple sans authentification)
    const adminUser = {
      id: '550e8400-e29b-41d4-a716-446655440000', // UUID fixe pour l'admin
      email: 'admin@sci-triomphe.com',
      first_name: 'Admin',
      last_name: 'SCI Triomphe',
      role: 'admin',
      email_verified: true,
      is_active: true,
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([adminUser])
      .select()

    if (userError) throw userError
    console.log('✅ Utilisateur admin créé')

    // 5. Créer quelques propriétés d'exemple
    const properties = [
      {
        title: 'Villa moderne avec piscine à Douala',
        description: 'Magnifique villa de 4 chambres avec piscine, située dans un quartier résidentiel calme.',
        slug: 'villa-moderne-piscine-douala',
        price: 75000000,
        property_type: 'house',
        status: 'available',
        bedrooms: 4,
        bathrooms: 3,
        surface_area: 250,
        land_size: 500,
        address: 'Akwa, Douala, Cameroun',
        location_id: locationsData[0].id,
        category_id: categoriesData[0].id,
        agent_id: adminUser.id,
        is_published: true,
        is_featured: true,
      },
      {
        title: 'Appartement 3 pièces Yaoundé Centre',
        description: 'Bel appartement de 3 pièces au cœur de Yaoundé, proche de toutes commodités.',
        slug: 'appartement-3-pieces-yaounde-centre',
        price: 45000000,
        property_type: 'apartment',
        status: 'available',
        bedrooms: 2,
        bathrooms: 2,
        surface_area: 85,
        address: 'Centre-ville, Yaoundé, Cameroun',
        location_id: locationsData[1].id,
        category_id: categoriesData[0].id,
        agent_id: adminUser.id,
        is_published: true,
        is_featured: false,
      },
    ]

    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .upsert(properties)
      .select()

    if (propertiesError) throw propertiesError
    console.log('✅ Propriétés d\'exemple créées')

    console.log('\n🎉 Base de données initialisée avec succès!')
    console.log('\n📋 Informations de connexion:')
    console.log('🌐 URL: http://localhost:3002/auth/signin')
    console.log('📧 Email: admin@sci-triomphe.com')
    console.log('🔑 Mot de passe: Utilisez n\'importe quel mot de passe (l\'authentification est simplifiée pour le développement)')
    console.log('\n💡 Ou accédez directement à l\'admin: http://localhost:3002/admin')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
  }
}

seedDatabase()