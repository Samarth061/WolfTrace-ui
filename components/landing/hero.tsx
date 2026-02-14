'use client'

import { useRef } from 'react'
import { Lightbulb } from 'lucide-react'

export function LandingHero({ onLampClick }: { onLampClick: () => void }) {
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLampClick() {
    clickCountRef.current++
    if (clickCountRef.current === 2) {
      onLampClick()
      clickCountRef.current = 0
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    } else {
      clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0 }, 400)
    }
  }

  return (
    <header className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
      {/* Fog gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#070401] via-[#070401]/60 to-transparent" />

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#A17120]/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        <button
          onClick={handleLampClick}
          className="mb-8 text-[#764608] hover:text-[#A17120] transition-colors duration-500"
          aria-label="Streetlamp"
        >
          <Lightbulb className="h-8 w-8" />
        </button>

        <h1 className="font-sans text-6xl font-bold tracking-tight text-foreground md:text-8xl text-balance">
          WolfTrace
        </h1>

        <p className="mt-4 font-sans text-xl italic text-[#A17120] md:text-2xl">
          Trace the truth through the fog.
        </p>

        <p className="mt-6 max-w-xl font-sans text-base text-muted-foreground leading-relaxed">
          An investigative desk for handling rumors, deceptive media, and campus
          incidents — organized into casefiles and evidence trails.
        </p>

        <a
          href="#submit-tip"
          className="mt-10 inline-flex items-center rounded-sm border border-[#A17120]/40 bg-[#A17120]/10 px-8 py-3 font-sans text-sm font-semibold tracking-wide text-[#A17120] transition-all hover:bg-[#A17120]/20 hover:border-[#A17120]/60"
        >
          File a Tip
        </a>
      </div>
    </header>
  )
}
