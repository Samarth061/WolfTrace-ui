'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Lock } from 'lucide-react'
import type { UserRole } from '@/lib/types'

interface BureauDoorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CORRECT_PATTERN = [0, 4, 8] // diagonal top-left to bottom-right

export function BureauDoorModal({ open, onOpenChange }: BureauDoorModalProps) {
  const router = useRouter()
  const [selectedTiles, setSelectedTiles] = useState<number[]>([])
  const [badgeId, setBadgeId] = useState('')
  const [role, setRole] = useState<UserRole>('Detective')
  const [isDrawing, setIsDrawing] = useState(false)
  const [error, setError] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  const handleTileEnter = useCallback((index: number) => {
    if (!isDrawing) return
    if (selectedTiles.includes(index)) return
    setSelectedTiles(prev => [...prev, index])
  }, [isDrawing, selectedTiles])

  const handleTileDown = useCallback((index: number) => {
    setIsDrawing(true)
    setSelectedTiles([index])
    setError('')
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false)
    if (selectedTiles.length === 3) {
      const isCorrect = CORRECT_PATTERN.every(i => selectedTiles.includes(i))
      if (isCorrect) {
        setUnlocked(true)
      } else {
        setError('Pattern incorrect. Try again.')
        setTimeout(() => setSelectedTiles([]), 500)
      }
    } else if (selectedTiles.length > 0) {
      setError('Trace exactly 3 tiles.')
      setTimeout(() => setSelectedTiles([]), 500)
    }
  }, [selectedTiles])

  function handleEnter() {
    if (!badgeId.trim()) {
      setError('Badge ID required.')
      return
    }
    // Store auth in cookie for simplicity
    document.cookie = `wt-auth=${encodeURIComponent(JSON.stringify({ badgeId, role }))};path=/`
    router.push('/bureau/wall')
  }

  function handleDemoLogin() {
    document.cookie = `wt-auth=${encodeURIComponent(JSON.stringify({ badgeId: 'DEMO-001', role: 'Admin' as UserRole }))};path=/`
    router.push('/bureau/wall')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070401]/90 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm rounded-sm border border-[#764608]/30 bg-[#160D04] p-8 shadow-2xl"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (isDrawing) handleMouseUp() }}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <Lock className="h-5 w-5 text-[#A17120]" />
          <h2 className="font-sans text-xl font-bold text-foreground">The Bureau Door</h2>
        </div>

        {!unlocked ? (
          <>
            <p className="mb-4 font-sans text-sm text-muted-foreground">
              Trace the correct pattern to unlock. Connect 3 tiles.
            </p>

            {/* 3x3 Grid */}
            <div className="mx-auto mb-4 grid w-48 grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <button
                  key={i}
                  onMouseDown={() => handleTileDown(i)}
                  onMouseEnter={() => handleTileEnter(i)}
                  onTouchStart={() => handleTileDown(i)}
                  className={`flex h-14 w-14 items-center justify-center rounded-sm border transition-all ${
                    selectedTiles.includes(i)
                      ? 'border-[#A17120] bg-[#A17120]/20 shadow-[0_0_12px_rgba(161,113,32,0.4)]'
                      : 'border-border bg-card hover:border-[#764608]/40'
                  }`}
                >
                  <div
                    className={`h-3 w-3 rounded-full transition-all ${
                      selectedTiles.includes(i) ? 'bg-[#A17120]' : 'bg-muted-foreground/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            {error && (
              <p className="mb-4 text-center font-sans text-xs text-destructive">{error}</p>
            )}

            <div className="text-center">
              <button
                onClick={handleDemoLogin}
                className="font-sans text-xs text-muted-foreground/60 underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                Standard Login (demo)
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-sm border border-[#A17120]/20 bg-[#A17120]/5 p-3 text-center">
              <p className="font-mono text-xs text-[#A17120]">Pattern accepted</p>
            </div>

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Badge ID
              </label>
              <input
                type="text"
                value={badgeId}
                onChange={e => setBadgeId(e.target.value)}
                placeholder="Enter your badge ID"
                className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-sans text-sm text-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
              >
                <option value="Detective">Detective</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {error && (
              <p className="font-sans text-xs text-destructive">{error}</p>
            )}

            <button
              onClick={handleEnter}
              className="w-full rounded-sm bg-[#A17120] px-6 py-3 font-sans text-sm font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90"
            >
              Enter the Bureau
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
