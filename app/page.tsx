'use client'

import { WolfTraceProvider } from '@/components/wolftrace-provider'
import { LandingHero } from '@/components/landing/hero'
import { LandingWhatWeDo } from '@/components/landing/what-we-do'
import { TipSubmission } from '@/components/landing/tip-submission'
import { LandingFooter } from '@/components/landing/footer'
import { BureauDoorModal } from '@/components/landing/bureau-door-modal'
import { useState } from 'react'

export default function Page() {
  const [doorOpen, setDoorOpen] = useState(false)

  return (
    <WolfTraceProvider>
      <main className="min-h-screen bg-background">
        <LandingHero onLampClick={() => setDoorOpen(true)} />
        <LandingWhatWeDo />
        <TipSubmission />
        <LandingFooter onLampClick={() => setDoorOpen(true)} />
        <BureauDoorModal open={doorOpen} onOpenChange={setDoorOpen} />
      </main>
    </WolfTraceProvider>
  )
}
