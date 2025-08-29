# TRIOMPHE Immobilier 🏠

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/votre-username/triomphe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

**Application immobilière moderne et performante pour la gestion et la présentation de propriétés au Cameroun.**

## 🚀 Fonctionnalités

### 🏡 **Côté Public**
- ✅ **Catalogue de propriétés** avec filtres avancés
- ✅ **Recherche intelligente** par localisation, prix, type
- ✅ **Galeries photos/vidéos** haute qualité
- ✅ **Formulaires de contact** intégrés
- ✅ **Design responsive** mobile-first
- ✅ **Performance optimisée** (Core Web Vitals)

### 🛠️ **Panneau d'Administration**
- ✅ **Dashboard** avec KPIs en temps réel
- ✅ **Gestion des propriétés** (CRUD complet)
- ✅ **Gestion des contacts** et leads
- ✅ **Gestion des utilisateurs** et rôles
- ✅ **Analytics avancés** avec graphiques
- ✅ **Sauvegarde automatique** des données
- ✅ **Paramètres système** configurables

## 🛠️ **Stack Technique**

| Technologie | Usage | Version |
|-------------|-------|---------|
| **Next.js** | Framework React full-stack | 14.2+ |
| **TypeScript** | Typage statique | 5.0+ |
| **Tailwind CSS** | Framework CSS utilitaire | 3.4+ |
| **Supabase** | Base de données PostgreSQL + Auth | 2.54+ |
| **Vercel** | Déploiement et hébergement | - |
| **Lucide React** | Icônes modernes | 0.539+ |
| **Recharts** | Graphiques et analytics | 3.1+ |

## 📋 **Prérequis**

- **Node.js** 18.0+
- **npm** ou **yarn** ou **pnpm**
- **Compte Supabase** (gratuit)
- **Compte Vercel** (gratuit)

## 🚀 **Installation Locale**

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/triomphe.git
cd triomphe
```

### 2. Installer les dépendances
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configuration environnement
```bash
cp .env.production.example .env.local
```

Remplir les variables dans `.env.local` :
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Configurer Supabase
```bash
# Exécuter le schéma de base de données
# Dans votre dashboard Supabase > SQL Editor
# Copier-coller le contenu de supabase/schema.sql
```

### 5. Démarrer l'application
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) 🎉

## 📦 **Déploiement Vercel**

### Méthode rapide (recommandée)
1. **Fork ce repository**
2. **Aller sur [vercel.com](https://vercel.com)**
3. **Importer le projet depuis GitHub**
4. **Configurer les variables d'environnement**
5. **Déployer** 🚀

### Configuration variables Vercel
```env
NEXT_PUBLIC_SITE_URL=https://votre-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Voir le guide détaillé : [`deployment.md`](./deployment.md)

## 📁 **Structure du Projet**

```
triomphe/
├── src/
│   ├── app/                 # Pages Next.js (App Router)
│   │   ├── (public)/       # Pages publiques
│   │   ├── admin/          # Panel administrateur
│   │   └── api/            # API Routes
│   ├── components/         # Composants réutilisables
│   │   ├── ui/            # Composants UI de base
│   │   ├── admin/         # Composants admin
│   │   └── public/        # Composants publics
│   ├── lib/               # Utilitaires et configuration
│   ├── types/             # Types TypeScript
│   └── styles/            # Styles globaux
├── supabase/              # Configuration base de données
├── public/                # Assets statiques
└── docs/                  # Documentation
```

## 🎨 **Design System**

### Couleurs principales
- **Primary** : Bleu moderne (`#3B82F6`)
- **Secondary** : Gris élégant (`#6B7280`)
- **Success** : Vert (`#10B981`)
- **Warning** : Orange (`#F59E0B`)
- **Error** : Rouge (`#EF4444`)

### Composants
- **Buttons** : Variantes primary, secondary, outline
- **Cards** : Shadow moderne avec hover effects
- **Forms** : Validation intégrée avec react-hook-form
- **Modals** : Overlay avec animations smooth

## 📊 **Performance**

### Métriques Lighthouse
- ⚡ **Performance** : 95+
- ♿ **Accessibility** : 90+
- 🔍 **SEO** : 95+
- ✅ **Best Practices** : 95+

### Optimisations
- **Code Splitting** automatique
- **Image Optimization** avec Next.js Image
- **Lazy Loading** des composants
- **Cache Strategy** optimisée
- **Bundle Size** minimisé

## 🔐 **Sécurité**

- ✅ **Headers de sécurité** configurés
- ✅ **CORS** restreint en production
- ✅ **Variables d'environnement** sécurisées
- ✅ **Authentication** Supabase RLS
- ✅ **Input validation** avec Zod
- ✅ **XSS Protection** intégrée

## 🤝 **Contribution**

Les contributions sont les bienvenues ! Veuillez :

1. **Fork** le projet
2. **Créer une branche** (`git checkout -b feature/AmazingFeature`)
3. **Commit** les changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

## 📄 **License**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 **Développeur**

**Patrick Essomba**
- 📱 **Tel:** [+237 694 788 215](tel:+237694788215)
- 💼 **LinkedIn:** [Profil LinkedIn](https://linkedin.com/in/patrick-essomba)
- 📧 **Email:** [contact@patrick-essomba.com](mailto:contact@patrick-essomba.com)

---

## 📞 **Support**

Pour toute question ou support :
- 📱 **Téléphone** : +237 694 788 215
- 📧 **Email** : support@triomphe-immobilier.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-username/triomphe/issues)

---

### 🌟 **Made with ❤️ in Cameroon**

*Application développée avec les dernières technologies web pour offrir une expérience utilisateur exceptionnelle dans le domaine de l'immobilier camerounais.*# Force redeploy - Sat Aug 30 00:41:35 WAT 2025
