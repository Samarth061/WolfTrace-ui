'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Inbox, GitBranch, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: Inbox,
    title: 'Collect Tips',
    description: 'Secure intake for anonymous and identified reports. Every tip gets a reference code and enters the queue for triage.',
    wolfImage: '/wolves/wolf-detective-cigar.svg',
  },
  {
    icon: GitBranch,
    title: 'Connect Evidence',
    description: 'Build evidence trails by linking documents, images, and video. Map relationships between findings on a digital investigation board.',
    wolfImage: '/wolves/wolf-detective-glass.svg',
  },
  {
    icon: ShieldCheck,
    title: 'Publish Verified Updates',
    description: 'After human review, publish fact-checked bulletins. Only verified findings leave the bureau — everything else stays under investigation.',
    wolfImage: '/wolves/wolf-detective-cap.svg',
  },
]

export function LandingWhatWeDo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-2 text-center font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#764608]">
          What We Do
        </h2>
        <div className="mx-auto mb-12 h-px w-16 bg-[#764608]/40" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f, index) => (
            <div
              key={f.title}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative overflow-hidden rounded-sm border border-border bg-card/50 p-6 transition-all duration-300 hover:border-[#764608]/40 hover:bg-card hover:scale-105 hover:shadow-xl hover:shadow-[#A17120]/10 cursor-pointer"
            >
              {/* Wolf Image Background */}
              <div className={`absolute inset-0 transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-20' : 'opacity-0'}`}>
                <Image
                  src={f.wolfImage}
                  alt={f.title}
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <f.icon className="mb-4 h-5 w-5 text-[#A17120] transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mb-2 font-sans text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-[#A17120]">
                  {f.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
