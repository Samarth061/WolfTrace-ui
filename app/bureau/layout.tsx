'use client'

import { WolfTraceProvider } from '@/components/wolftrace-provider'
import { BureauSidebar } from '@/components/bureau/sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/lib/types'

export default function BureauLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [auth, setAuth] = useState<{ badgeId: string; role: UserRole } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('wt-auth='))
    if (cookie) {
      try {
        const data = JSON.parse(decodeURIComponent(cookie.split('=')[1]))
        setAuth(data)
      } catch {
        router.push('/')
      }
    } else {
      router.push('/')
    }
    setLoading(false)
  }, [router])

  if (loading || !auth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#764608] border-t-[#A17120]" />
          <p className="font-mono text-xs text-muted-foreground">Entering the Bureau...</p>
        </div>
      </div>
    )
  }

  return (
    <WolfTraceProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <BureauSidebar badgeId={auth.badgeId} role={auth.role} />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </WolfTraceProvider>
  )
}
