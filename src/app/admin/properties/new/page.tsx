'use client'

import { PropertyForm } from '@/components/admin/PropertyForm'

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau bien immobilier</h1>
        <p className="text-gray-600 mt-1">
          Ajoutez une nouvelle propriété à votre catalogue
        </p>
      </div>

      <PropertyForm />
    </div>
  )
}