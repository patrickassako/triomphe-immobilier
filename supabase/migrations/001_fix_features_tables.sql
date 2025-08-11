-- Create features table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_features junction table
CREATE TABLE IF NOT EXISTS property_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, feature_id)
);

-- Update property_type enum to match the form
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'apartment';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'house';  
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'land';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'commercial';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'office';

-- Update properties table to use land_size instead of land_area
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS land_size DECIMAL(10, 2);

-- Copy data from land_area to land_size if exists
UPDATE properties 
SET land_size = land_area 
WHERE land_area IS NOT NULL AND land_size IS NULL;

-- Insert default features
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
('Internet/Wifi', 'internet-wifi', 'wifi'),
('Parking', 'parking', 'car-front'),
('Vue sur mer', 'vue-mer', 'waves')
ON CONFLICT (slug) DO NOTHING;