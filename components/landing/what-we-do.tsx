'use client'

import Image from 'next/image'

const features = [
  {
    wolfImage: '/wolves/wolf-detective-glass.svg', // Wolf with sunglasses + notepad
    title: 'Collect Tips',
    description: 'Secure intake for anonymous and identified reports. Every tip gets a reference code and enters the queue for triage.',
    stats: { label: 'Tips Processed', value: '247+' },
  },
  {
    wolfImage: '/wolves/wolf-detective-cap.svg', // Wolf with detective hat + magnifying glass
    title: 'Connect Evidence',
    description: 'Build evidence trails by linking documents, images, and video. Map relationships between findings on a digital investigation board.',
    stats: { label: 'Connections Made', value: '1.2K+' },
  },
  {
    wolfImage: '/wolves/wolf-detective-smoke.svg', // Wolf with cigar + badge
    title: 'Publish Verified Updates',
    description: 'After human review, publish fact-checked bulletins. Only verified findings leave the bureau — everything else stays under investigation.',
    stats: { label: 'Alerts Published', value: '89' },
  },
]

export function LandingWhatWeDo() {
  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-2 text-center font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#764608]">
          What We Do
        </h2>
        <div className="mx-auto mb-12 h-px w-16 bg-[#764608]/40" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-lg border-2 border-[#764608]/30 bg-gradient-to-b from-[#1a1410]/90 to-[#0a0806]/95 shadow-xl transition-all hover:border-[#A17120]/50 hover:shadow-2xl hover:shadow-[#A17120]/20"
            >
              {/* Character Image Section */}
              <div className="relative h-56 overflow-hidden bg-gradient-to-b from-[#2a1f15]/50 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#A17120]/10 via-transparent to-transparent" />

                {/* 3D Detective Wolf */}
                <div className="relative h-full w-full">
                  <Image
                    src={f.wolfImage}
                    alt={f.title}
                    fill
                    className="object-contain object-center drop-shadow-2xl scale-90 transition-transform group-hover:scale-95"
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="relative px-6 pb-6 pt-4">
                <h3 className="mb-3 text-center font-sans text-xl font-bold text-[#D4AF37] drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]">
                  {f.title}
                </h3>
                <p className="mb-4 text-center font-sans text-sm leading-relaxed text-[#C4B5A0]">
                  {f.description}
                </p>

                {/* Stats Section (CoC style) */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-md border border-[#764608]/30 bg-[#0a0806]/60 px-4 py-2">
                  <div className="text-center">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#A17120]/80">
                      {f.stats.label}
                    </div>
                    <div className="mt-0.5 font-sans text-lg font-bold text-[#D4AF37]">
                      {f.stats.value}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative corner accents */}
              <div className="pointer-events-none absolute left-0 top-0 h-16 w-16 border-l-2 border-t-2 border-[#A17120]/20" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 border-b-2 border-r-2 border-[#A17120]/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
