'use client'

import { useState, useEffect, useRef } from 'react'
import { BookOpen, MapPin, Clock, FileText, Image, Video, CheckCircle, AlertTriangle, HelpCircle, Star, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { shadowBureauAPI } from '@/lib/api-client'
import type { Case, Evidence } from '@/lib/types'

const typeIcons: Record<string, typeof FileText> = {
  text: FileText,
  image: Image,
  video: Video,
}

const authenticityIcons: Record<string, { icon: typeof CheckCircle; color: string }> = {
  verified: { icon: CheckCircle, color: 'text-[#6aad6e]' },
  suspicious: { icon: AlertTriangle, color: 'text-[#c45c5c]' },
  unknown: { icon: HelpCircle, color: 'text-[#A17120]' },
}

interface CaseStory {
  case_id: string
  narrative: string
  sections: Record<string, string>
  key_moments: Array<{ description: string; detail?: string }>
}

export function StoryPanel({ caseData, evidence }: { caseData: Case; evidence: Evidence[] }) {
  const [caseStory, setCaseStory] = useState<CaseStory | null>(null)
  const [loadingStory, setLoadingStory] = useState(false)
  const [storyStale, setStoryStale] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const sortedEvidence = [...evidence].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const evidenceCount = evidence.length

  // TTS Handler
  const handleReadAloud = async () => {
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    setAudioLoading(true)

    try {
      const audioBlob = await shadowBureauAPI.getStoryAudio(caseData.id)
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setAudioLoading(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('TTS failed:', error)
    } finally {
      setAudioLoading(false)
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        const src = audioRef.current.src
        if (src.startsWith('blob:')) {
          URL.revokeObjectURL(src)
        }
      }
    }
  }, [])

  // Refresh story when evidence count changes
  useEffect(() => {
    async function loadStory() {
      setLoadingStory(true)
      try {
        const response = await fetch(`${shadowBureauAPI.baseUrl}/api/cases/${caseData.id}/story`)
        if (response.ok) {
          const story = await response.json()
          setCaseStory(story)
          setStoryStale(false)
        }
      } catch (error) {
        console.error('Failed to load case story:', error)
      } finally {
        setLoadingStory(false)
      }
    }

    // Only update when evidence count actually changes
    if (evidenceCount > 0) {
      setStoryStale(true)
      // Debounce to avoid multiple rapid updates
      const timer = setTimeout(loadStory, 2000)
      return () => clearTimeout(timer)
    }
  }, [caseData.id, evidenceCount])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Story content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto max-w-2xl">
          {/* Case Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#A17120]" />
                <span className="font-mono text-xs uppercase tracking-wider text-[#A17120]">Case Narrative</span>
                {storyStale && !loadingStory && (
                  <span className="font-mono text-xs text-amber-500">Story updating...</span>
                )}
              </div>

              {caseStory?.narrative && (
                <button
                  onClick={handleReadAloud}
                  disabled={audioLoading || loadingStory}
                  className="flex items-center gap-1.5 rounded-sm border border-[#A17120]/30 bg-[#A17120]/10 px-2.5 py-1 font-mono text-xs text-[#A17120] transition-all hover:bg-[#A17120]/20 disabled:opacity-50"
                  title={isPlaying ? "Stop reading" : "Read aloud"}
                >
                  {audioLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <h1 className="mb-3 font-sans text-3xl font-bold text-foreground">{caseData.codename}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <MapPin className="h-4 w-4" />
                {caseData.location}
              </span>
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <Clock className="h-4 w-4" />
                Last updated {formatDistanceToNow(new Date(caseData.lastUpdated), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8 rounded-sm border border-[#764608]/20 bg-[#764608]/5 p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#A17120] mb-2">Summary</p>
            <p className="font-sans text-sm leading-relaxed text-foreground/90">{caseData.summary}</p>
          </div>

          {/* AI-Generated Narrative */}
          {caseStory && caseStory.narrative && (
            <div className="mb-8">
              <div className="mb-4 rounded-sm border border-border bg-card p-4">
                <h3 className="mb-3 font-mono text-sm text-[#A17120]">CASE NARRATIVE</h3>
                <p className="font-sans text-sm leading-relaxed text-foreground/90">
                  {caseStory.narrative}
                </p>
              </div>

              {/* Key Moments */}
              {caseStory.key_moments && caseStory.key_moments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Key Moments</p>
                  {caseStory.key_moments.map((moment, i) => (
                    <div key={i} className="flex gap-2 rounded-sm border border-[#A17120]/20 bg-[#A17120]/5 p-3">
                      <Star className="h-4 w-4 flex-shrink-0 text-[#A17120]" />
                      <div className="flex-1">
                        <span className="font-sans text-xs font-semibold text-foreground">
                          {moment.description}
                        </span>
                        {moment.detail && (
                          <p className="mt-1 font-sans text-xs text-muted-foreground">
                            {moment.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {loadingStory && (
            <div className="mb-8 rounded-sm border border-border bg-card p-4">
              <p className="font-sans text-sm italic text-muted-foreground">
                Generating case narrative...
              </p>
            </div>
          )}

          {/* Evidence Timeline */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Evidence Timeline</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            {sortedEvidence.map((ev, i) => {
              const TypeIcon = typeIcons[ev.type] || FileText
              const auth = authenticityIcons[ev.authenticity] || authenticityIcons.unknown
              const AuthIcon = auth.icon

              return (
                <div key={ev.id} className="relative mb-6 pl-12" style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 ${
                    ev.reviewed ? 'border-[#6aad6e] bg-[#1a3a1a]' : 'border-[#A17120] bg-[#2a2010]'
                  }`} />

                  <div className="rounded-sm border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <h4 className="font-sans text-sm font-semibold text-foreground">{ev.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AuthIcon className={`h-3 w-3 ${auth.color}`} />
                        <span className={`font-mono text-[10px] ${auth.color}`}>{ev.authenticity}</span>
                      </div>
                    </div>

                    <p className="mb-2 font-mono text-[10px] text-muted-foreground">
                      {format(new Date(ev.timestamp), 'MMM d, yyyy HH:mm')} &middot; {ev.source}
                    </p>

                    <ul className="space-y-1">
                      {ev.keyPoints.map((pt, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#764608]" />
                          <span className="font-sans text-xs leading-relaxed text-foreground/70">{pt}</span>
                        </li>
                      ))}
                    </ul>

                    {ev.extractedEntities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ev.extractedEntities.map((entity, j) => (
                          <span key={j} className="rounded-sm bg-[#764608]/10 px-1.5 py-0.5 font-mono text-[9px] text-[#A17120]">
                            {entity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right sidebar summary */}
      <div className="w-64 overflow-y-auto border-l border-border bg-[#0d0804] p-4">
        <h3 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Quick Stats</h3>

        <div className="space-y-3">
          <div className="rounded-sm border border-border bg-card p-3">
            <p className="font-mono text-[10px] text-muted-foreground">Total Evidence</p>
            <p className="font-sans text-xl font-bold text-foreground">{evidence.length}</p>
          </div>
          <div className="rounded-sm border border-border bg-card p-3">
            <p className="font-mono text-[10px] text-muted-foreground">Verified</p>
            <p className="font-sans text-xl font-bold text-[#6aad6e]">{evidence.filter(e => e.authenticity === 'verified').length}</p>
          </div>
          <div className="rounded-sm border border-border bg-card p-3">
            <p className="font-mono text-[10px] text-muted-foreground">Suspicious</p>
            <p className="font-sans text-xl font-bold text-[#c45c5c]">{evidence.filter(e => e.authenticity === 'suspicious').length}</p>
          </div>
          <div className="rounded-sm border border-border bg-card p-3">
            <p className="font-mono text-[10px] text-muted-foreground">Unreviewed</p>
            <p className="font-sans text-xl font-bold text-[#A17120]">{evidence.filter(e => !e.reviewed).length}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Evidence Types</h3>
          <div className="space-y-2">
            {(['text', 'image', 'video'] as const).map(type => {
              const count = evidence.filter(e => e.type === type).length
              const Icon = typeIcons[type]
              if (count === 0) return null
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="font-sans text-xs capitalize text-muted-foreground">{type}</span>
                  </div>
                  <span className="font-mono text-xs text-foreground">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">All Locations</h3>
          <div className="space-y-1.5">
            {[...new Set(evidence.flatMap(e => e.extractedLocations))].filter(Boolean).map((loc, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-[#764608]" />
                <span className="font-sans text-[11px] text-muted-foreground">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
