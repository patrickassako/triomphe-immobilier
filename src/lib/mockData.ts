// Données de démonstration pour le mode développement sans Supabase

export const mockProperties = [
  {
    id: '1',
    title: 'Villa moderne avec piscine - Bastos',
    slug: 'villa-moderne-piscine-bastos',
    description: 'Magnifique villa de 5 chambres située dans le quartier résidentiel de Bastos...',
    price: 85000000,
    property_type: 'house',
    status: 'available',
    bedrooms: 5,
    bathrooms: 3,
    surface_area: 280,
    land_size: 800,
    address: 'Bastos, Yaoundé',
    location: { id: '1', name: 'Bastos' },
    category: { id: '1', name: 'Vente' },
    agent: { first_name: 'Jean', last_name: 'Dupont' },
    images: [
      { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300', is_primary: false }
    ],
    is_published: true,
    is_featured: true,
    views_count: 245,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Appartement 3 pièces - Centre-ville',
    slug: 'appartement-3-pieces-centre-ville',
    description: 'Bel appartement moderne de 3 pièces au cœur de Yaoundé...',
    price: 35000000,
    property_type: 'apartment',
    status: 'available',
    bedrooms: 2,
    bathrooms: 2,
    surface_area: 85,
    address: 'Centre-ville, Yaoundé',
    location: { id: '2', name: 'Centre-ville' },
    category: { id: '1', name: 'Vente' },
    agent: { first_name: 'Marie', last_name: 'Kamga' },
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300', is_primary: true }
    ],
    is_published: true,
    is_featured: false,
    views_count: 128,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    title: 'Terrain de 1000m² - Odza',
    slug: 'terrain-1000m2-odza',
    description: 'Terrain constructible de 1000m² dans le quartier d\'Odza...',
    price: 15000000,
    property_type: 'land',
    status: 'available',
    surface_area: 1000,
    land_size: 1000,
    address: 'Odza, Yaoundé',
    location: { id: '3', name: 'Odza' },
    category: { id: '1', name: 'Vente' },
    agent: { first_name: 'Paul', last_name: 'Nkomo' },
    images: [
      { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300', is_primary: true }
    ],
    is_published: false,
    is_featured: false,
    views_count: 67,
    created_at: '2024-01-08T09:15:00Z',
    updated_at: '2024-01-08T09:15:00Z'
  }
]

export const mockLocations = [
  { id: '1', name: 'Bastos', city: 'Yaoundé', slug: 'bastos' },
  { id: '2', name: 'Centre-ville', city: 'Yaoundé', slug: 'centre-ville' },
  { id: '3', name: 'Odza', city: 'Yaoundé', slug: 'odza' },
  { id: '4', name: 'Douala Centre', city: 'Douala', slug: 'douala-centre' },
  { id: '5', name: 'Akwa', city: 'Douala', slug: 'akwa' },
]

export const mockCategories = [
  { id: '1', name: 'Vente', slug: 'vente' },
  { id: '2', name: 'Location', slug: 'location' },
  { id: '3', name: 'Location vacances', slug: 'location-vacances' }
]

export const mockFeatures = [
  { id: '1', name: 'Piscine', slug: 'piscine' },
  { id: '2', name: 'Garage', slug: 'garage' },
  { id: '3', name: 'Jardin', slug: 'jardin' },
  { id: '4', name: 'Climatisation', slug: 'climatisation' },
  { id: '5', name: 'Sécurité 24h', slug: 'securite-24h' },
  { id: '6', name: 'Ascenseur', slug: 'ascenseur' },
  { id: '7', name: 'Balcon', slug: 'balcon' },
  { id: '8', name: 'Terrasse', slug: 'terrasse' }
]

export const mockContacts = [
  {
    id: '1',
    first_name: 'Emmanuel',
    last_name: 'Atangana',
    email: 'emmanuel.atangana@email.com',
    phone: '+237 677 123 456',
    message: 'Je suis intéressé par la villa à Bastos. Puis-je avoir plus d\'informations ?',
    subject: 'Demande d\'information - Villa Bastos',
    property: mockProperties[0],
    status: 'new',
    created_at: '2024-01-16T08:30:00Z'
  },
  {
    id: '2',
    first_name: 'Sylvie',
    last_name: 'Mballa',
    email: 'sylvie.mballa@email.com',
    phone: '+237 694 789 123',
    message: 'L\'appartement centre-ville est-il encore disponible pour une visite ?',
    subject: 'Demande de visite',
    property: mockProperties[1],
    status: 'in_progress',
    created_at: '2024-01-15T16:45:00Z'
  }
]

export const mockUsers = [
  {
    id: 'admin-1',
    email: 'admin@sci-triomphe.com',
    first_name: 'Admin',
    last_name: 'SCI Triomphe',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'agent-1',
    email: 'jean.dupont@sci-triomphe.com',
    first_name: 'Jean',
    last_name: 'Dupont',
    role: 'agent',
    is_active: true,
    created_at: '2024-01-05T10:00:00Z'
  },
  {
    id: 'client-1',
    email: 'client@email.com',
    first_name: 'Marie',
    last_name: 'Client',
    role: 'client',
    is_active: true,
    created_at: '2024-01-10T15:30:00Z'
  }
]

export const mockStats = {
  totalProperties: mockProperties.length,
  publishedProperties: mockProperties.filter(p => p.is_published).length,
  totalUsers: mockUsers.length,
  totalContacts: mockContacts.length,
  newContacts: mockContacts.filter(c => c.status === 'new').length,
  totalViews: mockProperties.reduce((sum, p) => sum + p.views_count, 0)
}

// Helper function to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))