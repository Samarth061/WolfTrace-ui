'use client'

import { createContext, useContext } from 'react'
import type { Case, Evidence, CaseConnection, EvidenceConnection, Tip, UserRole } from './types'

export interface WolfTraceState {
  isAuthenticated: boolean
  userRole: UserRole
  badgeId: string
  cases: Case[]
  caseConnections: CaseConnection[]
  evidence: Evidence[]
  evidenceConnections: EvidenceConnection[]
  tips: Tip[]
}

export interface WolfTraceActions {
  login: (badgeId: string, role: UserRole) => void
  logout: () => void
  updateCasePosition: (id: string, pos: { x: number; y: number }) => void
  addCase: (c: Case) => void
  addCaseConnection: (conn: CaseConnection) => void
  addEvidence: (ev: Evidence) => void
  addEvidenceConnection: (conn: EvidenceConnection) => void
  markEvidenceReviewed: (id: string) => void
  addTip: (tip: Tip) => void
  updateCaseStatus: (id: string, status: Case['status']) => void
}

export type WolfTraceContext = WolfTraceState & WolfTraceActions

export const WolfTraceCtx = createContext<WolfTraceContext | null>(null)

export function useWolfTrace() {
  const ctx = useContext(WolfTraceCtx)
  if (!ctx) throw new Error('useWolfTrace must be used within WolfTraceProvider')
  return ctx
}
