import Image from 'next/image'
import { Home } from 'lucide-react'

interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ 
  variant = 'light', 
  size = 'md', 
  showText = true,
  className = ''
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto', 
    lg: 'h-12 w-auto'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900'

  return (
    <div className={`flex items-center ${className}`}>
      {/* Option 1: Image logo (si disponible) */}
      {/* 
      <Image
        src={variant === 'dark' ? '/images/logo-white.png' : '/images/logo.png'}
        alt="TRIOMPHE Immobilier"
        width={size === 'lg' ? 150 : size === 'md' ? 120 : 100}
        height={size === 'lg' ? 60 : size === 'md' ? 48 : 40}
        className={sizeClasses[size]}
        priority
      />
      */}
      
      {/* Option 2: Icône + Texte (actuel) */}
      <Home className={`${sizeClasses[size]} ${variant === 'dark' ? 'text-white' : 'text-primary-500'}`} />
      
      {showText && (
        <span className={`ml-2 ${textSizeClasses[size]} font-bold ${textColor}`}>
          SCI Triomphe
        </span>
      )}
    </div>
  )
}
