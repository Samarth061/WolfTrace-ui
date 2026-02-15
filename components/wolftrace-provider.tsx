'use client'

import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { WolfTraceCtx, type WolfTraceState } from '@/lib/store'
import type { Case, CaseConnection, Evidence, EvidenceConnection, Tip, UserRole } from '@/lib/types'
import { mockCases, mockCaseConnections, mockEvidence, mockEvidenceConnections, mockTips } from '@/lib/mock-data'
import { shadowBureauAPI, ShadowBureauWebSocket, mapBackendCase, mapBackendEvidence, mapBackendEdge } from '@/lib/api-client'

// Feature flag: Set to true to use backend, false to use mock data
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === 'true'

export function WolfTraceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WolfTraceState>({
    isAuthenticated: false,
    userRole: 'Detective',
    badgeId: '',
    cases: USE_BACKEND ? [] : mockCases,
    caseConnections: USE_BACKEND ? [] : mockCaseConnections,
    evidence: USE_BACKEND ? [] : mockEvidence,
    evidenceConnections: USE_BACKEND ? [] : mockEvidenceConnections,
    tips: USE_BACKEND ? [] : mockTips,
  })

  // Load data from backend on mount
  useEffect(() => {
    if (!USE_BACKEND) return

    async function loadBackendData() {
      try {
        // First, seed the backend if it's empty
        try {
          const currentCases = await shadowBureauAPI.getCases()
          if (currentCases.length === 0) {
            console.log('🌱 Backend is empty, seeding with mock data...')
            await shadowBureauAPI.seedBackend()
            console.log('✅ Backend seeded successfully')
          }
        } catch (seedError) {
          console.warn('⚠️  Failed to seed backend:', seedError)
        }

        // Load cases
        const cases = await shadowBureauAPI.getCases()
        setState(s => ({ ...s, cases }))

        // Load all evidence and connections from each case
        const allEvidence: Evidence[] = []
        const allConnections: EvidenceConnection[] = []

        for (const case_ of cases) {
          try {
            const caseData = await shadowBureauAPI.getCase(case_.id)
            allEvidence.push(...caseData.evidence)
            allConnections.push(...caseData.connections)
          } catch (error) {
            console.error(`Failed to load case ${case_.id}:`, error)
          }
        }

        setState(s => ({
          ...s,
          evidence: allEvidence,
          evidenceConnections: allConnections,
        }))

        // Load tips
        const tips = await shadowBureauAPI.getReports()
        setState(s => ({ ...s, tips }))

        console.log('✅ Backend data loaded:', {
          cases: cases.length,
          evidence: allEvidence.length,
          connections: allConnections.length,
          tips: tips.length,
        })
      } catch (error) {
        console.error('❌ Failed to load backend data:', error)
        // Fall back to mock data on error
        setState(s => ({
          ...s,
          cases: mockCases,
          caseConnections: mockCaseConnections,
          evidence: mockEvidence,
          evidenceConnections: mockEvidenceConnections,
          tips: mockTips,
        }))
      }
    }

    loadBackendData()
  }, [])

  // WebSocket for real-time updates
  useEffect(() => {
    if (!USE_BACKEND) return

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
    const wsUrl = apiUrl.replace('http', 'ws')
    const ws = new ShadowBureauWebSocket(
      `${wsUrl}/ws/caseboard`,
      (data) => {
        console.log('📨 WebSocket message:', data)

        if (data.type === 'snapshots') {
          // Initial snapshots
          const cases = data.payload.map(mapBackendCase)
          setState(s => ({ ...s, cases }))
        } else if (data.type === 'graph_update') {
          // Real-time update
          const { action, payload } = data

          if (action === 'add_node') {
            const newEvidence = mapBackendEvidence(payload, payload.case_id || '')
            setState(s => ({
              ...s,
              evidence: [...s.evidence, newEvidence],
            }))
          } else if (action === 'add_edge') {
            const newConnection = mapBackendEdge(payload)
            setState(s => ({
              ...s,
              evidenceConnections: [...s.evidenceConnections, newConnection],
            }))
          } else if (action === 'update_node') {
            const updatedEvidence = mapBackendEvidence(payload, payload.case_id || '')
            setState(s => ({
              ...s,
              evidence: s.evidence.map(e => e.id === updatedEvidence.id ? updatedEvidence : e),
            }))
          }
        }
      },
      (error) => console.error('WebSocket error:', error)
    )

    ws.connect()

    return () => ws.disconnect()
  }, [])

  const login = useCallback((badgeId: string, role: UserRole) => {
    setState(s => ({ ...s, isAuthenticated: true, badgeId, userRole: role }))
  }, [])

  const logout = useCallback(() => {
    setState(s => ({ ...s, isAuthenticated: false, badgeId: '', userRole: 'Detective' }))
  }, [])

  const updateCasePosition = useCallback((id: string, pos: { x: number; y: number }) => {
    setState(s => ({
      ...s,
      cases: s.cases.map(c => c.id === id ? { ...c, position: pos } : c),
    }))
  }, [])

  const addCase = useCallback(async (c: Case) => {
    if (USE_BACKEND) {
      try {
        const newCase = await shadowBureauAPI.createCase(c.codename, c.summary)
        setState(s => ({ ...s, cases: [...s.cases, newCase] }))
        return
      } catch (error) {
        console.error('Failed to create case on backend:', error)
      }
    }
    setState(s => ({ ...s, cases: [...s.cases, c] }))
  }, [])

  const addCaseConnection = useCallback((conn: CaseConnection) => {
    setState(s => ({ ...s, caseConnections: [...s.caseConnections, conn] }))
  }, [])

  const addEvidence = useCallback(async (ev: Evidence) => {
    if (USE_BACKEND) {
      try {
        const newEvidence = await shadowBureauAPI.addEvidence(ev.caseId, ev)
        setState(s => ({ ...s, evidence: [...s.evidence, newEvidence] }))
        return
      } catch (error) {
        console.error('Failed to add evidence to backend:', error)
      }
    }
    setState(s => ({ ...s, evidence: [...s.evidence, ev] }))
  }, [])

  const addEvidenceConnection = useCallback(async (conn: EvidenceConnection) => {
    if (USE_BACKEND) {
      try {
        // Find the case ID from the evidence
        const evidence = state.evidence.find(e => e.id === conn.fromId || e.id === conn.toId)
        if (evidence) {
          await shadowBureauAPI.createEvidenceConnection(
            evidence.caseId,
            conn.fromId,
            conn.toId,
            conn.relation
          )
          setState(s => ({ ...s, evidenceConnections: [...s.evidenceConnections, conn] }))
          return
        }
      } catch (error) {
        console.error('Failed to create evidence connection:', error)
      }
    }
    setState(s => ({ ...s, evidenceConnections: [...s.evidenceConnections, conn] }))
  }, [state.evidence])

  const markEvidenceReviewed = useCallback(async (id: string) => {
    // Find the evidence to get its case ID
    const evidence = state.evidence.find(e => e.id === id)
    if (!evidence) return

    if (USE_BACKEND) {
      try {
        await shadowBureauAPI.markEvidenceReviewed(evidence.caseId, id)
        // WebSocket will update the state automatically, but update optimistically for better UX
        setState(s => ({
          ...s,
          evidence: s.evidence.map(e => e.id === id ? { ...e, reviewed: true } : e),
        }))
      } catch (error) {
        console.error('Failed to mark evidence as reviewed:', error)
      }
    } else {
      // Mock mode: just update local state
      setState(s => ({
        ...s,
        evidence: s.evidence.map(e => e.id === id ? { ...e, reviewed: true } : e),
      }))
    }
  }, [state.evidence])

  const addTip = useCallback(async (tip: Tip) => {
    if (USE_BACKEND) {
      try {
        const result = await shadowBureauAPI.submitTip(tip)
        // Update tip with reference code from backend
        const updatedTip = { ...tip, referenceCode: result.referenceCode, id: result.reportId }
        setState(s => ({ ...s, tips: [...s.tips, updatedTip] }))
        return
      } catch (error) {
        console.error('Failed to submit tip to backend:', error)
      }
    }
    setState(s => ({ ...s, tips: [...s.tips, tip] }))
  }, [])

  const updateCaseStatus = useCallback((id: string, status: Case['status']) => {
    setState(s => ({
      ...s,
      cases: s.cases.map(c => c.id === id ? { ...c, status } : c),
    }))
  }, [])

  return (
    <WolfTraceCtx.Provider
      value={{
        ...state,
        login, logout, updateCasePosition, addCase, addCaseConnection,
        addEvidence, addEvidenceConnection, markEvidenceReviewed, addTip, updateCaseStatus,
      }}
    >
      {children}
    </WolfTraceCtx.Provider>
  )
}
