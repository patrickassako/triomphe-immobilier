# Guide de Déploiement Production - TRIOMPHE Immobilier

> **✅ Application prête pour la production !**  
> Toutes les erreurs ont été corrigées et l'application est optimisée pour Vercel.

## 🚀 Déploiement Automatique

### Script de déploiement rapide

```bash
# Rendre le script exécutable
chmod +x deploy-vercel.sh

# Lancer le déploiement automatique
./deploy-vercel.sh
```

## 📋 Prérequis

### 1. Comptes nécessaires
- ✅ Compte GitHub
- ✅ Compte Vercel (gratuit)
- ✅ Projet Supabase configuré

### 2. Variables d'environnement requises

Vous devrez configurer ces variables dans Vercel :

```bash
# Application
NEXT_PUBLIC_SITE_URL=https://votre-app.vercel.app
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anonyme
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role

# Auth (optionnel)
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=votre-secret-nextauth
```

## 🚀 Étapes de Déploiement

### Étape 1: Préparer le Repository GitHub

1. **Créer un repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - TRIOMPHE Immobilier"
   git branch -M main
   git remote add origin https://github.com/votre-username/triomphe.git
   git push -u origin main
   ```

### Étape 2: Déployer sur Vercel

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Se connecter avec GitHub**
3. **Cliquer "New Project"**
4. **Importer votre repository**
5. **Configurer les variables d'environnement**
6. **Déployer** 🚀

### Étape 3: Configuration des Variables

Dans le dashboard Vercel, aller dans **Settings > Environment Variables** :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `NEXT_PUBLIC_SITE_URL` | `https://votre-app.vercel.app` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé privée Supabase | Production |

### Étape 4: Configuration Supabase

1. **Aller dans Supabase Dashboard**
2. **Settings > API**
3. **Copier les clés nécessaires**
4. **Configuration > URL Configuration**
   - Ajouter votre domaine Vercel dans "Site URL"
   - Ajouter votre domaine dans "Redirect URLs"

## ⚙️ Optimisations

### 1. Performance
- ✅ Images optimisées avec Next.js Image
- ✅ Lazy loading activé
- ✅ Code splitting automatique
- ✅ Cache configuré

### 2. SEO
- ✅ Meta tags configurés
- ✅ Sitemap généré
- ✅ Open Graph tags
- ✅ URLs optimisées

### 3. Sécurité
- ✅ Variables d'environnement sécurisées
- ✅ Headers de sécurité configurés
- ✅ CORS configuré
- ✅ Authentification Supabase

## 🔧 Commandes Utiles

```bash
# Build local pour tester
npm run build

# Démarrer en mode production local
npm start

# Analyser le bundle
npm run build && npx @next/bundle-analyzer

# Vérifier les types
npm run type-check
```

## 🌍 Domaine Personnalisé

### Avec Vercel (Gratuit)
1. **Aller dans Project Settings > Domains**
2. **Ajouter votre domaine**
3. **Configurer les DNS selon les instructions**

### Avec votre registraire
```
Type: CNAME
Name: www (ou @)
Value: cname.vercel-dns.com
```

## 📊 Monitoring

### Analytics intégrés Vercel
- ✅ Temps de chargement
- ✅ Core Web Vitals
- ✅ Trafic et erreurs
- ✅ Fonctions serverless

### Ajout Google Analytics (optionnel)
1. Créer une propriété GA4
2. Ajouter `GOOGLE_ANALYTICS_ID` aux variables d'environnement
3. Le code est déjà intégré dans l'application

## 🔍 Debugging

### Logs Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Voir les logs en temps réel
vercel logs

# Logs de déploiement
vercel logs --since=1h
```

### Erreurs communes
1. **Variables d'environnement manquantes** → Vérifier dans Settings
2. **Erreur Supabase** → Vérifier les URLs et clés
3. **Build failed** → Vérifier les dépendances et types

## 📞 Support

**Développé par Patrick Essomba**
📱 **Tel:** +237 694 788 215

---

*Application développée avec Next.js, TypeScript et Supabase*
