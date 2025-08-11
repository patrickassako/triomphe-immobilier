-- Migration: Ajouter la colonne shares_count à la table properties
-- Date: 2024-01-XX

-- Ajouter la colonne shares_count si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'shares_count'
    ) THEN
        ALTER TABLE properties ADD COLUMN shares_count INTEGER DEFAULT 0;
    END IF;
END $$;
