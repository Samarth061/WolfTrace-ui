'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid, Briefcase, Trophy, Archive, Shield, Settings, LogOut, ChevronLeft
} from 'lucide-react'
import type { UserRole } from '@/lib/types'

const navItems = [
  { href: '/bureau/wall', icon: LayoutGrid, label: 'Case Wall' },
  { href: '/bureau/solved', icon: Trophy, label: 'Solved Wall' },
  { href: '/bureau/archive', icon: Archive, label: 'Archive' },
  { href: '/bureau/admin', icon: Shield, label: 'Admin', adminOnly: true },
  { href: '/bureau/settings', icon: Settings, label: 'Settings' },
]

export function BureauSidebar({ badgeId, role }: { badgeId: string; role: UserRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  function handleLogout() {
    setShowLogoutConfirm(true)
  }

  function confirmLogout() {
    // Clear auth cookie
    document.cookie = 'wt-auth=;path=/;max-age=0'
    // Redirect to homepage
    router.push('/')
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-[#0d0804]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="h-2 w-2 rounded-full bg-[#A17120] animate-pulse-glow" />
        <span className="font-sans text-base font-bold tracking-tight text-foreground">WolfTrace</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map(item => {
            if (item.adminOnly && role !== 'Admin') return null
            const isActive = pathname === item.href || (item.href !== '/bureau/wall' && pathname.startsWith(item.href))
            const isWallActive = item.href === '/bureau/wall' && (pathname === '/bureau/wall' || pathname.startsWith('/bureau/case'))
            const active = isActive || isWallActive

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2 font-sans text-sm transition-all ${
                    active
                      ? 'bg-[#A17120]/10 text-[#A17120]'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-4">
        <div className="mb-3">
          <p className="font-mono text-xs text-muted-foreground">{badgeId}</p>
          <p className="font-sans text-xs text-[#764608]">{role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-card px-3 py-2 font-sans text-sm text-muted-foreground transition-all hover:border-[#A17120]/40 hover:bg-[#A17120]/10 hover:text-[#A17120]"
        >
          <LogOut className="h-4 w-4" />
          Sign Off
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070401]/90 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-sm border border-border bg-[#160D04] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <LogOut className="h-5 w-5 text-[#A17120]" />
              <h2 className="font-sans text-lg font-bold text-foreground">Sign Off Confirmation</h2>
            </div>
            <p className="mb-6 font-sans text-sm text-muted-foreground">
              Are you sure you want to sign off and return to the public homepage? Any unsaved work will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-sm border border-border bg-card px-4 py-2 font-sans text-sm text-foreground transition-all hover:bg-card/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-sm bg-[#A17120] px-4 py-2 font-sans text-sm font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90"
              >
                Sign Off
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
