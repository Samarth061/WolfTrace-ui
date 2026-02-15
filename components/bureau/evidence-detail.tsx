'use client'

import { X, FileText, Image, Video, MapPin, User, Clock, CheckCircle, AlertTriangle, HelpCircle, Eye, Shield, Network, Link2, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useWolfTrace } from '@/lib/store'
import { shadowBureauAPI } from '@/lib/api-client'
import { ConnectEvidenceModal } from './connect-evidence-modal'
import type { Evidence, InferenceResult, RelationType } from '@/lib/types'

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
  const { markEvidenceReviewed, evidence: allEvidence, addEvidenceConnection, deleteEvidence, evidenceConnections } = useWolfTrace()
  const [inference, setInference] = useState<InferenceResult | null>(null)
  const [loadingInference, setLoadingInference] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const tc = typeConfig[evidence.type] || typeConfig.text
  const ac = authenticityConfig[evidence.authenticity] || authenticityConfig.unknown
  const TypeIcon = tc.icon
  const AuthIcon = ac.icon
  const timeAgo = formatDistanceToNow(new Date(evidence.timestamp), { addSuffix: true })

  // Get other evidence in the same case
  const caseEvidence = allEvidence.filter(e => e.caseId === evidence.caseId)

  const loadInference = async () => {
    setLoadingInference(true)
    try {
      const result = await shadowBureauAPI.getEvidenceInference(evidence.caseId, evidence.id)
      setInference(result)
    } catch (error) {
      console.error('Failed to load inference:', error)
    } finally {
      setLoadingInference(false)
    }
  }

  const handleConnect = async (targetId: string, relation: RelationType, notes: string) => {
    try {
      await shadowBureauAPI.createEvidenceConnection(evidence.caseId, evidence.id, targetId, relation)
      // Connection will be added via WebSocket, but we can also add it optimistically
      addEvidenceConnection({
        fromId: evidence.id,
        toId: targetId,
        relation,
        confidence: 1.0,
      })
    } catch (error) {
      console.error('Failed to create connection:', error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEvidence(evidence.id)
      onClose() // Close the panel after successful deletion
    } catch (error) {
      console.error('Failed to delete evidence:', error)
      alert('Failed to delete evidence. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Count connections for this evidence
  const connectionCount = evidenceConnections.filter(
    c => c.fromId === evidence.id || c.toId === evidence.id
  ).length

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

        {/* Confidence Score */}
        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-muted-foreground">CONFIDENCE</p>
            {evidence.reviewed && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-[#6aad6e]/30 bg-[#6aad6e]/10 px-2 py-0.5 font-mono text-[10px] text-[#6aad6e]">
                <Eye className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-sans text-3xl font-bold text-[#6aad6e]">
              {Math.round((evidence.confidence || 0) * 100)}%
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {evidence.reviewed
                ? 'Officer verified'
                : 'AI-generated score'}
            </span>
          </div>

          {/* Confidence bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#6aad6e] transition-all"
              style={{ width: `${(evidence.confidence || 0) * 100}%` }}
            />
          </div>
        </div>

        {/* Connect Evidence */}
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#6aad6e]/30 bg-[#6aad6e]/5 px-3 py-2 font-sans text-xs font-semibold text-[#6aad6e] transition-all hover:bg-[#6aad6e]/10"
        >
          <Link2 className="h-3.5 w-3.5" />
          Connect Evidence
        </button>

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

        {/* Semantic Role */}
        {evidence.semanticRole && (
          <div>
            <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Semantic Role</h4>
            <div className="flex items-center gap-2 rounded-sm border border-[#A17120]/20 bg-[#A17120]/5 px-3 py-2">
              <User className="h-3.5 w-3.5 text-[#A17120]" />
              <span className="font-sans text-xs font-semibold text-[#A17120]">{evidence.semanticRole}</span>
              {evidence.roleConfidence !== undefined && (
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {Math.round(evidence.roleConfidence * 100)}% confident
                </span>
              )}
            </div>
          </div>
        )}

        {/* Inference Reasoning */}
        <div>
          <button
            onClick={loadInference}
            disabled={loadingInference}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#6aad6e]/30 bg-[#6aad6e]/5 px-3 py-2 font-sans text-xs font-semibold text-[#6aad6e] transition-all hover:bg-[#6aad6e]/10 disabled:opacity-50"
          >
            <Network className="h-3.5 w-3.5" />
            {loadingInference ? 'Loading...' : inference ? 'Refresh Connections' : 'Show Connection Reasoning'}
          </button>

          {inference && inference.inferences.length > 0 && (
            <div className="mt-3 space-y-3">
              {/* Summary Card */}
              {inference.summary && (
                <div className="rounded-sm border border-[#764608]/20 bg-[#2a2010]/50 p-3">
                  <p className="mb-2 font-mono text-xs text-[#A17120]">CONNECTION SUMMARY</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">Total</p>
                      <p className="font-sans text-xl font-bold text-foreground">
                        {inference.summary.total_connections}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">Avg Confidence</p>
                      <p className="font-sans text-xl font-bold text-[#6aad6e]">
                        {Math.round(inference.summary.avg_confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  {Object.keys(inference.summary.connection_types || {}).length > 0 && (
                    <div className="mt-3 border-t border-[#764608]/20 pt-3">
                      <p className="mb-1.5 font-mono text-[10px] text-muted-foreground">Connection Types</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(inference.summary.connection_types).map(([type, count]) => (
                          <span key={type} className="inline-flex items-center gap-1 rounded-sm border border-[#764608]/30 bg-[#764608]/10 px-2 py-0.5 font-mono text-[10px] text-[#A17120]">
                            {type}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Inferences */}
              <div className="space-y-2">
                <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  CONNECTIONS ({inference.inferences.length})
                </h4>
                {inference.inferences.map((inf, i) => (
                <div key={i} className="rounded-sm border border-border bg-card p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="font-sans text-xs font-semibold text-foreground">{inf.target_title}</span>
                    <span className="flex-shrink-0 rounded-sm bg-[#6aad6e]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#6aad6e]">
                      {Math.round(inf.confidence * 100)}%
                    </span>
                  </div>
                  <p className="mb-2 font-sans text-[11px] leading-relaxed text-muted-foreground">{inf.reasoning}</p>

                  {(inf.components.temporal_score > 0 || inf.components.geo_score > 0 || inf.components.semantic_score > 0) && (
                    <div className="space-y-1 border-t border-border pt-2">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Score Breakdown</p>
                      {inf.components.temporal_score > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-muted-foreground">Temporal</span>
                          <span className="font-mono text-[10px] text-foreground">
                            {Math.round(inf.components.temporal_score * 100)}%
                          </span>
                        </div>
                      )}
                      {inf.components.geo_score > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-muted-foreground">Geographic</span>
                          <span className="font-mono text-[10px] text-foreground">
                            {Math.round(inf.components.geo_score * 100)}%
                          </span>
                        </div>
                      )}
                      {inf.components.semantic_score > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-muted-foreground">Semantic</span>
                          <span className="font-mono text-[10px] text-foreground">
                            {Math.round(inf.components.semantic_score * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          )}

          {inference && inference.inferences.length === 0 && (
            <div className="mt-3 rounded-sm border border-border bg-card px-3 py-2">
              <p className="font-sans text-xs italic text-muted-foreground">No AI connections found for this evidence.</p>
            </div>
          )}
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

        {/* Delete Evidence */}
        <div className="border-t border-border pt-4">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-sm border border-[#c45c5c]/30 bg-[#c45c5c]/10 px-4 py-2.5 font-sans text-sm font-semibold text-[#c45c5c] transition-colors hover:bg-[#c45c5c]/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete Evidence
            </button>
          ) : (
            <div className="rounded-sm border border-[#c45c5c]/30 bg-[#c45c5c]/5 p-3">
              <p className="mb-3 font-sans text-sm text-foreground">
                Delete this evidence?
              </p>
              <p className="mb-3 font-mono text-xs text-muted-foreground">
                This will permanently delete this evidence and {connectionCount} connection{connectionCount !== 1 ? 's' : ''}. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-sm border border-border bg-card px-3 py-1.5 font-sans text-xs text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-sm bg-[#c45c5c] px-3 py-1.5 font-sans text-xs font-semibold text-white transition-colors hover:bg-[#c45c5c]/90 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>

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

      {/* Connect Evidence Modal */}
      {showConnectModal && (
        <ConnectEvidenceModal
          sourceEvidence={evidence}
          availableEvidence={caseEvidence}
          onConnect={handleConnect}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </div>
  )
}
