'use client'

import { X, Link2 } from 'lucide-react'
import { useState } from 'react'
import type { Evidence, RelationType } from '@/lib/types'

interface ConnectEvidenceModalProps {
  sourceEvidence: Evidence
  availableEvidence: Evidence[]
  onConnect: (targetId: string, relation: RelationType, notes: string) => void
  onClose: () => void
}

const relationConfig: Record<RelationType, { label: string; description: string; color: string }> = {
  'supports': {
    label: 'Supports',
    description: 'This evidence supports or corroborates the other',
    color: 'text-[#6aad6e]',
  },
  'contradicts': {
    label: 'Contradicts',
    description: 'This evidence contradicts or conflicts with the other',
    color: 'text-[#c45c5c]',
  },
  'related': {
    label: 'Related',
    description: 'This evidence is related but neither supports nor contradicts',
    color: 'text-[#A17120]',
  },
}

export function ConnectEvidenceModal({
  sourceEvidence,
  availableEvidence,
  onConnect,
  onClose,
}: ConnectEvidenceModalProps) {
  const [targetId, setTargetId] = useState<string>('')
  const [relation, setRelation] = useState<RelationType>('related')
  const [notes, setNotes] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetId) return

    onConnect(targetId, relation, notes)
    onClose()
  }

  const selectedTarget = availableEvidence.find(e => e.id === targetId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-2xl rounded-sm border border-border bg-[#0d0804] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-[#A17120]" />
            <h2 className="font-sans text-lg font-bold text-foreground">Connect Evidence</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Source Evidence */}
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              From (Source)
            </label>
            <div className="rounded-sm border border-border bg-card px-4 py-3">
              <p className="font-sans text-sm font-semibold text-foreground">{sourceEvidence.title}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">{sourceEvidence.id}</p>
            </div>
          </div>

          {/* Target Evidence Selection */}
          <div className="mb-6">
            <label htmlFor="target" className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              To (Target) *
            </label>
            <select
              id="target"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-sm border border-border bg-card px-4 py-3 font-sans text-sm text-foreground transition-colors focus:border-[#A17120] focus:outline-none focus:ring-1 focus:ring-[#A17120]"
              required
            >
              <option value="">Select evidence to connect...</option>
              {availableEvidence
                .filter(e => e.id !== sourceEvidence.id)
                .map(evidence => (
                  <option key={evidence.id} value={evidence.id}>
                    {evidence.title} ({evidence.id})
                  </option>
                ))}
            </select>
            {selectedTarget && (
              <div className="mt-2 rounded-sm border border-border bg-card px-3 py-2">
                <p className="font-sans text-xs text-muted-foreground">
                  {selectedTarget.type} • {selectedTarget.source} • {selectedTarget.timestamp}
                </p>
              </div>
            )}
          </div>

          {/* Connection Type */}
          <div className="mb-6">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Connection Type *
            </label>
            <div className="space-y-2">
              {(Object.keys(relationConfig) as RelationType[]).map((relationType) => {
                const config = relationConfig[relationType]
                return (
                  <label
                    key={relationType}
                    className={`flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3 transition-all ${
                      relation === relationType
                        ? 'border-[#A17120] bg-[#A17120]/5'
                        : 'border-border bg-card hover:border-[#A17120]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="relation"
                      value={relationType}
                      checked={relation === relationType}
                      onChange={(e) => setRelation(e.target.value as RelationType)}
                      className="mt-1 h-4 w-4 border-border text-[#A17120] focus:ring-[#A17120]"
                    />
                    <div className="flex-1">
                      <p className={`font-sans text-sm font-semibold ${config.color}`}>
                        {config.label}
                      </p>
                      <p className="mt-0.5 font-sans text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why are you connecting these pieces of evidence?"
              rows={3}
              className="w-full rounded-sm border border-border bg-card px-4 py-3 font-sans text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-[#A17120] focus:outline-none focus:ring-1 focus:ring-[#A17120]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-border bg-card px-4 py-2 font-sans text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetId}
              className="flex items-center gap-2 rounded-sm border border-[#A17120]/30 bg-[#A17120] px-4 py-2 font-sans text-sm font-semibold text-white transition-all hover:bg-[#A17120]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Link2 className="h-4 w-4" />
              Create Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
