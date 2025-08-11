#!/bin/bash

echo "🚀 Commandes de déploiement TRIOMPHE"
echo "======================================"

echo ""
echo "📋 ÉTAPE 2: Pusher sur GitHub"
echo "Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub:"
echo ""

echo "git remote add origin https://github.com/VOTRE_USERNAME/triomphe-immobilier.git"
echo "git branch -M main"
echo "git push -u origin main"

echo ""
echo "📋 ÉTAPE 3: Variables d'environnement pour Vercel"
echo "Vous aurez besoin de ces variables:"
echo ""

echo "NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJI..."
echo "SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJI... (optionnel)"

echo ""
echo "🔑 Pour obtenir vos clés Supabase:"
echo "1. Allez sur supabase.com"
echo "2. Sélectionnez votre projet"
echo "3. Settings > API"
echo "4. Copiez l'URL et la clé publique"

echo ""
echo "🌐 Après déploiement, votre site sera disponible à:"
echo "https://triomphe-immobilier.vercel.app"

echo ""
echo "👤 Dashboard admin:"
echo "https://triomphe-immobilier.vercel.app/admin"

echo ""
echo "Développé par Patrick Essomba (+237 694 788 215)"
