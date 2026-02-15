/**
 * Shadow Bureau Backend API Client
 * Integrates WolfTrace frontend with Shadow Bureau FastAPI backend
 */

import type { Case, Evidence, EvidenceConnection, Tip } from './types'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

// ============================================================================
// Type Mappings: Backend ↔ Frontend
// ============================================================================

/**
 * Maps backend case from Neo4j/in-memory graph to frontend Case type
 */
export function mapBackendCase(backendCase: any): Case {
  return {
    id: backendCase.case_id || backendCase.id,
    codename: backendCase.label || backendCase.case_id || backendCase.id,
    location: extractLocation(backendCase),
    status: mapStatus(backendCase.status),
    lastUpdated: backendCase.updated_at || new Date().toISOString(),
    position: { x: Math.random() * 1000, y: Math.random() * 500 }, // Random position for corkboard
    hasHeat: checkHasHeat(backendCase),
    summary: backendCase.summary || extractSummary(backendCase),
    evidenceCount: backendCase.node_count || 0,
    storyText: backendCase.story || generateStory(backendCase),
  }
}

/**
 * Maps backend evidence/nodes to frontend Evidence type
 */
export function mapBackendEvidence(backendNode: any, caseId: string): Evidence {
  const data = backendNode.data || {}

  return {
    id: backendNode.id,
    caseId,
    type: mapEvidenceType(backendNode.node_type),
    title: data.text_body?.substring(0, 50) || backendNode.id,
    contentUrl: data.media_url,
    authenticity: mapAuthenticity(data),
    extractedEntities: data.claims?.map((c: any) => c.text) || [],
    extractedLocations: data.location ? [data.location.building || 'Unknown'] : [],
    keyPoints: data.claims?.map((c: any) => c.text) || [],
    source: backendNode.node_type === 'report' ? 'Public Tip' : 'Investigator',
    timestamp: data.timestamp || backendNode.created_at || new Date().toISOString(),
    reviewed: data.reviewed || false,
    notes: [],
    authenticitySignals: data.fact_check_results?.map((r: any) => r.claim_review) || [],
  }
}

/**
 * Maps backend edges to frontend EvidenceConnection
 */
export function mapBackendEdge(backendEdge: any): EvidenceConnection {
  return {
    fromId: backendEdge.source_id || backendEdge.source,
    toId: backendEdge.target_id || backendEdge.target,
    relation: mapRelationType(backendEdge.edge_type || backendEdge.type),
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractLocation(backendCase: any): string {
  if (backendCase.location) return backendCase.location

  // Try to extract from first report
  const nodes = backendCase.nodes || []
  const firstReport = nodes.find((n: any) => n.node_type === 'report')
  if (firstReport?.data?.location?.building) {
    return firstReport.data.location.building
  }

  return 'Unknown Location'
}

function mapStatus(backendStatus?: string): Case['status'] {
  const statusMap: Record<string, Case['status']> = {
    'pending': 'Investigating',
    'processing': 'Investigating',
    'active': 'Investigating',
    'verified': 'Confirmed',
    'debunked': 'Debunked',
    'resolved': 'All-clear',
    'closed': 'Closed',
  }

  return statusMap[backendStatus?.toLowerCase() || 'pending'] || 'Investigating'
}

function checkHasHeat(backendCase: any): boolean {
  // Has heat if updated recently (within 30 minutes)
  const lastUpdated = new Date(backendCase.updated_at || backendCase.lastUpdated || 0)
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000)
  return lastUpdated > thirtyMinsAgo
}

function extractSummary(backendCase: any): string {
  const nodes = backendCase.nodes || []
  const reports = nodes.filter((n: any) => n.node_type === 'report')

  if (reports.length === 0) return 'No reports available'

  const firstReport = reports[0].data?.text_body || ''
  return firstReport.substring(0, 200) + (firstReport.length > 200 ? '...' : '')
}

function generateStory(backendCase: any): string {
  const nodes = backendCase.nodes || []
  const reports = nodes.filter((n: any) => n.node_type === 'report')

  if (reports.length === 0) return 'No story available'

  const story = reports
    .map((r: any, i: number) => {
      const timestamp = new Date(r.data?.timestamp || '').toLocaleString()
      const text = r.data?.text_body || 'No details'
      return `Report ${i + 1} (${timestamp}): ${text}`
    })
    .join('\n\n')

  return story
}

function mapEvidenceType(nodeType: string): Evidence['type'] {
  if (nodeType === 'report') return 'text'
  if (nodeType === 'external_source') return 'text'
  return 'text' // Default
}

function mapAuthenticity(data: any): Evidence['authenticity'] {
  if (data.verified) return 'verified'
  if (data.suspicious || data.urgency > 0.8) return 'suspicious'
  return 'unknown'
}

function mapRelationType(edgeType: string): EvidenceConnection['relation'] {
  const relationMap: Record<string, EvidenceConnection['relation']> = {
    'similar_to': 'related',
    'contains': 'supports',
    'related': 'related',
    'contradicts': 'contradicts',
  }

  return relationMap[edgeType?.toLowerCase()] || 'related'
}

// ============================================================================
// API Client
// ============================================================================

export class ShadowBureauAPI {
  private baseUrl: string

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // ======== Cases ========

  async getCases(): Promise<Case[]> {
    const response = await fetch(`${this.baseUrl}/api/cases`)
    if (!response.ok) throw new Error(`Failed to fetch cases: ${response.statusText}`)

    const cases = await response.json()
    return cases.map(mapBackendCase)
  }

  async getCase(caseId: string): Promise<{ case: Case; evidence: Evidence[]; connections: EvidenceConnection[] }> {
    const response = await fetch(`${this.baseUrl}/api/cases/${caseId}`)
    if (!response.ok) throw new Error(`Failed to fetch case ${caseId}: ${response.statusText}`)

    const data = await response.json()

    return {
      case: mapBackendCase(data),
      evidence: (data.nodes || []).map((n: any) => mapBackendEvidence(n, caseId)),
      connections: (data.edges || []).map(mapBackendEdge),
    }
  }

  async createCase(title: string, description: string): Promise<Case> {
    const caseId = `CASE-${Date.now()}`

    const response = await fetch(`${this.baseUrl}/api/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, title, description }),
    })

    if (!response.ok) throw new Error(`Failed to create case: ${response.statusText}`)

    const data = await response.json()
    return mapBackendCase(data)
  }

  // ======== Evidence ========

  async addEvidence(caseId: string, evidence: Partial<Evidence>): Promise<Evidence> {
    const response = await fetch(`${this.baseUrl}/api/cases/${caseId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: evidence.id || `EVIDENCE-${Date.now()}`,
        type: evidence.type || 'text',
        content: evidence.title || '',
        url: evidence.contentUrl,
        timestamp: evidence.timestamp || new Date().toISOString(),
      }),
    })

    if (!response.ok) throw new Error(`Failed to add evidence: ${response.statusText}`)

    const data = await response.json()
    return mapBackendEvidence(data, caseId)
  }

  async createEvidenceConnection(
    caseId: string,
    fromId: string,
    toId: string,
    relation: EvidenceConnection['relation']
  ): Promise<void> {
    const typeMap: Record<EvidenceConnection['relation'], string> = {
      'supports': 'SUPPORTS',
      'contradicts': 'CONTRADICTS',
      'related': 'RELATED',
    }

    await fetch(`${this.baseUrl}/api/cases/${caseId}/edges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_id: fromId,
        target_id: toId,
        type: typeMap[relation],
        note: `${relation} connection`,
      }),
    })
  }

  // ======== Tips/Reports ========

  async submitTip(tip: Partial<Tip>): Promise<{ caseId: string; reportId: string; referenceCode: string }> {
    const response = await fetch(`${this.baseUrl}/api/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text_body: tip.content || '',
        location: tip.location ? { building: tip.location } : undefined,
        timestamp: tip.timestamp || new Date().toISOString(),
        anonymous: tip.anonymous ?? true,
        contact: tip.email ? { email: tip.email, name: tip.name } : null,
      }),
    })

    if (!response.ok) throw new Error(`Failed to submit tip: ${response.statusText}`)

    const data = await response.json()
    return {
      caseId: data.case_id,
      reportId: data.report_id,
      referenceCode: `WT-${data.report_id.split('-')[1]?.substring(0, 4) || '0000'}`,
    }
  }

  async getReports(): Promise<Tip[]> {
    const response = await fetch(`${this.baseUrl}/api/reports`)
    if (!response.ok) throw new Error(`Failed to fetch reports: ${response.statusText}`)

    const reports = await response.json()
    return reports.map((r: any) => ({
      id: r.report_id,
      type: 'text' as const,
      category: 'Other' as const,
      location: r.location?.building || 'Unknown',
      content: r.text_body,
      anonymous: r.anonymous,
      timestamp: r.timestamp,
      referenceCode: `WT-${r.report_id.split('-')[1]?.substring(0, 4) || '0000'}`,
    }))
  }

  // ======== Health Check ========

  async healthCheck(): Promise<{ status: string; controller_running: boolean }> {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok) throw new Error(`Health check failed: ${response.statusText}`)
    return response.json()
  }
}

// ============================================================================
// WebSocket Client
// ============================================================================

export class ShadowBureauWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000

  constructor(
    private url: string,
    private onMessage: (data: any) => void,
    private onError?: (error: Event) => void
  ) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected:', this.url)
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.onMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        // Only log errors if we've exhausted reconnection attempts
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('WebSocket error (all reconnection attempts failed):', error)
          this.onError?.(error)
        }
      }

      this.ws.onclose = () => {
        if (this.reconnectAttempts === 0) {
          console.log('WebSocket disconnected, attempting to reconnect...')
        }
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 WebSocket reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => this.connect(), this.reconnectDelay)
    } else {
      console.error('❌ WebSocket failed to connect after maximum reconnection attempts')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Export singleton instance
export const shadowBureauAPI = new ShadowBureauAPI()
