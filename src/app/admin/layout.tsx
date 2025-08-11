'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [devBypass, setDevBypass] = useState(false)

  useEffect(() => {
    // Bypass dev access if enabled
    if (process.env.NODE_ENV === 'development') {
      try {
        const flag = typeof window !== 'undefined' && localStorage.getItem('dev_admin_access') === 'true'
        if (flag) {
          setDevBypass(true)
          return
        }
      } catch {}
    }

    if (loading) return

    if (!user) {
      router.push('/auth/signin?callbackUrl=/admin')
      return
    }

    if (user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, loading, router])

  if (loading && !devBypass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!devBypass && (!user || user.role !== 'admin')) {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}