'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { WolfTraceCtx, type WolfTraceState } from '@/lib/store'
import type { Case, CaseConnection, Evidence, EvidenceConnection, Tip, UserRole } from '@/lib/types'
import { mockCases, mockCaseConnections, mockEvidence, mockEvidenceConnections, mockTips } from '@/lib/mock-data'

export function WolfTraceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WolfTraceState>({
    isAuthenticated: false,
    userRole: 'Detective',
    badgeId: '',
    cases: mockCases,
    caseConnections: mockCaseConnections,
    evidence: mockEvidence,
    evidenceConnections: mockEvidenceConnections,
    tips: mockTips,
  })

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

  const addCase = useCallback((c: Case) => {
    setState(s => ({ ...s, cases: [...s.cases, c] }))
  }, [])

  const addCaseConnection = useCallback((conn: CaseConnection) => {
    setState(s => ({ ...s, caseConnections: [...s.caseConnections, conn] }))
  }, [])

  const addEvidence = useCallback((ev: Evidence) => {
    setState(s => ({ ...s, evidence: [...s.evidence, ev] }))
  }, [])

  const addEvidenceConnection = useCallback((conn: EvidenceConnection) => {
    setState(s => ({ ...s, evidenceConnections: [...s.evidenceConnections, conn] }))
  }, [])

  const markEvidenceReviewed = useCallback((id: string) => {
    setState(s => ({
      ...s,
      evidence: s.evidence.map(e => e.id === id ? { ...e, reviewed: true } : e),
    }))
  }, [])

  const addTip = useCallback((tip: Tip) => {
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
