# 🚀 Guide de Démarrage Rapide - TRIOMPHE Immobilier

## ⚡ Déploiement Express sur Vercel (5 minutes)

### 1. Prérequis
- ✅ Compte GitHub
- ✅ Compte Vercel (gratuit) → [vercel.com](https://vercel.com)
- ✅ Projet Supabase → [supabase.com](https://supabase.com)

### 2. Préparation du Code

```bash
# Cloner ou préparer votre repository
git init
git add .
git commit -m "Initial commit: TRIOMPHE Immobilier"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/triomphe.git
git push -u origin main
```

### 3. Déploiement Automatique

**Option A: Script automatique**
```bash
./scripts/deploy.sh
```

**Option B: Manuel**
1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. **Import Project** → Sélectionner votre repo
4. **Deploy** (configuration automatique détectée)

### 4. Variables d'Environnement

Dans **Vercel Dashboard > Settings > Environment Variables** :

```env
NEXT_PUBLIC_SITE_URL=https://votre-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Configuration Supabase

**Base de données :**
1. Aller dans **Supabase Dashboard > SQL Editor**
2. Exécuter le contenu de `supabase/schema.sql`

**Authentication :**
1. **Settings > Authentication > URL Configuration**
2. **Site URL :** `https://votre-app.vercel.app`
3. **Redirect URLs :** `https://votre-app.vercel.app/auth/callback`

### 6. Test Final

✅ **Accéder à votre app :** `https://votre-app.vercel.app`
✅ **Admin panel :** `https://votre-app.vercel.app/admin`
✅ **Tester l'auth :** Se connecter avec un compte

---

## 🔧 Développement Local

```bash
# Installation
npm install

# Variables d'environnement
cp .env.production.example .env.local
# Remplir les variables dans .env.local

# Démarrage
npm run dev
```

Accéder à : http://localhost:3000

---

## 📱 Fonctionnalités Principales

### 🏠 **Côté Public**
- Catalogue de propriétés avec filtres
- Recherche avancée
- Galeries photos/vidéos
- Formulaires de contact
- Design responsive

### 🛠️ **Administration** (`/admin`)
- Dashboard avec KPIs
- Gestion propriétés (CRUD)
- Gestion contacts/leads
- Gestion utilisateurs
- Analytics avec graphiques
- Sauvegarde automatique
- Paramètres système

---

## 🌍 Domaine Personnalisé

### Vercel (Gratuit)
1. **Project Settings > Domains**
2. Ajouter votre domaine
3. Configurer DNS selon instructions

### DNS Configuration
```
Type: CNAME
Name: www (ou @)
Value: cname.vercel-dns.com
```

---

## 📊 Performance

- ⚡ **Lighthouse Score :** 95+
- 🚀 **Temps de chargement :** < 2s
- 📱 **Mobile-friendly :** 100%
- 🔍 **SEO optimisé :** Meta tags, sitemap

---

## 🆘 Support & Debugging

### Logs Vercel
```bash
# Installer CLI
npm i -g vercel

# Voir logs
vercel logs
```

### Erreurs Communes

**❌ Variables d'environnement manquantes**
→ Vérifier Settings > Environment Variables

**❌ Erreur Supabase**
→ Vérifier URLs et clés dans dashboard

**❌ Build failed**
→ Vérifier les dépendances : `npm run build`

**❌ Page 404**
→ Vérifier le routing Next.js

---

## 📞 Aide & Contact

**👨‍💻 Développeur :** Patrick Essomba  
**📱 Téléphone :** [+237 694 788 215](tel:+237694788215)  
**💻 Technologies :** Next.js, TypeScript, Supabase  

---

## 🎯 Checklist de Déploiement

- [ ] Repository GitHub créé
- [ ] Projet Vercel importé  
- [ ] Variables d'environnement configurées
- [ ] Base de données Supabase configurée
- [ ] URLs de redirection configurées
- [ ] Application testée en production
- [ ] Domaine personnalisé configuré (optionnel)

**🎉 Félicitations ! Votre application TRIOMPHE Immobilier est en ligne !**
