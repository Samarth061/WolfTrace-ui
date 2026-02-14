'use client'

import { useRef, useState, useCallback } from 'react'
import { MapPin, Clock, Circle } from 'lucide-react'
import type { Case, CaseStatus } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

const statusColors: Record<CaseStatus, { bg: string; text: string; border: string }> = {
  'Investigating': { bg: 'bg-[#A17120]/15', text: 'text-[#A17120]', border: 'border-[#A17120]/30' },
  'Confirmed': { bg: 'bg-[#4a7c4e]/15', text: 'text-[#6aad6e]', border: 'border-[#4a7c4e]/30' },
  'Debunked': { bg: 'bg-[#8b3a3a]/15', text: 'text-[#c45c5c]', border: 'border-[#8b3a3a]/30' },
  'All-clear': { bg: 'bg-[#3a6b8b]/15', text: 'text-[#5ca3c4]', border: 'border-[#3a6b8b]/30' },
  'Closed': { bg: 'bg-[#555]/15', text: 'text-[#999]', border: 'border-[#555]/30' },
}

interface CaseCardProps {
  caseData: Case
  onDrag: (pos: { x: number; y: number }) => void
  onClick: () => void
  onStringDragStart: () => void
  onStringDrop: () => void
  isDraggingString: boolean
}

export function CaseCard({ caseData, onDrag, onClick, onStringDragStart, onStringDrop, isDraggingString }: CaseCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const posRef = useRef(caseData.position)
  const movedRef = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-string-handle]')) return
    e.stopPropagation()
    setIsDragging(true)
    movedRef.current = false
    dragStartRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    }

    const handleMouseMove = (ev: MouseEvent) => {
      movedRef.current = true
      const newX = ev.clientX - dragStartRef.current.x
      const newY = ev.clientY - dragStartRef.current.y
      posRef.current = { x: newX, y: newY }
      onDrag({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (!movedRef.current) {
        onClick()
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [onDrag, onClick])

  const sc = statusColors[caseData.status]
  const timeAgo = formatDistanceToNow(new Date(caseData.lastUpdated), { addSuffix: true })

  return (
    <div
      className={`absolute select-none ${isDragging ? 'z-30 cursor-grabbing' : 'z-10 cursor-pointer'}`}
      style={{
        left: caseData.position.x,
        top: caseData.position.y,
        transition: isDragging ? 'none' : 'box-shadow 0.3s',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={() => { if (isDraggingString) onStringDrop() }}
    >
      {/* Glow for heat */}
      {caseData.hasHeat && (
        <div className="absolute -inset-2 rounded-sm animate-pulse-glow" />
      )}

      <div
        className={`relative w-56 rounded-sm border bg-gradient-to-br from-[#1a1208] to-[#120c04] p-0 shadow-lg transition-shadow hover:shadow-xl ${
          caseData.hasHeat ? 'border-[#A17120]/40' : 'border-[#764608]/20'
        }`}
      >
        {/* Pin */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-[#A17120] shadow-[0_0_6px_rgba(161,113,32,0.5)]" />

        {/* Folder tab */}
        <div className="flex items-center justify-between border-b border-[#764608]/15 px-3 py-2">
          <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} border ${sc.border}`}>
            {caseData.status}
          </span>
          {caseData.hasHeat && (
            <div className="h-2 w-2 rounded-full bg-[#A17120] animate-pulse" />
          )}
        </div>

        {/* Sticky note area */}
        <div className="px-3 py-3">
          <h3 className="mb-1.5 font-sans text-sm font-bold leading-tight text-foreground">
            {caseData.codename}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate font-sans text-[11px]">{caseData.location}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="font-mono text-[10px]">{timeAgo}</span>
          </div>
        </div>

        {/* String Handle */}
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2">
          <button
            data-string-handle
            onMouseDown={(e) => {
              e.stopPropagation()
              onStringDragStart()
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-[#764608]/60 bg-[#291F0C] text-[#A17120] transition-all hover:bg-[#A17120]/20 hover:border-[#A17120]/60 hover:shadow-[0_0_8px_rgba(161,113,32,0.3)]"
            title="Drag to connect"
          >
            <Circle className="h-2 w-2 fill-current" />
          </button>
        </div>
      </div>
    </div>
  )
}
