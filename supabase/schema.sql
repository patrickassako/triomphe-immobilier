-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'client');
CREATE TYPE property_status AS ENUM ('available', 'sold', 'rented', 'pending');
CREATE TYPE property_type AS ENUM ('villa', 'appartement', 'terrain', 'bureau', 'commerce', 'maison');
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'completed', 'cancelled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role user_role DEFAULT 'client',
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
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

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
     price DECIMAL(15, 2) NOT NULL,
     price_type VARCHAR(32) DEFAULT 'fixed', -- fixed | per_sqm_per_month | per_month
    currency VARCHAR(3) DEFAULT 'XAF',
    property_type property_type NOT NULL,
    status property_status DEFAULT 'available',
    
    -- Property details
    bedrooms INTEGER,
    bathrooms INTEGER,
    surface_area DECIMAL(10, 2),
    land_area DECIMAL(10, 2),
    year_built INTEGER,
    parking_spaces INTEGER,
    
    -- Location
    address TEXT,
    location_id UUID REFERENCES locations(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Features
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    
    -- Media
    images JSONB DEFAULT '[]',
    virtual_tour_url TEXT,
    video_url TEXT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Management
    category_id UUID REFERENCES categories(id),
    agent_id UUID REFERENCES users(id),
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property images table (for better image management)
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    author_id UUID REFERENCES users(id),
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property visits table
CREATE TABLE property_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    visitor_ip VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table for site configuration
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
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
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Villa', 'villa', 'Villas et maisons individuelles', 'home'),
('Appartement', 'appartement', 'Appartements et studios', 'building'),
('Terrain', 'terrain', 'Terrains à bâtir et agricoles', 'map'),
('Bureau', 'bureau', 'Espaces de bureaux et commerces', 'briefcase'),
('Commerce', 'commerce', 'Locaux commerciaux et industriels', 'store');

-- Insert default locations
INSERT INTO locations (name, slug, city, region, latitude, longitude) VALUES
('Yaoundé Centre', 'yaounde-centre', 'Yaoundé', 'Centre', 3.8480, 11.5021),
('Bastos', 'bastos', 'Yaoundé', 'Centre', 3.8856, 11.5189),
('Odza', 'odza', 'Yaoundé', 'Centre', 3.8264, 11.5436),
('Douala Centre', 'douala-centre', 'Douala', 'Littoral', 4.0511, 9.7679),
('Bonanjo', 'bonanjo', 'Douala', 'Littoral', 4.0469, 9.7047),
('Akwa', 'akwa', 'Douala', 'Littoral', 4.0583, 9.7047);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('site_name', '"Triomphe Immobilier"', 'Nom du site'),
('site_description', '"Votre partenaire de confiance pour l''immobilier au Cameroun"', 'Description du site'),
('contact_email', '"contact@triomphe-immobilier.cm"', 'Email de contact principal'),
('contact_phone', '"+237 6XX XX XX XX"', 'Téléphone de contact'),
('whatsapp_number', '"+237 6XX XX XX XX"', 'Numéro WhatsApp'),
('office_address', '"Yaoundé, Cameroun"', 'Adresse du bureau principal'),
('facebook_url', '"https://facebook.com/triomphe-immobilier"', 'Page Facebook'),
('instagram_url', '"https://instagram.com/triomphe-immobilier"', 'Page Instagram'),
('properties_per_page', '12', 'Nombre de biens par page'),
('featured_properties_count', '6', 'Nombre de biens à la une sur l''accueil');

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Everyone can view published properties
CREATE POLICY "Anyone can view published properties" ON properties
FOR SELECT USING (is_published = true);

-- Only admins and agents can manage properties
CREATE POLICY "Admins and agents can manage properties" ON properties
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'agent')
    )
);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
FOR ALL USING (auth.uid() = user_id);

-- Anyone can create contacts
CREATE POLICY "Anyone can create contacts" ON contacts
FOR INSERT WITH CHECK (true);

-- Only admins and agents can view contacts
CREATE POLICY "Admins and agents can view contacts" ON contacts
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'agent')
    )
);