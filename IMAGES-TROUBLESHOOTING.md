# 🖼️ Guide de Résolution - Erreurs d'Images

## ❌ **Erreur Type: "hostname not configured under images"**

### **Message d'erreur complet :**
```
Error: Invalid src prop (https://asljbjsrqzawvhqotmpq.supabase.co/storage/v1/object/public/properties/xxx.jpg) 
on `next/image`, hostname "asljbjsrqzawvhqotmpq.supabase.co" is not configured under images in your `next.config.js`
```

---

## ✅ **SOLUTION APPLIQUÉE**

### **1. Configuration Automatique des Domaines**
Le `next.config.js` a été mis à jour pour :
- ✅ **Détecter automatiquement** le domaine Supabase depuis `NEXT_PUBLIC_SUPABASE_URL`
- ✅ **Inclure les domaines fixes** nécessaires
- ✅ **Filtrer les valeurs nulles** pour éviter les erreurs

```javascript
// Configuration dynamique dans next.config.js
function getSupabaseDomain() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl)
      return url.hostname
    } catch (error) {
      console.warn('Erreur parsing NEXT_PUBLIC_SUPABASE_URL:', error)
      return null
    }
  }
  return null
}

// Domaines configurés
domains: [
  'firebasestorage.googleapis.com',
  'supabase.co',
  'asljbjsrqzawvhqotmpq.supabase.co', // Fixe actuel
  getSupabaseDomain(), // Dynamique depuis env
  'localhost'
].filter(Boolean)
```

### **2. Script de Diagnostic**
Un script de vérification automatique :

```bash
# Vérifier la configuration des images
npm run check:images
```

**Sortie attendue :**
```
✅ Configuration images OK
✅ asljbjsrqzawvhqotmpq.supabase.co (dynamique depuis env)
✅ Format URL valide
```

---

## 🔧 **Actions de Résolution**

### **Étape 1: Vérification**
```bash
# Diagnostiquer la config
npm run check:images
```

### **Étape 2: Redémarrage (OBLIGATOIRE)**
```bash
# Arrêter le serveur
Ctrl+C

# Redémarrer (la config next.config.js nécessite un restart)
npm run dev
```

### **Étape 3: Test**
1. Aller sur `http://localhost:3000`
2. Vérifier que les images de la section "Nos dernières offres" se chargent
3. Ouvrir la console (F12) pour vérifier l'absence d'erreurs

---

## 🚨 **Dépannage Avancé**

### **Si l'erreur persiste :**

#### **Option 1: Domaine Manuel**
Ajouter manuellement le domaine dans `next.config.js` :
```javascript
domains: [
  'firebasestorage.googleapis.com',
  'supabase.co',
  'VOTRE-DOMAINE-SUPABASE.supabase.co', // ← Ajouter ici
  'localhost'
],
```

#### **Option 2: Vérifier les Variables d'Environnement**
```bash
# Vérifier le fichier .env.local
cat .env.local | grep SUPABASE_URL

# Doit contenir :
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
```

#### **Option 3: Mode de Débogage**
Ajouter temporairement dans `next.config.js` :
```javascript
console.log('🔍 Debug Supabase domain:', getSupabaseDomain())
console.log('🔍 All domains:', domains)
```

#### **Option 4: Solution de Secours (images en loader)**
Si le problème persiste, utiliser un loader d'images :
```javascript
// Dans next.config.js
images: {
  loader: 'custom',
  loaderFile: './src/lib/imageLoader.js'
}
```

---

## 📋 **Checklist de Validation**

- [ ] ✅ `npm run check:images` réussit
- [ ] ✅ Serveur redémarré après modification `next.config.js`
- [ ] ✅ Variable `NEXT_PUBLIC_SUPABASE_URL` définie dans `.env.local`
- [ ] ✅ Images s'affichent sur la page d'accueil
- [ ] ✅ Console navigateur sans erreurs d'images
- [ ] ✅ Section "Nos dernières offres" fonctionne

---

## 🌐 **Domaines Supportés**

| Service | Domaine | Status |
|---------|---------|--------|
| **Supabase Storage** | `*.supabase.co` | ✅ Auto-détecté |
| **Firebase Storage** | `firebasestorage.googleapis.com` | ✅ Configuré |
| **Développement** | `localhost` | ✅ Configuré |
| **Autres** | Manuel | ⚙️ Configurable |

---

## 📞 **Support Technique**

### **🔥 Problème Urgent :**
- 📱 **WhatsApp :** +237 694 788 215
- 📧 **Email :** Envoyer capture d'écran + logs console

### **📊 Informations à Fournir :**
1. Sortie de `npm run check:images`
2. Capture d'écran de l'erreur
3. Console navigateur (F12)
4. Contenu de `.env.local` (sans les clés secrètes)

### **🎯 Développeur :**
**Patrick Essomba**  
Tel: +237 694 788 215  
Spécialiste Next.js & Supabase

---

## 🎉 **Résultat Final**

Après application de cette solution :
- ✅ **Images Supabase** se chargent correctement
- ✅ **Performance optimisée** avec WebP/AVIF
- ✅ **Configuration future-proof** avec détection automatique
- ✅ **Support multi-domaines** pour déploiement

**L'erreur "hostname not configured" est maintenant résolue !**
