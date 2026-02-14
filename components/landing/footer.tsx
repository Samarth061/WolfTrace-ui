'use client'

import { Lightbulb } from 'lucide-react'
import { useRef } from 'react'

export function LandingFooter({ onLampClick }: { onLampClick: () => void }) {
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
    <footer className="relative border-t border-border px-6 py-12">
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070401] to-transparent" />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <button
          onClick={handleLampClick}
          className="text-[#764608]/40 hover:text-[#A17120] transition-colors duration-700"
          aria-label="Streetlamp"
        >
          <Lightbulb className="h-5 w-5" />
        </button>
        <p className="font-sans text-xs italic text-muted-foreground/40">
          Some doors open twice.
        </p>
        <p className="font-mono text-xs text-muted-foreground/30">
          WolfTrace Bureau
        </p>
      </div>
    </footer>
  )
}
