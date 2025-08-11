# Guide d'Installation - Triomphe Immobilier

## 📋 Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et les clés API

### 2. Configuration de la base de données

1. Dans le tableau de bord Supabase, aller dans **SQL Editor**
2. Copier et exécuter le contenu du fichier `supabase/schema.sql`
3. Vérifier que toutes les tables ont été créées

### 3. Configuration de l'authentification

1. Aller dans **Authentication** > **Settings**
2. Activer **Enable email confirmations** (optionnel)
3. Configurer les **Site URL** :
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

### 4. Configuration Google OAuth (optionnel)

1. Aller dans **Authentication** > **Providers**
2. Activer **Google**
3. Ajouter les Client ID et Client Secret Google

## 🔑 Variables d'Environnement

Créer le fichier `.env.local` :

```bash
# Supabase - Récupérer dans Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# (Supabase Auth est utilisé; NextAuth n'est plus requis)

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (optionnel pour les images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WhatsApp Business
WHATSAPP_PHONE_NUMBER=+237xxxxxxxxx
```

### (Optionnel) Clé secrète app (si nécessaire pour d'autres middlewares)
Vous pouvez générer des secrets avec OpenSSL ou Node.js si besoin.

## 👤 Créer un utilisateur administrateur

1. S'inscrire sur le site avec votre email
2. Dans Supabase, aller dans **Table Editor** > **users**
3. Modifier votre utilisateur :
   - Changer `role` de `client` à `admin`
   - Mettre `is_active` à `true`
   - Mettre `email_verified` à `true`

## 📁 Structure des Données de Test

Le script SQL inclut des données de base :

### Catégories
- Villa
- Appartement  
- Terrain
- Bureau
- Commerce

### Localisations
- Yaoundé Centre
- Bastos
- Odza
- Douala Centre
- Bonanjo
- Akwa

## 🖼️ Configuration des Images

### Option 1: Cloudinary (Recommandé)
1. Créer un compte sur [cloudinary.com](https://cloudinary.com)
2. Récupérer les clés API
3. Configurer les variables d'environnement

### Option 2: Upload local Next.js
Les images seront stockées dans `public/uploads/` (créer le dossier)

## 🚀 Commandes de Démarrage

```bash
# Installation
npm install

# Développement
npm run dev

# Build production
npm run build
npm run start

# Lint
npm run lint
```

## 🔍 Vérification de l'Installation

### 1. Page d'accueil
- Accéder à `http://localhost:3000`
- Vérifier le header/footer
- Tester la navigation

### 2. Authentification
- S'inscrire avec un nouvel email
- Se connecter/déconnecter
- Accéder au panel admin (si admin)

### 3. Base de données
- Vérifier que les tables existent
- Tester l'insertion de données
- Vérifier les permissions RLS

### 4. API
Tester les endpoints :
```bash
# Test API properties
curl http://localhost:3000/api/properties

# Test API signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## 🐛 Résolution des Problèmes

### Erreur de connexion Supabase
- Vérifier l'URL et les clés API
- Vérifier que le projet Supabase est actif
- Contrôler les variables d'environnement

### Erreur d'authentification
- Vérifier NEXTAUTH_SECRET
- Contrôler NEXTAUTH_URL
- Vider les cookies du navigateur

### Erreur de permissions
- Vérifier les politiques RLS dans Supabase
- Contrôler les rôles utilisateur
- Tester avec un utilisateur admin

### Erreur de base de données
- Vérifier que le schéma SQL a été exécuté
- Contrôler les contraintes de clés étrangères
- Vérifier les types de données

## 📊 Monitoring

### Logs Supabase
- **Logs** : Voir les requêtes en temps réel
- **Auth** : Suivre les connexions
- **API** : Monitorer l'utilisation

### Logs Next.js
```bash
# Voir les logs de développement
npm run dev

# Voir les erreurs de build
npm run build
```

## 🔐 Sécurité en Production

### Variables d'environnement
```bash
# Production
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Headers de sécurité
Ajouter dans `next.config.mjs` :
```javascript
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options', 
    value: 'nosniff'
  },
  // ... autres headers
]
```

### Supabase RLS
- Vérifier que RLS est activé sur toutes les tables
- Tester les permissions avec différents rôles
- Auditer les politiques de sécurité

## 📱 Configuration Mobile

### Responsive
- Tester sur différentes tailles d'écran
- Vérifier la navigation mobile
- Optimiser les images pour mobile

### PWA (optionnel)
```bash
npm install next-pwa
# Configuration dans next.config.mjs
```

## 📈 Performance

### Images
- Utiliser Next.js Image component
- Configurer Cloudinary pour l'optimisation
- Activer le lazy loading

### Cache
- Configurer ISR pour les pages statiques
- Utiliser le cache Supabase
- Optimiser les requêtes SQL

---

**Installation réussie ? Vous pouvez commencer à utiliser Triomphe Immobilier ! 🎉**