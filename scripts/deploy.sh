#!/bin/bash

# Script de déploiement automatisé pour TRIOMPHE Immobilier
# Développé par Patrick Essomba - Tel: +237 694 788 215

echo "🚀 Déploiement TRIOMPHE Immobilier"
echo "=================================="

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Prérequis OK"

# Build de test
echo "🔨 Test du build..."
if npm run build; then
    echo "✅ Build réussi"
else
    echo "❌ Erreur de build"
    exit 1
fi

# Nettoyage
echo "🧹 Nettoyage..."
rm -rf .next

# Ajout au Git
echo "📝 Ajout des fichiers..."
git add .

# Commit
echo "💾 Commit des changements..."
read -p "Message de commit (ou appuyez sur Entrée pour utiliser le message par défaut): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="🚀 Deploy: Application TRIOMPHE Immobilier prête pour production"
fi

git commit -m "$commit_message"

# Push
echo "⬆️ Push vers GitHub..."
git push origin main

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Aller sur https://vercel.com"
echo "2. Importer votre repository GitHub"
echo "3. Configurer les variables d'environnement :"
echo "   - NEXT_PUBLIC_SITE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "4. Déployer !"
echo ""
echo "📞 Support : Patrick Essomba - +237 694 788 215"
