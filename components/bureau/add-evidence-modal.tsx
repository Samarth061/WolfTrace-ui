'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'
import type { Authenticity } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  caseId: string
}

export function AddEvidenceModal({ open, onClose, caseId }: Props) {
  const { addEvidence, evidence } = useWolfTrace()
  const [title, setTitle] = useState('')
  const [keyPoints, setKeyPoints] = useState('')
  const [entities, setEntities] = useState('')
  const [locations, setLocations] = useState('')

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const newEvidence = {
      id: `ev-${String(evidence.length + 1).padStart(3, '0')}`,
      caseId,
      type: 'text' as const,
      title: title.trim(),
      authenticity: 'unknown' as Authenticity,
      extractedEntities: entities.split(',').map(s => s.trim()).filter(Boolean),
      extractedLocations: locations.split(',').map(s => s.trim()).filter(Boolean),
      keyPoints: keyPoints.split('\n').map(s => s.trim()).filter(Boolean),
      source: 'Investigator' as const,
      timestamp: new Date().toISOString(),
      reviewed: false,
      notes: [],
      authenticitySignals: [],
    }

    addEvidence(newEvidence)
    setTitle('')
    setKeyPoints('')
    setEntities('')
    setLocations('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-sm border border-border bg-[#0d0804] shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-sans text-lg font-bold text-foreground">Add Text Evidence</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Evidence title..."
              className="w-full rounded-sm border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Key Points <span className="normal-case text-muted-foreground/60">(one per line)</span>
            </label>
            <textarea
              value={keyPoints}
              onChange={e => setKeyPoints(e.target.value)}
              placeholder={"Observed at 11 PM\nDuration: 5 minutes"}
              rows={3}
              className="w-full resize-none rounded-sm border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Entities <span className="normal-case text-muted-foreground/60">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={entities}
              onChange={e => setEntities(e.target.value)}
              placeholder="J. Harper, Security, Device X"
              className="w-full rounded-sm border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Locations <span className="normal-case text-muted-foreground/60">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={locations}
              onChange={e => setLocations(e.target.value)}
              placeholder="Bell Tower, North Campus"
              className="w-full rounded-sm border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-sm border border-border px-4 py-2.5 font-sans text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-sm bg-[#A17120] px-4 py-2.5 font-sans text-sm font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90"
            >
              Add to Case
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
