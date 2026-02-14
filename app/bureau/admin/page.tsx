'use client'

import { Shield, Users, FileText, AlertTriangle, BarChart3, Inbox, Clock, TrendingUp } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'

export default function AdminPage() {
  const { cases, evidence, tips, userRole } = useWolfTrace()

  if (userRole !== 'Admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-sans text-lg font-bold text-foreground">Access Restricted</p>
          <p className="mt-1 font-sans text-sm text-muted-foreground">Admin clearance required.</p>
        </div>
      </div>
    )
  }

  const activeCases = cases.filter(c => c.status === 'Investigating').length
  const unreviewedEvidence = evidence.filter(e => !e.reviewed).length
  const suspiciousEvidence = evidence.filter(e => e.authenticity === 'suspicious').length
  const pendingTips = tips.length

  const stats = [
    { label: 'Active Cases', value: activeCases, icon: FileText, color: 'text-[#A17120]', bg: 'bg-[#A17120]/10' },
    { label: 'Total Evidence', value: evidence.length, icon: BarChart3, color: 'text-[#6aad6e]', bg: 'bg-[#6aad6e]/10' },
    { label: 'Unreviewed', value: unreviewedEvidence, icon: AlertTriangle, color: 'text-[#c45c5c]', bg: 'bg-[#c45c5c]/10' },
    { label: 'Pending Tips', value: pendingTips, icon: Inbox, color: 'text-[#5ca3c4]', bg: 'bg-[#5ca3c4]/10' },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-[#0d0804]/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[#A17120]" />
          <h1 className="font-sans text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Bureau oversight and management.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-sm border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-sm ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground/30" />
                </div>
                <p className="mt-3 font-sans text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Case Status Breakdown */}
        <div className="mb-8">
          <h2 className="mb-4 font-sans text-base font-bold text-foreground">Case Status Breakdown</h2>
          <div className="rounded-sm border border-border bg-card">
            <div className="grid grid-cols-5 border-b border-border px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Count</span>
              <span className="col-span-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Distribution</span>
            </div>
            {(['Investigating', 'Confirmed', 'Debunked', 'All-clear', 'Closed'] as const).map(status => {
              const count = cases.filter(c => c.status === status).length
              const pct = cases.length > 0 ? (count / cases.length) * 100 : 0
              const colors: Record<string, string> = {
                'Investigating': 'bg-[#A17120]',
                'Confirmed': 'bg-[#6aad6e]',
                'Debunked': 'bg-[#c45c5c]',
                'All-clear': 'bg-[#5ca3c4]',
                'Closed': 'bg-[#555]',
              }
              return (
                <div key={status} className="grid grid-cols-5 items-center border-b border-border/50 px-4 py-3 last:border-0">
                  <span className="font-sans text-sm text-foreground">{status}</span>
                  <span className="font-mono text-sm text-foreground">{count}</span>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[status]} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground w-8">{Math.round(pct)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Suspicious Evidence */}
        <div>
          <h2 className="mb-4 font-sans text-base font-bold text-foreground">
            Flagged Evidence
            {suspiciousEvidence > 0 && (
              <span className="ml-2 rounded-sm bg-[#c45c5c]/10 px-2 py-0.5 font-mono text-xs text-[#c45c5c]">
                {suspiciousEvidence} suspicious
              </span>
            )}
          </h2>
          <div className="rounded-sm border border-border bg-card">
            {evidence.filter(e => e.authenticity === 'suspicious').length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="font-sans text-sm text-muted-foreground">No flagged evidence at this time.</p>
              </div>
            ) : (
              evidence.filter(e => e.authenticity === 'suspicious').map(ev => {
                const caseData = cases.find(c => c.id === ev.caseId)
                return (
                  <div key={ev.id} className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-0">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#c45c5c]" />
                    <div className="flex-1">
                      <p className="font-sans text-sm text-foreground">{ev.title}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {caseData?.codename || ev.caseId} &middot; {ev.source}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{ev.id}</span>
                      {ev.reviewed ? (
                        <span className="font-mono text-[10px] text-[#6aad6e]">Reviewed</span>
                      ) : (
                        <span className="font-mono text-[10px] text-[#c45c5c]">Unreviewed</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
