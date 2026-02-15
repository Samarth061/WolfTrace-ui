'use client'

import { X, FileText, Image, Video, MapPin, Clock, ExternalLink, Paperclip } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

const typeIcons = { text: FileText, image: Image, video: Video }

export function NewTipsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tips } = useWolfTrace()

  if (!open) return null

  return (
    <div className="absolute right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-border bg-[#0b0b0b]/98 shadow-2xl backdrop-blur-sm animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-sm font-bold text-foreground">New Tips</h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#A855F7] px-1.5 font-mono text-[10px] font-bold text-[#0f0f0f]">
            {tips.length}
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {tips.map(tip => {
          const Icon = typeIcons[tip.type]
          return (
            <div
              key={tip.id}
              className="rounded-sm border border-border bg-card/50 p-3 transition-colors hover:border-[#A855F7]/30"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#A855F7]/10">
                  <Icon className="h-3.5 w-3.5 text-[#A855F7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center rounded-sm bg-[#A855F7]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#A855F7]">
                    Public Tip
                  </span>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground">{tip.referenceCode}</span>
              </div>

              <p className="mb-2 line-clamp-2 font-sans text-xs leading-relaxed text-foreground">
                {tip.content}
              </p>

              <div className="mb-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="font-sans text-[10px]">{tip.location}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono text-[10px]">{formatDistanceToNow(new Date(tip.timestamp), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-border py-1.5 font-sans text-[10px] text-muted-foreground transition-colors hover:border-[#A855F7]/40 hover:text-foreground">
                  <ExternalLink className="h-3 w-3" />
                  Create Case
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-border py-1.5 font-sans text-[10px] text-muted-foreground transition-colors hover:border-[#A855F7]/40 hover:text-foreground">
                  <Paperclip className="h-3 w-3" />
                  Attach to Case
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
