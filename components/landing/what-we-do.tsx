'use client'

import { Inbox, GitBranch, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: Inbox,
    title: 'Collect Tips',
    description: 'Secure intake for anonymous and identified reports. Every tip gets a reference code and enters the queue for triage.',
  },
  {
    icon: GitBranch,
    title: 'Connect Evidence',
    description: 'Build evidence trails by linking documents, images, and video. Map relationships between findings on a digital investigation board.',
  },
  {
    icon: ShieldCheck,
    title: 'Publish Verified Updates',
    description: 'After human review, publish fact-checked bulletins. Only verified findings leave the bureau — everything else stays under investigation.',
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-sm border border-border bg-card/50 p-6 transition-all hover:border-[#764608]/40 hover:bg-card"
            >
              <f.icon className="mb-4 h-5 w-5 text-[#A17120]" />
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
