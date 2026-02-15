'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Image, Video, Eye, EyeOff, BookOpen, Network, Plus, Sparkles } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'
import type { Case, Evidence, EvidenceConnection } from '@/lib/types'
import { EvidenceNetwork } from './evidence-network'
import { EvidenceDetail } from './evidence-detail'
import { StoryPanel } from './story-panel'
import { AddEvidenceModal } from './add-evidence-modal'
import { ForensicsLab } from './forensics-lab'

const statusColors: Record<string, string> = {
  'Investigating': 'text-[#A17120] border-[#A17120]/30 bg-[#A17120]/10',
  'Confirmed': 'text-[#6aad6e] border-[#4a7c4e]/30 bg-[#4a7c4e]/10',
  'Debunked': 'text-[#c45c5c] border-[#8b3a3a]/30 bg-[#8b3a3a]/10',
  'All-clear': 'text-[#5ca3c4] border-[#3a6b8b]/30 bg-[#3a6b8b]/10',
  'Closed': 'text-[#999] border-[#555]/30 bg-[#555]/10',
}

type Tab = 'network' | 'story' | 'forensics'

export function CaseWorkspace({ caseId }: { caseId: string }) {
  const { cases, evidence, evidenceConnections, updateCaseStatus } = useWolfTrace()
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [tab, setTab] = useState<Tab>('network')
  const [addOpen, setAddOpen] = useState(false)

  const caseData = cases.find(c => c.id === caseId)
  const caseEvidence = useMemo(() => evidence.filter(e => e.caseId === caseId), [evidence, caseId])
  const caseEvidenceIds = useMemo(() => new Set(caseEvidence.map(e => e.id)), [caseEvidence])
  const caseEvidenceConnections = useMemo(
    () => evidenceConnections.filter(c => caseEvidenceIds.has(c.fromId) && caseEvidenceIds.has(c.toId)),
    [evidenceConnections, caseEvidenceIds]
  )

  if (!caseData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-sans text-lg text-muted-foreground">Case not found</p>
          <Link href="/bureau/wall" className="mt-2 inline-block font-sans text-sm text-[#A17120] hover:underline">
            Return to Case Wall
          </Link>
        </div>
      </div>
    )
  }

  const reviewedCount = caseEvidence.filter(e => e.reviewed).length
  const totalCount = caseEvidence.length
  const verifiedCount = caseEvidence.filter(e => e.authenticity === 'verified').length
  const suspiciousCount = caseEvidence.filter(e => e.authenticity === 'suspicious').length

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="z-20 flex items-center gap-4 border-b border-border bg-[#0d0804]/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/bureau/wall"
          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-sans text-sm">Wall</span>
        </Link>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-3">
          <h1 className="font-sans text-base font-bold text-foreground">{caseData.codename}</h1>
          <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${statusColors[caseData.status] || ''}`}>
            {caseData.status}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Evidence stats */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-muted-foreground">
              <span className="text-foreground">{reviewedCount}</span>/{totalCount} reviewed
            </span>
            <span className="text-[#6aad6e]">{verifiedCount} verified</span>
            {suspiciousCount > 0 && (
              <span className="text-[#c45c5c]">{suspiciousCount} suspicious</span>
            )}
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Status change */}
          <select
            value={caseData.status}
            onChange={e => updateCaseStatus(caseId, e.target.value as Case['status'])}
            className="rounded-sm border border-border bg-card px-2 py-1 font-mono text-xs text-foreground focus:border-[#764608] focus:outline-none"
          >
            <option value="Investigating">Investigating</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Debunked">Debunked</option>
            <option value="All-clear">All-clear</option>
            <option value="Closed">Closed</option>
          </select>

          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-sm bg-[#A17120] px-3 py-1.5 font-sans text-xs font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Evidence
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border bg-[#0d0804]/80 px-4">
        <button
          onClick={() => setTab('network')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-sans text-sm transition-all ${
            tab === 'network'
              ? 'border-[#A17120] text-[#A17120]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Network className="h-4 w-4" />
          Evidence Network
        </button>
        <button
          onClick={() => setTab('story')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-sans text-sm transition-all ${
            tab === 'story'
              ? 'border-[#A17120] text-[#A17120]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Story View
        </button>
        <button
          onClick={() => setTab('forensics')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-sans text-sm transition-all ${
            tab === 'forensics'
              ? 'border-[#A17120] text-[#A17120]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Forensics Lab
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {tab === 'network' ? (
          <>
            <div className="flex-1 overflow-hidden">
              <EvidenceNetwork
                evidence={caseEvidence}
                connections={caseEvidenceConnections}
                selectedId={selectedEvidence?.id || null}
                onSelect={(ev) => setSelectedEvidence(ev)}
              />
            </div>
            {selectedEvidence && (
              <EvidenceDetail
                evidence={selectedEvidence}
                onClose={() => setSelectedEvidence(null)}
              />
            )}
          </>
        ) : tab === 'story' ? (
          <StoryPanel caseData={caseData} evidence={caseEvidence} />
        ) : (
          <ForensicsLab caseId={caseId} />
        )}
      </div>

      <AddEvidenceModal open={addOpen} onClose={() => setAddOpen(false)} caseId={caseId} />
    </div>
  )
}
