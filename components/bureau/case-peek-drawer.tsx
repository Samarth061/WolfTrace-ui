'use client'

import { X, ExternalLink, Archive, FileText, Image, Video } from 'lucide-react'
import type { Case } from '@/lib/types'
import { useWolfTrace } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

interface CasePeekDrawerProps {
  caseData: Case | null
  onClose: () => void
  onOpenCase: (id: string) => void
}

const typeIcons = { text: FileText, image: Image, video: Video }

export function CasePeekDrawer({ caseData, onClose, onOpenCase }: CasePeekDrawerProps) {
  const { evidence } = useWolfTrace()

  if (!caseData) return null

  const caseEvidence = evidence.filter(e => e.caseId === caseData.id)
  const recentEvidence = caseEvidence.slice(0, 3)

  return (
    <div className="absolute right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-border bg-[#0d0804]/98 shadow-2xl backdrop-blur-sm animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-sans text-sm font-bold text-foreground">Case Peek</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="mb-1 font-sans text-lg font-bold text-foreground">{caseData.codename}</h2>
        <p className="mb-4 font-mono text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(caseData.lastUpdated), { addSuffix: true })} -- {caseData.location}
        </p>

        <p className="mb-6 font-sans text-sm leading-relaxed text-muted-foreground">
          {caseData.summary}
        </p>

        <div className="mb-6">
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evidence ({caseEvidence.length})
          </p>
          <div className="space-y-2">
            {recentEvidence.map(ev => {
              const Icon = typeIcons[ev.type]
              return (
                <div key={ev.id} className="flex items-center gap-3 rounded-sm border border-border bg-card/50 p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#A17120]/10">
                    <Icon className="h-4 w-4 text-[#A17120]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-xs font-medium text-foreground">{ev.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{ev.source}</p>
                  </div>
                </div>
              )
            })}
            {caseEvidence.length === 0 && (
              <p className="font-sans text-xs italic text-muted-foreground">No evidence yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-border px-4 py-3">
        <button
          onClick={() => onOpenCase(caseData.id)}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#A17120] px-3 py-2 font-sans text-sm font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Case
        </button>
        <button
          className="flex items-center justify-center rounded-sm border border-border px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
