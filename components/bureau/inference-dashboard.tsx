'use client'

import { useState } from 'react'
import { Evidence, Case } from '@/lib/types'

interface Props {
  evidence: Evidence[]
  currentCase: Case | null
  selectedEvidenceId: string | null
  onSelectEvidence: (id: string) => void
}

export function InferenceDashboard({ evidence, currentCase, selectedEvidenceId, onSelectEvidence }: Props) {
  const [view, setView] = useState<'per-evidence' | 'case-synthesis'>('per-evidence')

  const selectedEvidence = evidence.find(e => e.id === selectedEvidenceId)

  return (
    <div className="flex h-full flex-col overflow-hidden border border-border bg-[#0d0804]">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-mono text-sm uppercase tracking-wider text-[#C4A265]">
          AI Inference Dashboard
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('per-evidence')}
            className={`rounded-sm px-3 py-1.5 font-mono text-xs ${
              view === 'per-evidence'
                ? 'bg-[#A17120]/20 text-[#A17120] border border-[#A17120]'
                : 'bg-transparent text-muted-foreground border border-border hover:bg-white/5'
            }`}
          >
            Evidence Analysis
          </button>
          <button
            onClick={() => setView('case-synthesis')}
            className={`rounded-sm px-3 py-1.5 font-mono text-xs ${
              view === 'case-synthesis'
                ? 'bg-[#A17120]/20 text-[#A17120] border border-[#A17120]'
                : 'bg-transparent text-muted-foreground border border-border hover:bg-white/5'
            }`}
          >
            Case Synthesis
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === 'per-evidence' ? (
          selectedEvidence ? (
            <EvidenceInferencePanel evidence={selectedEvidence} allEvidence={evidence} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="font-mono text-xs text-muted-foreground">
                Select an evidence node to view AI analysis
              </p>
            </div>
          )
        ) : (
          <CaseSynthesisPanel currentCase={currentCase} evidence={evidence} />
        )}
      </div>
    </div>
  )
}

// ===== Evidence Inference Panel =====

interface EvidenceInferencePanelProps {
  evidence: Evidence
  allEvidence: Evidence[]
}

function EvidenceInferencePanel({ evidence, allEvidence }: EvidenceInferencePanelProps) {
  const backendData = (evidence as any).backendData || {}

  return (
    <div className="space-y-6">
      {/* Node Type & Semantic Role */}
      <div className="flex items-center gap-3">
        <span className="rounded-sm border border-border bg-[#1a1510] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#C4A265]">
          {evidence.type}
        </span>
        {backendData.semantic_role && (
          <SemanticRoleBadge role={backendData.semantic_role} />
        )}
      </div>

      {/* Extracted Claims (for REPORT nodes) */}
      {Array.isArray(backendData.claims) && backendData.claims.length > 0 && (
        <InferenceSection title="Extracted Claims" icon="📝">
          <div className="space-y-3">
            {backendData.claims.map((claim: any, idx: number) => (
              <ClaimCard key={idx} claim={claim} />
            ))}
          </div>
        </InferenceSection>
      )}

      {/* Misinformation Flags */}
      {Array.isArray(backendData.misinformation_flags) && backendData.misinformation_flags.length > 0 && (
        <InferenceSection title="Misinformation Patterns Detected" icon="⚠️" variant="warning">
          <ul className="space-y-2">
            {backendData.misinformation_flags.map((flag: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#c45c5c]">•</span>
                <span className="font-mono text-xs text-[#c45c5c]">{flag}</span>
              </li>
            ))}
          </ul>
        </InferenceSection>
      )}

      {/* Urgency Assessment */}
      {backendData.urgency && (
        <InferenceSection title="Urgency Assessment" icon="🚨">
          <UrgencyIndicator level={backendData.urgency} />
        </InferenceSection>
      )}

      {/* Suggested Verifications */}
      {Array.isArray(backendData.suggested_verifications) && backendData.suggested_verifications.length > 0 && (
        <InferenceSection title="Suggested Verification Steps" icon="✓">
          <ol className="space-y-2 pl-4">
            {backendData.suggested_verifications.map((step: string, idx: number) => (
              <li key={idx} className="font-mono text-xs text-foreground">{idx + 1}. {step}</li>
            ))}
          </ol>
        </InferenceSection>
      )}

      {/* Fact Check Results (for FACT_CHECK nodes) */}
      {backendData.claim_text && (
        <InferenceSection title="Fact Check Result" icon="🔍">
          <FactCheckCard data={backendData} />
        </InferenceSection>
      )}

      {/* Forensics Analysis (for MEDIA_VARIANT nodes) */}
      {backendData.phash && (
        <InferenceSection title="Media Forensics" icon="🔬">
          <ForensicsCard data={backendData} allEvidence={allEvidence} />
        </InferenceSection>
      )}

      {/* External Source Status (for EXTERNAL_SOURCE nodes) */}
      {backendData.search_query && (
        <InferenceSection title="External Source Search" icon="🌐">
          <ExternalSourceCard data={backendData} />
        </InferenceSection>
      )}

      {/* Case-Level Inferences (if available on this node) */}
      {backendData.case_narrative && (
        <InferenceSection title="Case Context" icon="📊">
          <div className="space-y-3">
            <div>
              <h4 className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Narrative</h4>
              <p className="font-mono text-xs text-foreground">{backendData.case_narrative}</p>
            </div>
            {backendData.confidence_score !== undefined && (
              <div>
                <h4 className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Confidence</h4>
                <ConfidenceBar score={backendData.confidence_score} />
              </div>
            )}
          </div>
        </InferenceSection>
      )}
    </div>
  )
}

// ===== UI Components =====

function InferenceSection({
  title,
  icon,
  variant = 'default',
  children
}: {
  title: string
  icon: string
  variant?: 'default' | 'warning' | 'success'
  children: React.ReactNode
}) {
  const borderColor = {
    default: 'border-border',
    warning: 'border-[#c45c5c]/50',
    success: 'border-[#6aad6e]/50'
  }[variant]

  return (
    <div className={`rounded-sm border ${borderColor} bg-[#1a1510]/50 p-4`}>
      <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#C4A265]">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  )
}

function ClaimCard({ claim }: { claim: any }) {
  const statement = typeof claim === 'string' ? claim : claim.statement || claim.text
  const confidence = claim.confidence || 0
  const category = claim.category || 'other'

  const categoryColors: Record<string, string> = {
    threat: 'text-[#c45c5c] border-[#c45c5c]',
    property: 'text-[#A17120] border-[#A17120]',
    medical: 'text-[#6aad6e] border-[#6aad6e]',
    environmental: 'text-[#6495ED] border-[#6495ED]',
    rumor: 'text-[#c45c5c] border-[#c45c5c]',
    other: 'text-muted-foreground border-border'
  }

  return (
    <div className="rounded-sm border border-border bg-[#0d0804] p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="flex-1 font-mono text-xs text-foreground">{statement}</p>
        <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase ${categoryColors[category]}`}>
          {category}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">Confidence:</span>
        <div className="flex-1">
          <ConfidenceBar score={confidence} />
        </div>
        <span className="font-mono text-[10px] text-[#C4A265]">{Math.round(confidence * 100)}%</span>
      </div>
    </div>
  )
}

function ConfidenceBar({ score }: { score: number }) {
  const percentage = Math.round(score * 100)
  const color = score >= 0.7 ? '#6aad6e' : score >= 0.4 ? '#A17120' : '#c45c5c'

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#0d0804]">
      <div
        className="h-full transition-all duration-300"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  )
}

function SemanticRoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { color: string; label: string }> = {
    originator: { color: 'border-[#c45c5c] text-[#c45c5c] bg-[#c45c5c]/10', label: '🎯 Originator' },
    amplifier: { color: 'border-[#A17120] text-[#A17120] bg-[#A17120]/10', label: '📢 Amplifier' },
    mutator: { color: 'border-[#6495ED] text-[#6495ED] bg-[#6495ED]/10', label: '🔄 Mutator' },
    unwitting_sharer: { color: 'border-muted-foreground text-muted-foreground bg-white/5', label: '👤 Unwitting Sharer' }
  }

  const config = roleConfig[role] || roleConfig.unwitting_sharer

  return (
    <span className={`rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${config.color}`}>
      {config.label}
    </span>
  )
}

function UrgencyIndicator({ level }: { level: string }) {
  const urgencyConfig: Record<string, { color: string; bgColor: string }> = {
    critical: { color: 'text-[#c45c5c]', bgColor: 'bg-[#c45c5c]' },
    high: { color: 'text-[#A17120]', bgColor: 'bg-[#A17120]' },
    medium: { color: 'text-[#6495ED]', bgColor: 'bg-[#6495ED]' },
    low: { color: 'text-[#6aad6e]', bgColor: 'bg-[#6aad6e]' }
  }

  const config = urgencyConfig[level] || urgencyConfig.medium

  return (
    <div className="flex items-center gap-3">
      <span className={`font-mono text-sm font-semibold uppercase ${config.color}`}>{level}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(bar => (
          <div
            key={bar}
            className={`h-6 w-2 rounded-sm ${
              bar <= ['low', 'medium', 'high', 'critical'].indexOf(level) + 1
                ? config.bgColor
                : 'bg-[#0d0804]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function FactCheckCard({ data }: { data: any }) {
  const ratingColors: Record<string, string> = {
    'True': 'border-[#6aad6e] bg-[#6aad6e]/10 text-[#6aad6e]',
    'Partially True': 'border-[#6495ED] bg-[#6495ED]/10 text-[#6495ED]',
    'False': 'border-[#c45c5c] bg-[#c45c5c]/10 text-[#c45c5c]',
    'Unverified': 'border-[#A17120] bg-[#A17120]/10 text-[#A17120]'
  }

  const ratingClass = ratingColors[data.rating] || ratingColors['Unverified']

  return (
    <div className="space-y-3">
      <div>
        <h4 className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Claim</h4>
        <p className="font-mono text-xs text-foreground">{data.claim_text}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-sm border px-3 py-1.5 font-mono text-xs font-semibold ${ratingClass}`}>
          {data.rating}
        </span>
        {data.reviewer && (
          <span className="font-mono text-xs text-muted-foreground">by {data.reviewer}</span>
        )}
      </div>
      {data.reasoning && (
        <div>
          <h4 className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Reasoning</h4>
          <p className="font-mono text-xs text-foreground">{data.reasoning}</p>
        </div>
      )}
      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-[#6495ED] hover:underline"
        >
          View Source ↗
        </a>
      )}
    </div>
  )
}

function ForensicsCard({ data, allEvidence }: { data: any; allEvidence: Evidence[] }) {
  return (
    <div className="space-y-3">
      {/* Perceptual Hash */}
      <div>
        <h4 className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">pHash</h4>
        <code className="font-mono text-xs text-[#C4A265]">{data.phash}</code>
      </div>

      {/* ELA Analysis */}
      {data.ela_available && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#6aad6e]" />
          <span className="font-mono text-xs text-[#6aad6e]">Error Level Analysis available</span>
        </div>
      )}

      {/* EXIF Metadata */}
      {data.exif && Object.keys(data.exif).length > 0 && (
        <div>
          <h4 className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">EXIF Metadata</h4>
          <div className="space-y-1 rounded-sm border border-border bg-[#0d0804] p-2">
            {Object.entries(data.exif).slice(0, 5).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{key}:</span>
                <span className="font-mono text-[10px] text-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Images */}
      {Array.isArray(data.hamming_distances) && data.hamming_distances.length > 0 && (
        <div>
          <h4 className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
            Similar Images ({data.hamming_distances.length})
          </h4>
          <div className="space-y-2">
            {data.hamming_distances.slice(0, 3).map((sim: any, idx: number) => {
              const similarEvidence = allEvidence.find(e => e.id === sim.node_id)
              return (
                <div key={idx} className="flex items-center justify-between rounded-sm border border-border bg-[#0d0804] p-2">
                  <span className="font-mono text-xs text-foreground">
                    {similarEvidence?.title || sim.node_id}
                  </span>
                  <span className="font-mono text-[10px] text-[#C4A265]">
                    Distance: {sim.distance}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div>
          <h4 className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Analysis Summary</h4>
          <p className="font-mono text-xs text-foreground">{data.summary}</p>
        </div>
      )}
    </div>
  )
}

function ExternalSourceCard({ data }: { data: any }) {
  const statusColors: Record<string, string> = {
    complete: 'text-[#6aad6e] bg-[#6aad6e]',
    pending: 'text-[#A17120] bg-[#A17120]',
    failed: 'text-[#c45c5c] bg-[#c45c5c]'
  }

  const statusColor = statusColors[data.status] || statusColors.pending

  return (
    <div className="space-y-3">
      <div>
        <h4 className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Query</h4>
        <p className="font-mono text-xs text-foreground">{data.search_query}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusColor}`} />
          <span className="font-mono text-xs text-muted-foreground capitalize">{data.status}</span>
        </div>
        {data.platform && (
          <span className="font-mono text-xs text-muted-foreground">Platform: {data.platform}</span>
        )}
      </div>
      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-[#6495ED] hover:underline"
        >
          View Results ↗
        </a>
      )}
    </div>
  )
}

// ===== Case Synthesis Panel =====

interface CaseSynthesisPanelProps {
  currentCase: Case | null
  evidence: Evidence[]
}

function CaseSynthesisPanel({ currentCase, evidence }: CaseSynthesisPanelProps) {
  if (!currentCase) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs text-muted-foreground">No case selected</p>
      </div>
    )
  }

  // Find evidence with case-level synthesis data
  const synthesisNode = evidence.find(e => {
    const data = (e as any).backendData || {}
    return data.case_narrative || data.origin_analysis
  })

  const synthesisData = synthesisNode ? (synthesisNode as any).backendData : {}

  return (
    <div className="space-y-6">
      {/* Case Overview */}
      <InferenceSection title="Case Overview" icon="📋">
        <div className="space-y-2">
          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Case ID:</span>
            <span className="ml-2 font-mono text-xs text-[#C4A265]">{currentCase.id}</span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Status:</span>
            <span className={`ml-2 rounded-sm border px-2 py-0.5 font-mono text-[9px] uppercase ${
              currentCase.status === 'Investigating' ? 'border-[#A17120] text-[#A17120]' :
              currentCase.status === 'Confirmed' ? 'border-[#6aad6e] text-[#6aad6e]' :
              'border-border text-muted-foreground'
            }`}>
              {currentCase.status}
            </span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Evidence Nodes:</span>
            <span className="ml-2 font-mono text-xs text-foreground">{evidence.length}</span>
          </div>
        </div>
      </InferenceSection>

      {/* Case Narrative */}
      {synthesisData.case_narrative && (
        <InferenceSection title="AI Case Narrative" icon="📖">
          <p className="font-mono text-sm leading-relaxed text-foreground">{synthesisData.case_narrative}</p>
        </InferenceSection>
      )}

      {/* Origin Analysis */}
      {synthesisData.origin_analysis && (
        <InferenceSection title="Origin Analysis" icon="🔍">
          <p className="font-mono text-xs text-foreground">{synthesisData.origin_analysis}</p>
        </InferenceSection>
      )}

      {/* Spread Map */}
      {synthesisData.spread_map && (
        <InferenceSection title="Information Spread Pattern" icon="🌊">
          <div className="rounded-sm border border-border bg-[#0d0804] p-3 font-mono text-xs text-foreground">
            {synthesisData.spread_map}
          </div>
        </InferenceSection>
      )}

      {/* Overall Confidence */}
      {synthesisData.confidence_score !== undefined && (
        <InferenceSection title="Overall Case Confidence" icon="📊">
          <div className="space-y-2">
            <ConfidenceBar score={synthesisData.confidence_score} />
            <p className="font-mono text-xs text-muted-foreground">
              AI confidence in case analysis: {Math.round(synthesisData.confidence_score * 100)}%
            </p>
          </div>
        </InferenceSection>
      )}

      {/* Recommended Action */}
      {synthesisData.recommended_action && (
        <InferenceSection title="Recommended Action" icon="✅" variant="success">
          <p className="font-mono text-xs text-foreground">{synthesisData.recommended_action}</p>
        </InferenceSection>
      )}

      {/* Evidence Distribution by Type */}
      <InferenceSection title="Evidence Distribution" icon="📊">
        <EvidenceDistributionChart evidence={evidence} />
      </InferenceSection>

      {/* Semantic Roles Distribution */}
      <InferenceSection title="Semantic Role Distribution" icon="🎭">
        <SemanticRoleDistribution evidence={evidence} />
      </InferenceSection>
    </div>
  )
}

function EvidenceDistributionChart({ evidence }: { evidence: Evidence[] }) {
  const typeCounts = evidence.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = evidence.length

  return (
    <div className="space-y-2">
      {Object.entries(typeCounts).map(([type, count]) => (
        <div key={type} className="space-y-1">
          <div className="flex justify-between">
            <span className="font-mono text-xs capitalize text-foreground">{type.replace('_', ' ')}</span>
            <span className="font-mono text-xs text-muted-foreground">{count} ({Math.round(count / total * 100)}%)</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#0d0804]">
            <div
              className="h-full bg-[#A17120]"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function SemanticRoleDistribution({ evidence }: { evidence: Evidence[] }) {
  const roleCounts = evidence.reduce((acc, e) => {
    const role = ((e as any).backendData?.semantic_role) || 'unknown'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const roleColors: Record<string, string> = {
    originator: '#c45c5c',
    amplifier: '#A17120',
    mutator: '#6495ED',
    unwitting_sharer: '#666',
    unknown: '#333'
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(roleCounts).map(([role, count]) => (
        <div
          key={role}
          className="rounded-sm border border-border bg-[#0d0804] p-3 text-center"
          style={{ borderColor: roleColors[role] }}
        >
          <div className="mb-1 font-mono text-lg font-semibold" style={{ color: roleColors[role] }}>
            {count}
          </div>
          <div className="font-mono text-[10px] capitalize text-muted-foreground">
            {role.replace('_', ' ')}
          </div>
        </div>
      ))}
    </div>
  )
}
