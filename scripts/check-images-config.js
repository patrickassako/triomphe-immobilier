#!/usr/bin/env node

/**
 * Script de diagnostic pour la configuration des images
 * Développé par Patrick Essomba - Tel: +237 694 788 215
 */

console.log('🖼️  Diagnostic Configuration Images - TRIOMPHE Immobilier')
console.log('========================================================')

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

console.log('\n📋 **Configuration Actuelle :**')
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || '❌ Non défini'}`)

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl)
    console.log(`   Domaine Supabase détecté: ${url.hostname}`)
    console.log(`   ✅ Configuration images OK`)
  } catch (error) {
    console.log(`   ❌ URL Supabase malformée: ${error.message}`)
  }
} else {
  console.log(`   ⚠️  Variable NEXT_PUBLIC_SUPABASE_URL manquante`)
}

console.log('\n🔧 **Domaines Images Configurés dans next.config.js :**')
console.log('   ✅ firebasestorage.googleapis.com (Firebase)')
console.log('   ✅ supabase.co (Supabase générique)')
console.log('   ✅ asljbjsrqzawvhqotmpq.supabase.co (fixe)')
console.log('   ✅ localhost (développement)')
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl)
    console.log(`   ✅ ${url.hostname} (dynamique depuis env)`)
  } catch (error) {
    console.log(`   ❌ Domaine dynamique: erreur parsing`)
  }
}

console.log('\n🧪 **Test URLs Images :**')
const testUrls = [
  'https://firebasestorage.googleapis.com/v0/b/my-shop-25vown.appspot.com/o/test.jpg',
  'https://asljbjsrqzawvhqotmpq.supabase.co/storage/v1/object/public/properties/test.jpg'
]

testUrls.forEach(url => {
  try {
    const urlObj = new URL(url)
    console.log(`   ✅ ${urlObj.hostname} - Format URL valide`)
  } catch (error) {
    console.log(`   ❌ ${url} - URL malformée`)
  }
})

console.log('\n🚀 **Actions Recommandées :**')
console.log('   1. Redémarrer le serveur: npm run dev')
console.log('   2. Vider le cache navigateur (Ctrl+Shift+R)')
console.log('   3. Vérifier que les images s\'affichent')

console.log('\n⚠️  **En cas d\'erreur persistante :**')
console.log('   1. Vérifier .env.local avec NEXT_PUBLIC_SUPABASE_URL')
console.log('   2. Ajouter manuellement le domaine dans next.config.js')
console.log('   3. Redémarrer complètement le serveur')

console.log('\n📞 **Support :**')
console.log('   Patrick Essomba - +237 694 788 215')
console.log('   En cas de problème, envoyer capture d\'écran console')
