'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui'

export function HeroSection() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    location: '',
    property_type: ''
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Construire les paramètres de recherche
    const searchParams = new URLSearchParams()
    
    if (searchData.location.trim()) {
      searchParams.append('search', searchData.location.trim())
    }
    
    if (searchData.property_type) {
      // Mapper les valeurs du formulaire vers les valeurs de la base de données
      const typeMapping: { [key: string]: string } = {
        'villa': 'villa',
        'appartement': 'appartement', 
        'terrain': 'terrain',
        'bureau': 'bureau',
        'commerce': 'commerce'
      }
      const mappedType = typeMapping[searchData.property_type] || searchData.property_type
      searchParams.append('property_type', mappedType)
    }
    
    // Naviguer vers la page de propriétés avec les paramètres de recherche
    const searchQuery = searchParams.toString()
    const url = searchQuery ? `/properties?${searchQuery}` : '/properties'
    router.push(url)
  }
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Votre partenaire <br />
              immobilier de <br />
              confiance
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Terrains, appartements, maisons, et <br />
              accompagnement personnalisé pour <br />
              concrétiser vos projets.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
              <div className="flex flex-col space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Chercher un emplacement"
                    value={searchData.location}
                    onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select 
                  value={searchData.property_type}
                  onChange={(e) => setSearchData(prev => ({ ...prev, property_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Type de Bien</option>
                  <option value="villa">Villa</option>
                  <option value="appartement">Appartement</option>
                  <option value="terrain">Terrain</option>
                  <option value="bureau">Bureau</option>
                  <option value="commerce">Commerce</option>
                </select>
                <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Chercher
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative">
              <img
                src="/images/home.png"
                alt="TRIOMPHE Immobilier - Votre partenaire immobilier"
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
              />
              {/* Decorative dots pattern */}
              <div className="absolute -top-6 -right-6 w-20 h-20 opacity-20">
                <svg className="w-full h-full text-primary-500" fill="currentColor" viewBox="0 0 100 100">
                  <circle cx="10" cy="10" r="2"/>
                  <circle cx="30" cy="10" r="2"/>
                  <circle cx="50" cy="10" r="2"/>
                  <circle cx="70" cy="10" r="2"/>
                  <circle cx="90" cy="10" r="2"/>
                  <circle cx="10" cy="30" r="2"/>
                  <circle cx="30" cy="30" r="2"/>
                  <circle cx="50" cy="30" r="2"/>
                  <circle cx="70" cy="30" r="2"/>
                  <circle cx="90" cy="30" r="2"/>
                  <circle cx="10" cy="50" r="2"/>
                  <circle cx="30" cy="50" r="2"/>
                  <circle cx="50" cy="50" r="2"/>
                  <circle cx="70" cy="50" r="2"/>
                  <circle cx="90" cy="50" r="2"/>
                  <circle cx="10" cy="70" r="2"/>
                  <circle cx="30" cy="70" r="2"/>
                  <circle cx="50" cy="70" r="2"/>
                  <circle cx="70" cy="70" r="2"/>
                  <circle cx="90" cy="70" r="2"/>
                  <circle cx="10" cy="90" r="2"/>
                  <circle cx="30" cy="90" r="2"/>
                  <circle cx="50" cy="90" r="2"/>
                  <circle cx="70" cy="90" r="2"/>
                  <circle cx="90" cy="90" r="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}