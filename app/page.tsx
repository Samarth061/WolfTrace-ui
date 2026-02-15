'use client'

import { WolfTraceProvider } from '@/components/wolftrace-provider'
import { LandingHero } from '@/components/landing/hero'
import { SubwayTrain } from '@/components/landing/subway-train'
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
        <SubwayTrain />
        <div className="py-1"></div>
        <LandingWhatWeDo />
        <TipSubmission />
        <LandingFooter onLampClick={() => setDoorOpen(true)} />
        <BureauDoorModal open={doorOpen} onOpenChange={setDoorOpen} />
      </main>
    </WolfTraceProvider>
  )
}
