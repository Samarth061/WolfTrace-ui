'use client'

import { X, FileText, Image, Video, MapPin, User, Clock, CheckCircle, AlertTriangle, HelpCircle, Eye, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useWolfTrace } from '@/lib/store'
import type { Evidence } from '@/lib/types'

const typeConfig: Record<string, { icon: typeof FileText; label: string }> = {
  text: { icon: FileText, label: 'Document' },
  image: { icon: Image, label: 'Image' },
  video: { icon: Video, label: 'Video' },
}

const authenticityConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string; bg: string }> = {
  verified: { icon: CheckCircle, label: 'Verified', color: 'text-[#6aad6e]', bg: 'bg-[#6aad6e]/10' },
  suspicious: { icon: AlertTriangle, label: 'Suspicious', color: 'text-[#c45c5c]', bg: 'bg-[#c45c5c]/10' },
  unknown: { icon: HelpCircle, label: 'Unknown', color: 'text-[#A17120]', bg: 'bg-[#A17120]/10' },
}

export function EvidenceDetail({ evidence, onClose }: { evidence: Evidence; onClose: () => void }) {
  const { markEvidenceReviewed } = useWolfTrace()
  const tc = typeConfig[evidence.type] || typeConfig.text
  const ac = authenticityConfig[evidence.authenticity] || authenticityConfig.unknown
  const TypeIcon = tc.icon
  const AuthIcon = ac.icon
  const timeAgo = formatDistanceToNow(new Date(evidence.timestamp), { addSuffix: true })

  return (
    <div className="flex w-96 flex-col border-l border-border bg-[#0d0804] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-sm ${ac.bg}`}>
            <TypeIcon className={`h-4 w-4 ${ac.color}`} />
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-foreground leading-tight">{evidence.title}</h3>
            <p className="font-mono text-[10px] text-muted-foreground">{evidence.id}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 p-4">
        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[10px] ${ac.color} ${ac.bg} border-current/20`}>
            <AuthIcon className="h-3 w-3" />
            {ac.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            <TypeIcon className="h-3 w-3" />
            {tc.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            <User className="h-3 w-3" />
            {evidence.source}
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>

        {/* Review status */}
        {!evidence.reviewed && (
          <button
            onClick={() => markEvidenceReviewed(evidence.id)}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#A17120]/30 bg-[#A17120]/5 px-3 py-2 font-sans text-xs font-semibold text-[#A17120] transition-all hover:bg-[#A17120]/10"
          >
            <Eye className="h-3.5 w-3.5" />
            Mark as Reviewed
          </button>
        )}
        {evidence.reviewed && (
          <div className="flex items-center gap-2 rounded-sm border border-[#4a7c4e]/20 bg-[#4a7c4e]/5 px-3 py-2">
            <CheckCircle className="h-3.5 w-3.5 text-[#6aad6e]" />
            <span className="font-sans text-xs text-[#6aad6e]">Reviewed</span>
          </div>
        )}

        {/* Key Points */}
        <div>
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Key Points</h4>
          <ul className="space-y-1.5">
            {evidence.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#A17120]" />
                <span className="font-sans text-xs leading-relaxed text-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Extracted Entities */}
        {evidence.extractedEntities.length > 0 && (
          <div>
            <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Entities</h4>
            <div className="flex flex-wrap gap-1.5">
              {evidence.extractedEntities.map((entity, i) => (
                <span key={i} className="rounded-sm border border-[#764608]/30 bg-[#764608]/10 px-2 py-0.5 font-mono text-[10px] text-[#A17120]">
                  {entity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Locations */}
        {evidence.extractedLocations.length > 0 && (
          <div>
            <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Locations</h4>
            <div className="flex flex-wrap gap-1.5">
              {evidence.extractedLocations.map((loc, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Authenticity Signals */}
        {evidence.authenticitySignals && evidence.authenticitySignals.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <Shield className="h-3 w-3" />
              Authenticity Signals
            </h4>
            <ul className="space-y-1">
              {evidence.authenticitySignals.map((signal, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-1.5 h-1 w-1 flex-shrink-0 rounded-full ${
                    evidence.authenticity === 'verified' ? 'bg-[#6aad6e]' :
                    evidence.authenticity === 'suspicious' ? 'bg-[#c45c5c]' : 'bg-[#A17120]'
                  }`} />
                  <span className="font-sans text-[11px] leading-relaxed text-muted-foreground">{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Video Extract */}
        {evidence.videoExtract && (
          <div>
            <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Video Transcript
            </h4>
            <div className="rounded-sm border border-border bg-card p-3">
              <p className="mb-2 font-mono text-[10px] text-muted-foreground">
                Duration: {evidence.videoExtract.duration}
              </p>
              <p className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/80">
                {evidence.videoExtract.transcript}
              </p>
              {evidence.videoExtract.keyMoments.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="mb-1.5 font-mono text-[10px] text-muted-foreground">Key Moments:</p>
                  {evidence.videoExtract.keyMoments.map((km, i) => (
                    <div key={i} className="flex items-start gap-2 py-1">
                      <span className="flex-shrink-0 rounded-sm bg-[#A17120]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#A17120]">
                        {km.time}
                      </span>
                      <span className="font-sans text-[11px] text-foreground/80">{km.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {evidence.notes.length > 0 && (
          <div>
            <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Notes</h4>
            <ul className="space-y-1">
              {evidence.notes.map((note, i) => (
                <li key={i} className="rounded-sm border border-border bg-card px-3 py-2 font-sans text-[11px] italic text-foreground/70">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
