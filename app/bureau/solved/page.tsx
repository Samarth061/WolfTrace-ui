'use client'

import { Trophy, MapPin, Clock, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const resolvedStatuses = ['Confirmed', 'Debunked', 'All-clear']

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  'Confirmed': { icon: CheckCircle, color: 'text-[#6aad6e]', bg: 'bg-[#6aad6e]/10 border-[#4a7c4e]/30', label: 'Confirmed' },
  'Debunked': { icon: XCircle, color: 'text-[#c45c5c]', bg: 'bg-[#8b3a3a]/10 border-[#8b3a3a]/30', label: 'Debunked' },
  'All-clear': { icon: ShieldCheck, color: 'text-[#5ca3c4]', bg: 'bg-[#3a6b8b]/10 border-[#3a6b8b]/30', label: 'All Clear' },
}

export default function SolvedWallPage() {
  const { cases, evidence } = useWolfTrace()
  const solvedCases = cases.filter(c => resolvedStatuses.includes(c.status))

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-[#0d0804]/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-[#A17120]" />
          <h1 className="font-sans text-xl font-bold text-foreground">Solved Wall</h1>
          <span className="rounded-sm bg-[#A17120]/10 px-2 py-0.5 font-mono text-xs text-[#A17120]">
            {solvedCases.length} resolved
          </span>
        </div>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Cases that have reached a definitive conclusion.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {solvedCases.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="font-sans text-sm text-muted-foreground">No cases resolved yet. Keep investigating.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {solvedCases.map(c => {
              const sc = statusConfig[c.status]
              if (!sc) return null
              const StatusIcon = sc.icon
              const caseEvidence = evidence.filter(e => e.caseId === c.id)

              return (
                <Link
                  key={c.id}
                  href={`/bureau/case/${c.id}`}
                  className="group rounded-sm border border-border bg-card p-5 transition-all hover:border-[#764608]/40 hover:shadow-lg"
                >
                  {/* Stamp */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {sc.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                  </div>

                  <h3 className="mb-2 font-sans text-base font-bold text-foreground transition-colors group-hover:text-[#A17120]">
                    {c.codename}
                  </h3>

                  <p className="mb-3 font-sans text-xs leading-relaxed text-muted-foreground line-clamp-3">
                    {c.summary}
                  </p>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1 font-sans text-[11px]">
                      <MapPin className="h-3 w-3" />
                      {c.location}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(c.lastUpdated), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="mt-3 border-t border-border pt-3">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {caseEvidence.length} evidence items &middot; {caseEvidence.filter(e => e.reviewed).length} reviewed
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
