'use client'

import { useState } from 'react'
import { X, MapPin, FileText } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'
import type { CaseStatus } from '@/lib/types'

interface CreateCaseModalProps {
  open: boolean
  onClose: () => void
}

export function CreateCaseModal({ open, onClose }: CreateCaseModalProps) {
  const { addCase, cases } = useWolfTrace()
  const [codename, setCodename] = useState('')
  const [location, setLocation] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState<CaseStatus>('Investigating')

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!codename.trim() || !location.trim()) return

    const newCase = {
      id: `case-${String(cases.length + 1).padStart(3, '0')}`,
      codename: codename.trim(),
      location: location.trim(),
      status,
      lastUpdated: new Date().toISOString(),
      position: { x: 200 + Math.random() * 400, y: 100 + Math.random() * 300 },
      hasHeat: status === 'Investigating',
      summary: summary.trim() || 'No summary provided.',
      evidenceCount: 0,
      storyText: '',
    }

    addCase(newCase)
    setCodename('')
    setLocation('')
    setSummary('')
    setStatus('Investigating')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-sm border border-border bg-[#0d0804] shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-sans text-lg font-bold text-foreground">Pin New Case</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Codename
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={codename}
                onChange={e => setCodename(e.target.value)}
                placeholder="The Silent Signal..."
                className="w-full rounded-sm border border-border bg-card py-2.5 pl-10 pr-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="North Campus..."
                className="w-full rounded-sm border border-border bg-card py-2.5 pl-10 pr-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Initial Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as CaseStatus)}
              className="w-full rounded-sm border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground focus:border-[#764608] focus:outline-none"
            >
              <option value="Investigating">Investigating</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Debunked">Debunked</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief case summary..."
              rows={3}
              className="w-full resize-none rounded-sm border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
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
              Pin to Wall
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
