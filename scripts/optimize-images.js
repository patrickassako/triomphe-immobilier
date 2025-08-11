#!/usr/bin/env node

/**
 * Script d'optimisation des images pour TRIOMPHE Immobilier
 * Développé par Patrick Essomba - Tel: +237 694 788 215
 */

const fs = require('fs')
const path = require('path')

console.log('🖼️  Optimisation des images TRIOMPHE Immobilier')
console.log('================================================')

// Configuration
const imageConfig = {
  quality: 85,
  formats: ['webp', 'avif'],
  sizes: {
    thumbnail: 300,
    medium: 800,
    large: 1200,
    hero: 1920
  }
}

// Vérifier l'existence des images requises
const requiredImages = [
  'public/favicon.ico',
  'public/icon-192.png',
  'public/icon-512.png',
  'public/apple-touch-icon.png',
  'public/images/logo.png',
  'public/images/hero-bg.jpg'
]

console.log('📋 Vérification des images requises...')

const missingImages = []
requiredImages.forEach(imagePath => {
  if (!fs.existsSync(imagePath)) {
    missingImages.push(imagePath)
  } else {
    console.log(`✅ ${imagePath}`)
  }
})

if (missingImages.length > 0) {
  console.log('\n❌ Images manquantes :')
  missingImages.forEach(image => {
    console.log(`   - ${image}`)
  })
  
  console.log('\n📝 Suggestions :')
  console.log('1. Créer un favicon : https://favicon.io/')
  console.log('2. Générer icônes PWA : https://www.pwabuilder.com/imageGenerator')
  console.log('3. Optimiser images : https://tinypng.com/')
}

// Lister les images existantes
console.log('\n📁 Images actuelles dans public/images/ :')
const imagesDir = 'public/images'
if (fs.existsSync(imagesDir)) {
  const files = fs.readdirSync(imagesDir)
  files.forEach(file => {
    const filePath = path.join(imagesDir, file)
    const stats = fs.statSync(filePath)
    const sizeKB = Math.round(stats.size / 1024)
    console.log(`   📸 ${file} (${sizeKB} KB)`)
    
    // Suggestions d'optimisation
    if (sizeKB > 500) {
      console.log(`      ⚠️  Suggestion: Optimiser cette image (${sizeKB} KB > 500 KB)`)
    }
  })
} else {
  console.log('   📁 Dossier public/images/ non trouvé')
}

// Guide rapide
console.log('\n🚀 Guide rapide :')
console.log('1. Remplacer images: cp votre-image.jpg public/images/')
console.log('2. Optimiser: https://tinypng.com/')
console.log('3. Redémarrer: npm run dev')
console.log('4. Tester: http://localhost:3000')

console.log('\n📞 Support: Patrick Essomba - +237 694 788 215')
