export type CaseStatus = 'Investigating' | 'Confirmed' | 'Debunked' | 'All-clear' | 'Closed'
export type EvidenceType = 'text' | 'image' | 'video'
export type RelationType = 'supports' | 'contradicts' | 'related'
export type Authenticity = 'verified' | 'suspicious' | 'unknown'
export type TipCategory = 'Rumor' | 'Scam' | 'Safety' | 'Suspicious' | 'Other'
export type UserRole = 'Detective' | 'Admin'

export interface Case {
  id: string
  codename: string
  location: string
  status: CaseStatus
  lastUpdated: string
  position: { x: number; y: number }
  hasHeat: boolean
  summary: string
  evidenceCount: number
  storyText: string
}

export interface Evidence {
  id: string
  caseId: string
  type: EvidenceType
  title: string
  contentUrl?: string
  authenticity: Authenticity
  extractedEntities: string[]
  extractedLocations: string[]
  keyPoints: string[]
  source: 'Public Tip' | 'Investigator'
  timestamp: string
  reviewed: boolean
  notes: string[]
  videoExtract?: {
    transcript: string
    keyMoments: { time: string; description: string }[]
    duration: string
  }
  authenticitySignals?: string[]
}

export interface CaseConnection {
  fromId: string
  toId: string
}

export interface EvidenceConnection {
  fromId: string
  toId: string
  relation: RelationType
}

export interface Tip {
  id: string
  type: EvidenceType
  category: TipCategory
  location: string
  content: string
  anonymous: boolean
  name?: string
  email?: string
  timestamp: string
  referenceCode: string
}
