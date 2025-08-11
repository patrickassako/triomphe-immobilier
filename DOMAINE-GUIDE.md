# 🌐 Guide Configuration Domaine Personnalisé

## 📋 Prérequis
- ✅ Application déployée sur Vercel
- ✅ Domaine existant (ex: `mondomaine.com`)
- ✅ Accès aux paramètres DNS de votre registraire

---

## 🚀 Étape 1: Configuration dans Vercel

### 1.1 Accéder aux paramètres
1. Allez sur https://vercel.com/dashboard
2. Cliquez sur votre projet **"triomphe-immobilier"**
3. Onglet **"Settings"** → **"Domains"**

### 1.2 Ajouter votre domaine
1. Cliquez **"Add Domain"**
2. Entrez votre domaine: `mondomaine.com`
3. Vercel va vous donner les enregistrements DNS

---

## ⚙️ Étape 2: Configuration DNS

### 2.1 Domaine principal (apex)
```
Type: A
Name: @ (ou racine)
Value: 76.76.19.61
TTL: 3600
```

### 2.2 Sous-domaine www
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 2.3 Exemples selon registraires

#### **OVH**
- Aller dans "Zone DNS"
- Modifier l'enregistrement A: `@` → `76.76.19.61`
- Ajouter CNAME: `www` → `cname.vercel-dns.com`

#### **Namecheap**
- Aller dans "Advanced DNS"
- Host: `@`, Type: `A Record`, Value: `76.76.19.61`
- Host: `www`, Type: `CNAME`, Value: `cname.vercel-dns.com`

#### **GoDaddy**
- DNS Management
- Type: `A`, Name: `@`, Value: `76.76.19.61`
- Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

#### **LWS**
- Gestion DNS
- Type: `A`, Nom: `@`, Valeur: `76.76.19.61`
- Type: `CNAME`, Nom: `www`, Valeur: `cname.vercel-dns.com`

---

## 🔒 Étape 3: SSL et Sécurité

### 3.1 SSL automatique
- ✅ Vercel configure automatiquement **Let's Encrypt**
- ✅ Certificat gratuit et auto-renouvelé
- ✅ Redirection HTTPS automatique

### 3.2 Headers de sécurité
- ✅ **Déjà configurés** dans `next.config.js`
- ✅ Protection XSS, CSRF, Clickjacking
- ✅ CORS configuré pour API

---

## 📧 Étape 4: Variables d'environnement

### 4.1 Mettre à jour Vercel
Dans Vercel **Settings** → **Environment Variables**:

```bash
# Nouveau domaine principal
NEXT_PUBLIC_SITE_URL=https://mondomaine.com

# URLs callback auth
NEXT_PUBLIC_AUTH_CALLBACK_URL=https://mondomaine.com/auth/callback
```

### 4.2 Supabase Auth
Dans Supabase **Authentication** → **URL Configuration**:
- **Site URL**: `https://mondomaine.com`
- **Redirect URLs**: 
  - `https://mondomaine.com/auth/callback`
  - `https://www.mondomaine.com/auth/callback`

---

## ⏱️ Étape 5: Propagation DNS

### 5.1 Temps d'attente
- **DNS**: 15 minutes à 48h
- **SSL**: 5-10 minutes après DNS
- **Vérification**: https://dnschecker.org

### 5.2 Test de propagation
```bash
# Vérifier A record
dig +short mondomaine.com

# Vérifier CNAME
dig +short www.mondomaine.com

# Résultat attendu
76.76.19.61
```

---

## 🛠️ Étape 6: Tests finaux

### 6.1 Vérifications
- [ ] `https://mondomaine.com` → ✅ Site accessible
- [ ] `https://www.mondomaine.com` → ✅ Redirection vers domaine principal
- [ ] `https://mondomaine.com/admin` → ✅ Dashboard admin
- [ ] SSL valide (cadenas vert)
- [ ] Auth Google/email fonctionne

### 6.2 Commandes de test
```bash
# Test réponse serveur
curl -I https://mondomaine.com

# Test redirection www
curl -I https://www.mondomaine.com

# Test admin
curl -I https://mondomaine.com/admin
```

---

## 🔧 Dépannage

### Problème: DNS ne propage pas
**Solution**: Vérifier registraire, attendre 48h max

### Problème: SSL ne fonctionne pas
**Solution**: Attendre propagation DNS complète

### Problème: Auth Google ne marche pas
**Solution**: Mettre à jour redirect URIs dans Google Console

### Problème: 404 sur domaine
**Solution**: Vérifier enregistrements DNS, redéployer Vercel

---

## 📞 Support

- **Développeur**: Patrick Essomba
- **Téléphone**: +237 694 788 215
- **Vercel Docs**: https://vercel.com/docs/concepts/projects/domains

---

## ✅ Checklist finale

- [ ] DNS configuré chez registraire
- [ ] Domaine ajouté dans Vercel
- [ ] Variables d'environnement mises à jour
- [ ] URLs Supabase mises à jour
- [ ] Tests de fonctionnement OK
- [ ] SSL actif et valide

**🎉 Votre domaine est prêt !**
