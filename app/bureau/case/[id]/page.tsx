'use client'

import { use } from 'react'
import { CaseWorkspace } from '@/components/bureau/case-workspace'

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CaseWorkspace caseId={id} />
}
