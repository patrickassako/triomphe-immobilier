# 📸 Guide de Gestion des Images - TRIOMPHE Immobilier

## 🚀 **Guide Rapide : Comment Changer les Images**

### **Étape 1: Vérifier l'état actuel**
```bash
node scripts/optimize-images.js
```

### **Étape 2: Remplacer une image**
```bash
# Exemple: Changer l'image d'accueil
cp votre-nouvelle-image.jpg public/images/home.png

# Redémarrer l'application
npm run dev
```

### **Étape 3: Optimiser (recommandé)**
Aller sur [tinypng.com](https://tinypng.com) pour compresser vos images.

---

## 📁 **Images Actuellement Utilisées**

| Image | Emplacement | Taille | Usage |
|-------|-------------|--------|-------|
| `home.png` | Hero section (accueil) | 1620 KB | ✅ Active |
| `Frame 255.png` | Section services | 1589 KB | ✅ Active |
| `biens.png` | Section propriétés | 1998 KB | 📱 Disponible |
| `Frame 256.png` | Disponible | 635 KB | 🔄 Libre |
| `Frame 257.png` | Disponible | 1123 KB | 🔄 Libre |

---

## 🔄 **Méthodes de Remplacement**

### **Méthode 1: Remplacement Direct (Plus Simple)**

```bash
# 1. Copier votre nouvelle image
cp votre-image.jpg public/images/home.png

# 2. Redémarrer le serveur
npm run dev

# 3. Vérifier sur http://localhost:3000
```

### **Méthode 2: Modifier le Code (Plus Flexible)**

**Changer l'image d'accueil :**
```tsx
// Fichier: src/components/public/HeroSection.tsx (ligne ~97)
<img
  src="/images/VOTRE-NOUVELLE-IMAGE.jpg"  // ← Changer ici
  alt="TRIOMPHE Immobilier"
  className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
/>
```

**Changer l'image des services :**
```tsx
// Fichier: src/components/public/ServicesSection.tsx (ligne ~41)
<img
  src="/images/VOTRE-IMAGE-SERVICES.jpg"  // ← Changer ici
  alt="Services TRIOMPHE"
  className="w-full h-96 lg:h-[400px] object-cover rounded-lg"
/>
```

---

## 🎨 **Ajouter un Logo**

### **Étape 1: Préparer le logo**
- Format: PNG avec transparence
- Taille: 200x80px (ratio 2.5:1)
- Versions: logo.png (fond clair) + logo-white.png (fond sombre)

### **Étape 2: Ajouter les fichiers**
```bash
cp votre-logo.png public/images/logo.png
cp votre-logo-blanc.png public/images/logo-white.png
```

### **Étape 3: Activer dans le code**
```tsx
// Dans: src/components/ui/Logo.tsx (décommenter lignes 25-32)
<Image
  src={variant === 'dark' ? '/images/logo-white.png' : '/images/logo.png'}
  alt="TRIOMPHE Immobilier"
  width={120}
  height={48}
  priority
/>
```

---

## 🌐 **Icônes PWA & Favicon**

### **Fichiers requis :**
```
public/
├── favicon.ico           # 16x16, 32x32
├── icon-192.png         # 192x192 (PWA)
├── icon-512.png         # 512x512 (PWA)
└── apple-touch-icon.png # 180x180 (iOS)
```

### **Génération automatique :**
1. **Favicon :** [favicon.io](https://favicon.io/)
2. **PWA Icons :** [pwabuilder.com](https://www.pwabuilder.com/imageGenerator)

---

## 📐 **Formats & Tailles Recommandés**

| Type | Format | Taille | Poids Max |
|------|--------|--------|-----------|
| **Logo** | PNG | 200x80px | < 50 KB |
| **Hero** | JPG | 1920x1080px | < 300 KB |
| **Sections** | JPG/PNG | 800x600px | < 200 KB |
| **Favicon** | ICO | 16x16, 32x32 | < 10 KB |
| **PWA Icons** | PNG | 192x192, 512x512 | < 100 KB |

---

## 🔧 **Optimisation des Images**

### **Outils Recommandés :**
- 🌐 [TinyPNG](https://tinypng.com) - Compression automatique
- 🌐 [Squoosh](https://squoosh.app) - Outil Google
- 📱 [ImageOptim](https://imageoptim.com) - App Mac
- 💻 [GIMP](https://www.gimp.org) - Édition gratuite

### **Script d'analyse :**
```bash
# Vérifier toutes les images
node scripts/optimize-images.js

# Résultat inclut :
# ✅ Images existantes
# ⚠️  Suggestions d'optimisation  
# ❌ Images manquantes
```

---

## 🚀 **Workflow Complet**

### **Pour Changer l'Image d'Accueil :**
```bash
# 1. Optimiser votre image
# Aller sur tinypng.com

# 2. Remplacer l'image
cp votre-image-optimisee.jpg public/images/home.png

# 3. Vérifier
node scripts/optimize-images.js

# 4. Tester
npm run dev
# Aller sur http://localhost:3000
```

### **Pour Ajouter une Nouvelle Section :**
```bash
# 1. Ajouter l'image
cp nouvelle-section.jpg public/images/ma-section.jpg

# 2. Utiliser dans le code
<img src="/images/ma-section.jpg" alt="Ma Section" />

# 3. Déployer
git add . && git commit -m "feat: nouvelle image" && git push
```

---

## 📱 **Images de Propriétés (Dynamiques)**

Les photos de propriétés sont gérées via :
- 📤 **Upload** dans l'admin panel
- 💾 **Stockage** sur Firebase Storage
- 🔗 **URLs** dynamiques dans la base de données

```tsx
// Exemple d'affichage
{property.images.map((image, index) => (
  <img 
    key={index}
    src={image.url} 
    alt={image.alt}
    className="w-full h-64 object-cover"
  />
))}
```

---

## 🆘 **Résolution de Problèmes**

### **Image ne s'affiche pas :**
1. ✅ Vérifier le chemin : `/images/nom-exact.extension`
2. ✅ Redémarrer : `npm run dev`
3. ✅ Vérifier la console navigateur (F12)

### **Image trop lourde :**
1. 🗜️ Compresser sur [tinypng.com](https://tinypng.com)
2. 📐 Redimensionner (max 1920px largeur)
3. 🔄 Convertir en WebP si nécessaire

### **Logo flou :**
1. 📏 Utiliser image haute résolution
2. 🎯 Format PNG avec transparence
3. 🔍 Taille minimale 200x80px

---

## 📞 **Support**

**👨‍💻 Développeur :** Patrick Essomba  
**📱 Téléphone :** [+237 694 788 215](tel:+237694788215)  

**🔧 Aide rapide :**
- 💬 WhatsApp : Message avec capture d'écran
- 📧 Email : Envoyer les nouvelles images
- 🖥️ TeamViewer : Assistance à distance

---

## ✅ **Checklist de Validation**

Avant de déployer :
- [ ] Images optimisées (< 500 KB chacune)
- [ ] Favicon présent (public/favicon.ico)
- [ ] Alt text descriptifs
- [ ] Test sur mobile + desktop
- [ ] Performance vérifiée (Lighthouse)

**🎉 Vos nouvelles images sont prêtes !**