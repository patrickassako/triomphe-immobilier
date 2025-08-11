-- Schema Supabase pour SCI Triomphe
-- Ce schéma utilise Supabase Auth au lieu d'une table users personnalisée

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'client');
CREATE TYPE property_status AS ENUM ('available', 'sold', 'rented', 'pending');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'land', 'commercial', 'office');
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'completed', 'cancelled');

-- Table profiles (complète auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role user_role DEFAULT 'client',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XAF',
    property_type property_type NOT NULL,
    status property_status DEFAULT 'available',
    
    -- Property details
    bedrooms INTEGER,
    bathrooms INTEGER,
    surface_area DECIMAL(10, 2),
    land_size DECIMAL(10, 2),
    year_built INTEGER,
    parking_spaces INTEGER,
    
    -- Location
    address TEXT,
    location_id UUID REFERENCES locations(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Management
    category_id UUID REFERENCES categories(id),
    agent_id UUID REFERENCES profiles(id),
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property images table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property features junction table
CREATE TABLE property_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, feature_id)
);

-- Contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    subject VARCHAR(255),
    property_id UUID REFERENCES properties(id),
    status contact_status DEFAULT 'new',
    notes TEXT,
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Blog posts table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES profiles(id),
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_location ON properties(location_id);
CREATE INDEX idx_properties_featured ON properties(is_featured);
CREATE INDEX idx_properties_published ON properties(is_published);
CREATE INDEX idx_properties_created ON properties(created_at DESC);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Données par défaut
INSERT INTO categories (name, slug, description, icon) VALUES
('Vente', 'vente', 'Propriétés à vendre', 'home'),
('Location', 'location', 'Propriétés à louer', 'key'),
('Location vacances', 'location-vacances', 'Locations saisonnières', 'calendar');

INSERT INTO locations (name, slug, city, region, latitude, longitude) VALUES
('Bastos', 'bastos', 'Yaoundé', 'Centre', 3.8856, 11.5189),
('Centre-ville', 'centre-ville', 'Yaoundé', 'Centre', 3.8480, 11.5021),
('Odza', 'odza', 'Yaoundé', 'Centre', 3.8264, 11.5436),
('Douala Centre', 'douala-centre', 'Douala', 'Littoral', 4.0511, 9.7679),
('Akwa', 'akwa', 'Douala', 'Littoral', 4.0583, 9.7047),
('Bonanjo', 'bonanjo', 'Douala', 'Littoral', 4.0469, 9.7047);

INSERT INTO features (name, slug, icon) VALUES
('Piscine', 'piscine', 'waves'),
('Garage', 'garage', 'car'),
('Jardin', 'jardin', 'trees'),
('Climatisation', 'climatisation', 'wind'),
('Sécurité 24h/24', 'securite-24h', 'shield'),
('Ascenseur', 'ascenseur', 'arrow-up'),
('Balcon', 'balcon', 'home'),
('Terrasse', 'terrasse', 'sun'),
('Cuisine équipée', 'cuisine-equipee', 'chef-hat'),
('Internet/Wifi', 'internet-wifi', 'wifi');

INSERT INTO settings (key, value, description) VALUES
('site_name', '"SCI Triomphe"', 'Nom du site'),
('site_description', '"Votre partenaire immobilier de confiance au Cameroun"', 'Description du site'),
('contact_email', '"contact@sci-triomphe.cm"', 'Email de contact'),
('contact_phone', '"+237 6XX XX XX XX"', 'Téléphone de contact'),
('whatsapp_number', '"+237 6XX XX XX XX"', 'Numéro WhatsApp');

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Profils visibles par propriétaire" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profils modifiables par propriétaire" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Propriétés visibles si publiées" ON properties
  FOR SELECT USING (is_published = true);

CREATE POLICY "Propriétés gérables par admin/agent" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Favoris gérables par propriétaire" ON favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Contacts créables par tous" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Contacts visibles par admin/agent" ON contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'agent')
    )
  );