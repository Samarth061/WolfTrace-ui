'use client'

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

  function handleLogout() {
    document.cookie = 'wt-auth=;path=/;max-age=0'
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
          className="flex items-center gap-2 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3 w-3" />
          Leave Bureau
        </button>
      </div>
    </aside>
  )
}
