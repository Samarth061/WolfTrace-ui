'use client'

import { useState, useRef } from 'react'
import { FileText, Image, Video, Upload, Check, X } from 'lucide-react'
import type { TipCategory, EvidenceType } from '@/lib/types'

const categories: TipCategory[] = ['Rumor', 'Scam', 'Safety', 'Suspicious', 'Other']
const locations = [
  'North Campus', 'South Campus', 'Arts District', 'Engineering Complex',
  'Library', 'Student Union', 'Stadium', 'Dining Hall', 'Parking Garage',
  'Admin Building', 'Science Building', 'Music Hall', 'Radio Tower', 'Other',
]

const typeConfig: { type: EvidenceType; icon: typeof FileText; label: string }[] = [
  { type: 'text', icon: FileText, label: 'Text' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'video', icon: Video, label: 'Video' },
]

export function TipSubmission() {
  const [tipType, setTipType] = useState<EvidenceType>('text')
  const [category, setCategory] = useState<TipCategory | ''>('')
  const [location, setLocation] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [refCode, setRefCode] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!location) return
    const code = `WT-${Math.floor(1000 + Math.random() * 9000)}`
    setRefCode(code)
    setSubmitted(true)
  }

  function handleReset() {
    setTipType('text')
    setCategory('')
    setLocation('')
    setAnonymous(true)
    setName('')
    setEmail('')
    setContent('')
    setFile(null)
    setSubmitted(false)
    setRefCode('')
  }

  if (submitted) {
    return (
      <section id="submit-tip" className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#A17120]/30 bg-[#A17120]/10">
            <Check className="h-8 w-8 text-[#A17120]" />
          </div>
          <h3 className="mb-2 font-sans text-2xl font-bold text-foreground">
            Tip Filed Successfully
          </h3>
          <p className="mb-4 font-sans text-muted-foreground">
            Your tip has been logged and will be reviewed by our bureau.
          </p>
          <div className="mb-8 inline-block rounded-sm border border-[#764608]/40 bg-[#764608]/10 px-6 py-3">
            <p className="font-mono text-xs text-muted-foreground">Reference Code</p>
            <p className="font-mono text-2xl font-bold tracking-widest text-[#A17120]">{refCode}</p>
          </div>
          <div>
            <button
              onClick={handleReset}
              className="font-sans text-sm text-[#764608] underline underline-offset-4 hover:text-[#A17120] transition-colors"
            >
              Submit another tip
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="submit-tip" className="px-6 py-20">
      <div className="mx-auto max-w-lg">
        <h2 className="mb-2 text-center font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#764608]">
          Submit a Tip
        </h2>
        <div className="mx-auto mb-8 h-px w-16 bg-[#764608]/40" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type tabs */}
          <div className="flex rounded-sm border border-border overflow-hidden">
            {typeConfig.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => setTipType(type)}
                className={`flex flex-1 items-center justify-center gap-2 py-3 font-sans text-sm transition-all ${
                  tipType === type
                    ? 'bg-[#A17120]/15 text-[#A17120] border-b-2 border-[#A17120]'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {tipType === 'text' ? (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Describe what you observed..."
              rows={4}
              className="w-full resize-none rounded-sm border border-border bg-card px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-border bg-card/50 p-8 transition-colors hover:border-[#764608]/40"
            >
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#A17120]/10">
                    {tipType === 'image' ? <Image className="h-5 w-5 text-[#A17120]" /> : <Video className="h-5 w-5 text-[#A17120]" />}
                  </div>
                  <div className="text-left">
                    <p className="font-sans text-sm text-foreground">{file.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} className="ml-2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="font-sans text-sm text-muted-foreground">
                    Click to upload {tipType}
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={tipType === 'image' ? 'image/*' : 'video/*'}
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TipCategory)}
              className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-sans text-sm text-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Location <span className="text-destructive">*</span>
            </label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-sans text-sm text-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
            >
              <option value="">Select location</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAnonymous(!anonymous)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                anonymous ? 'bg-[#A17120]' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                  anonymous ? '' : 'translate-x-5'
                }`}
              />
            </button>
            <span className="font-sans text-sm text-foreground">
              {anonymous ? 'Anonymous' : 'Identified'}
            </span>
          </div>

          {/* Name/Email if not anonymous */}
          {!anonymous && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.edu"
                  className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-sm bg-[#A17120] px-6 py-3 font-sans text-sm font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90 active:scale-[0.98]"
          >
            File Tip
          </button>
        </form>
      </div>
    </section>
  )
}
