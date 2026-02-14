'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Plus, Inbox, X, MapPin, Clock, FileText, Image, Video, ChevronRight } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'
import type { Case, CaseStatus, CaseConnection } from '@/lib/types'
import { CaseCard } from './case-card'
import { CasePeekDrawer } from './case-peek-drawer'
import { NewTipsDrawer } from './new-tips-drawer'
import { CreateCaseModal } from './create-case-modal'

const statusFilters: (CaseStatus | 'All')[] = ['All', 'Investigating', 'Confirmed', 'Debunked', 'All-clear', 'Closed']

export function CaseWall() {
  const { cases, caseConnections, updateCasePosition, addCaseConnection } = useWolfTrace()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'All'>('All')
  const [peekCase, setPeekCase] = useState<Case | null>(null)
  const [tipsOpen, setTipsOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  // Dragging string connections
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const boardRef = useRef<HTMLDivElement>(null)

  // Board pan/zoom
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const lastPanPos = useRef({ x: 0, y: 0 })

  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false
    if (search && !c.codename.toLowerCase().includes(search.toLowerCase()) && !c.location.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingFrom && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      })
    }
    if (isPanning) {
      const dx = e.clientX - lastPanPos.current.x
      const dy = e.clientY - lastPanPos.current.y
      setPan(p => ({ x: p.x + dx, y: p.y + dy }))
      lastPanPos.current = { x: e.clientX, y: e.clientY }
    }
  }, [draggingFrom, isPanning, pan, zoom])

  const handleMouseUp = useCallback(() => {
    setDraggingFrom(null)
    setIsPanning(false)
  }, [])

  const handleStringDrop = useCallback((targetId: string) => {
    if (draggingFrom && draggingFrom !== targetId) {
      const exists = caseConnections.some(
        c => (c.fromId === draggingFrom && c.toId === targetId) || (c.fromId === targetId && c.toId === draggingFrom)
      )
      if (!exists) {
        addCaseConnection({ fromId: draggingFrom, toId: targetId })
      }
    }
    setDraggingFrom(null)
  }, [draggingFrom, caseConnections, addCaseConnection])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.95 : 1.05
    setZoom(z => Math.min(Math.max(z * delta, 0.3), 2))
  }, [])

  const handleBoardMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === boardRef.current || (e.target as HTMLElement).closest('[data-board-bg]')) {
      setIsPanning(true)
      lastPanPos.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  function getCaseCenter(c: Case) {
    return { x: c.position.x + 120, y: c.position.y + 80 }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="z-20 flex items-center gap-3 border-b border-border bg-[#0d0804]/95 px-4 py-3 backdrop-blur-sm">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 rounded-sm border px-3 py-2 font-sans text-sm transition-colors ${
              statusFilter !== 'All' ? 'border-[#A17120]/40 text-[#A17120]' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter className="h-4 w-4" />
            {statusFilter === 'All' ? 'Filter' : statusFilter}
          </button>
          {filterOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 w-44 rounded-sm border border-border bg-[#160D04] p-1 shadow-xl">
              {statusFilters.map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setFilterOpen(false) }}
                  className={`w-full rounded-sm px-3 py-1.5 text-left font-sans text-sm transition-colors ${
                    statusFilter === s ? 'bg-[#A17120]/10 text-[#A17120]' : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-sm bg-[#A17120] px-4 py-2 font-sans text-sm font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90"
        >
          <Plus className="h-4 w-4" />
          Pin New Case
        </button>

        <button
          onClick={() => setTipsOpen(true)}
          className="relative flex items-center gap-2 rounded-sm border border-border px-3 py-2 font-sans text-sm text-muted-foreground transition-colors hover:border-[#764608]/40 hover:text-foreground"
        >
          <Inbox className="h-4 w-4" />
          New Tips
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#A17120] px-1.5 font-mono text-[10px] font-bold text-[#070401]">
            4
          </span>
        </button>
      </div>

      {/* Corkboard */}
      <div
        ref={boardRef}
        className="flex-1 corkboard-bg cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={handleBoardMouseDown}
        onWheel={handleWheel}
        data-board-bg
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="relative h-[2000px] w-[3000px]"
        >
          {/* SVG String Layer */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {caseConnections.map((conn, i) => {
              const fromCase = cases.find(c => c.id === conn.fromId)
              const toCase = cases.find(c => c.id === conn.toId)
              if (!fromCase || !toCase) return null
              const from = getCaseCenter(fromCase)
              const to = getCaseCenter(toCase)
              const midX = (from.x + to.x) / 2
              const midY = (from.y + to.y) / 2 - 20
              return (
                <path
                  key={i}
                  d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                  fill="none"
                  stroke="#764608"
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                  opacity="0.6"
                />
              )
            })}
            {/* Active drag line */}
            {draggingFrom && (() => {
              const fromCase = cases.find(c => c.id === draggingFrom)
              if (!fromCase) return null
              const from = getCaseCenter(fromCase)
              return (
                <line
                  x1={from.x} y1={from.y}
                  x2={mousePos.x} y2={mousePos.y}
                  stroke="#A17120"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              )
            })()}
          </svg>

          {/* Case Cards */}
          {filteredCases.map(c => (
            <CaseCard
              key={c.id}
              caseData={c}
              onDrag={(pos) => updateCasePosition(c.id, pos)}
              onClick={() => setPeekCase(c)}
              onStringDragStart={() => setDraggingFrom(c.id)}
              onStringDrop={() => handleStringDrop(c.id)}
              isDraggingString={!!draggingFrom}
            />
          ))}
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-20 rounded-sm border border-border bg-[#0d0804]/90 px-3 py-1.5">
        <p className="font-mono text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</p>
      </div>

      {/* Case Peek Drawer */}
      <CasePeekDrawer
        caseData={peekCase}
        onClose={() => setPeekCase(null)}
        onOpenCase={(id) => router.push(`/bureau/case/${id}`)}
      />

      {/* New Tips Drawer */}
      <NewTipsDrawer open={tipsOpen} onClose={() => setTipsOpen(false)} />

      {/* Create Case Modal */}
      <CreateCaseModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
