#!/bin/bash

# Script de déploiement automatisé pour Vercel
# Développé par Patrick Essomba - SCI Triomphe

echo "🚀 Déploiement automatique sur Vercel..."
echo "======================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI n'est pas installé${NC}"
    echo "Installation automatique..."
    npm i -g vercel
fi

# Nettoyer les fichiers temporaires
echo -e "${BLUE}🧹 Nettoyage des fichiers temporaires...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel

# Vérifier les dépendances
echo -e "${BLUE}📦 Vérification des dépendances...${NC}"
npm install

# Variables d'environnement nécessaires
echo -e "${YELLOW}⚠️  Variables d'environnement requises:${NC}"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY (optionnel)"

# Déploiement sur Vercel
echo -e "${BLUE}🚀 Déploiement en cours...${NC}"

# Premier déploiement ou mise à jour
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}📝 Premier déploiement - Configuration du projet...${NC}"
    vercel --prod
else
    echo -e "${YELLOW}🔄 Mise à jour du projet existant...${NC}"
    vercel --prod
fi

# Vérification du déploiement
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Déploiement réussi!${NC}"
    echo -e "${GREEN}🌐 Votre application est maintenant en ligne${NC}"
    echo ""
    echo -e "${BLUE}📋 Prochaines étapes:${NC}"
    echo "1. Configurer votre domaine personnalisé (si nécessaire)"
    echo "2. Configurer les variables d'environnement Supabase"
    echo "3. Tester toutes les fonctionnalités"
    echo ""
    echo -e "${YELLOW}💡 Conseil: Utilisez 'vercel' sans --prod pour les déploiements de test${NC}"
else
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Déploiement terminé avec succès!${NC}"
echo "Développé par Patrick Essomba (+237 694 788 215)"
