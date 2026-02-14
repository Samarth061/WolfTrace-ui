'use client'

import { useState } from 'react'
import { Archive, Search, MapPin, Clock, FileText } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function ArchivePage() {
  const { cases, evidence } = useWolfTrace()
  const [search, setSearch] = useState('')
  const closedCases = cases.filter(c => c.status === 'Closed')

  const filtered = closedCases.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.codename.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-[#0d0804]/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-[#764608]" />
          <h1 className="font-sans text-xl font-bold text-foreground">Archive</h1>
          <span className="rounded-sm bg-[#764608]/10 px-2 py-0.5 font-mono text-xs text-[#764608]">
            {closedCases.length} closed
          </span>
        </div>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Closed cases preserved for reference.
        </p>

        <div className="relative mt-3 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search archive..."
            className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Archive className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="font-sans text-sm text-muted-foreground">
                {closedCases.length === 0 ? 'No archived cases yet.' : 'No cases match your search.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const caseEvidence = evidence.filter(e => e.caseId === c.id)
              return (
                <Link
                  key={c.id}
                  href={`/bureau/case/${c.id}`}
                  className="group flex items-center gap-4 rounded-sm border border-border bg-card p-4 transition-all hover:border-[#764608]/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sans text-sm font-bold text-foreground group-hover:text-[#A17120] transition-colors">
                      {c.codename}
                    </h3>
                    <p className="mt-0.5 font-sans text-xs text-muted-foreground line-clamp-1">{c.summary}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-muted-foreground">
                    <span className="flex items-center gap-1 font-sans text-[11px]">
                      <MapPin className="h-3 w-3" />
                      {c.location}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(c.lastUpdated), { addSuffix: true })}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    {caseEvidence.length} items
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
