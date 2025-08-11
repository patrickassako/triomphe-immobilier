#!/usr/bin/env node

/**
 * Script d'aide pour configurer un domaine personnalisé
 * Développé par Patrick Essomba - +237 694 788 215
 */

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function main() {
  console.log('\n🌐 === CONFIGURATION DOMAINE TRIOMPHE ===\n')
  
  try {
    // Récupérer le domaine
    const domain = await ask('📝 Entrez votre domaine (ex: monsite.com): ')
    
    if (!domain || !domain.includes('.')) {
      console.log('❌ Domaine invalide')
      process.exit(1)
    }

    console.log('\n📋 === RÉSUMÉ CONFIGURATION ===')
    console.log(`🌐 Domaine: ${domain}`)
    console.log(`🌐 WWW: www.${domain}`)
    console.log(`🔒 SSL: Automatique (Let's Encrypt)`)
    
    console.log('\n⚙️ === ENREGISTREMENTS DNS REQUIS ===')
    console.log('Configurez ces enregistrements chez votre registraire:\n')
    
    console.log('📌 ENREGISTREMENT A (Domaine principal):')
    console.log(`   Type: A`)
    console.log(`   Nom: @ (ou racine)`)
    console.log(`   Valeur: 76.76.19.61`)
    console.log(`   TTL: 3600\n`)
    
    console.log('📌 ENREGISTREMENT CNAME (Sous-domaine www):')
    console.log(`   Type: CNAME`)
    console.log(`   Nom: www`)
    console.log(`   Valeur: cname.vercel-dns.com`)
    console.log(`   TTL: 3600\n`)
    
    console.log('🚀 === ÉTAPES VERCEL ===')
    console.log('1. Allez sur https://vercel.com/dashboard')
    console.log('2. Projet → Settings → Domains')
    console.log(`3. Add Domain: ${domain}`)
    console.log('4. Suivez les instructions Vercel\n')
    
    console.log('🔧 === VARIABLES D\'ENVIRONNEMENT ===')
    console.log('Dans Vercel Settings → Environment Variables:\n')
    console.log(`NEXT_PUBLIC_SITE_URL=https://${domain}`)
    console.log(`NEXT_PUBLIC_AUTH_CALLBACK_URL=https://${domain}/auth/callback\n`)
    
    console.log('📱 === SUPABASE AUTH ===')
    console.log('Dans Supabase Authentication → URL Configuration:\n')
    console.log(`Site URL: https://${domain}`)
    console.log(`Redirect URLs:`)
    console.log(`  - https://${domain}/auth/callback`)
    console.log(`  - https://www.${domain}/auth/callback\n`)
    
    console.log('⏱️ === PROPAGATION DNS ===')
    console.log('• Temps: 15 minutes à 48h')
    console.log('• Test: https://dnschecker.org')
    console.log(`• Commande: dig +short ${domain}\n`)
    
    console.log('✅ === TESTS FINAUX ===')
    console.log(`• https://${domain} → Site accessible`)
    console.log(`• https://www.${domain} → Redirection`)
    console.log(`• https://${domain}/admin → Dashboard`)
    console.log('• SSL valide (cadenas vert)\n')
    
    const deploy = await ask('🚀 Voulez-vous redéployer maintenant ? (y/N): ')
    
    if (deploy.toLowerCase() === 'y' || deploy.toLowerCase() === 'yes') {
      console.log('\n📦 Redéploiement en cours...')
      console.log('Utilisez: git add . && git commit -m "Setup domain config" && git push')
      console.log('Ou utilisez: ./scripts/deploy-vercel.sh\n')
    }
    
    console.log(`🎉 Configuration générée pour: ${domain}`)
    console.log('📖 Consultez DOMAINE-GUIDE.md pour plus de détails')
    console.log('\n📞 Support: Patrick Essomba - +237 694 788 215')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    rl.close()
  }
}

// Vérification de propagation DNS
function checkDNS(domain) {
  const { spawn } = require('child_process')
  
  console.log(`\n🔍 Vérification DNS pour ${domain}...`)
  
  const dig = spawn('dig', ['+short', domain])
  
  dig.stdout.on('data', (data) => {
    const ip = data.toString().trim()
    if (ip === '76.76.19.61') {
      console.log('✅ DNS configuré correctement!')
    } else if (ip) {
      console.log(`⚠️  DNS pointe vers: ${ip} (attendu: 76.76.19.61)`)
    } else {
      console.log('❌ Aucun enregistrement DNS trouvé')
    }
  })
  
  dig.stderr.on('data', (data) => {
    console.log('ℹ️  Vérifiez manuellement sur https://dnschecker.org')
  })
}

// Lancer le script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { checkDNS }
