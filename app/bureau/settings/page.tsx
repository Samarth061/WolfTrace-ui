'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Shield, Bell, Eye, Moon, Zap } from 'lucide-react'
import { useWolfTrace } from '@/lib/store'

export default function SettingsPage() {
  const { badgeId, userRole } = useWolfTrace()
  const [notifications, setNotifications] = useState(true)
  const [heatIndicators, setHeatIndicators] = useState(true)
  const [autoReview, setAutoReview] = useState(false)
  const [useGroqAPI, setUseGroqAPI] = useState(false)

  // Load GROQ preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wolftrace_use_groq')
    if (stored !== null) {
      setUseGroqAPI(stored === 'true')
    }
  }, [])

  // Save GROQ preference to localStorage when changed
  const handleGroqToggle = () => {
    const newValue = !useGroqAPI
    setUseGroqAPI(newValue)
    localStorage.setItem('wolftrace_use_groq', String(newValue))

    // Dispatch event for WolfTrace provider to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('groq-preference-changed', {
        detail: { useGroq: newValue }
      }))
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-[#0d0804]/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-[#A17120]" />
          <h1 className="font-sans text-xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Configure your bureau environment.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-xl space-y-6">
          {/* Profile Section */}
          <div className="rounded-sm border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-[#A17120]" />
              <h2 className="font-sans text-sm font-bold text-foreground">Profile</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm text-muted-foreground">Badge ID</span>
                <span className="font-mono text-sm text-foreground">{badgeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm text-muted-foreground">Role</span>
                <span className="inline-flex items-center gap-1 font-mono text-sm text-[#A17120]">
                  <Shield className="h-3 w-3" />
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-sm border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#A17120]" />
              <h2 className="font-sans text-sm font-bold text-foreground">Preferences</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-sans text-sm text-foreground">Tip Notifications</p>
                    <p className="font-sans text-[11px] text-muted-foreground">Alert when new tips arrive</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications ? 'bg-[#A17120]' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
                      notifications ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                  <span className="sr-only">Toggle notifications</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-sans text-sm text-foreground">Heat Indicators</p>
                    <p className="font-sans text-[11px] text-muted-foreground">Show active case glow on wall</p>
                  </div>
                </div>
                <button
                  onClick={() => setHeatIndicators(!heatIndicators)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    heatIndicators ? 'bg-[#A17120]' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
                      heatIndicators ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                  <span className="sr-only">Toggle heat indicators</span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-sans text-sm text-foreground">Auto-mark Reviewed</p>
                    <p className="font-sans text-[11px] text-muted-foreground">Automatically mark evidence when opened</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoReview(!autoReview)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    autoReview ? 'bg-[#A17120]' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
                      autoReview ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                  <span className="sr-only">Toggle auto-review</span>
                </button>
              </div>

              {/* NEW: GROQ API Toggle */}
              <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-sans text-sm text-foreground">Use GROQ API</p>
                    <p className="font-sans text-[11px] text-muted-foreground">
                      Ultra-fast inference for text analysis (claim extraction, alerts).
                      Image/video forensics use Gemini vision.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGroqToggle}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    useGroqAPI ? 'bg-amber-500' : 'bg-muted'
                  }`}
                  aria-label={useGroqAPI ? 'Disable GROQ API' : 'Enable GROQ API'}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground shadow transition-transform ${
                      useGroqAPI ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                  <span className="sr-only">Toggle GROQ API</span>
                </button>
              </div>

              {/* Status indicator */}
              {useGroqAPI !== undefined && (
                <div className="rounded-sm border border-border bg-muted/30 p-3 mt-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {useGroqAPI ? (
                      <>
                        <span className="text-amber-500">●</span> GROQ API enabled
                        <span className="block mt-1 text-[10px]">(Mixtral 8x7B for claims, Llama3 70B for alerts)</span>
                      </>
                    ) : (
                      <>
                        <span className="text-blue-500">●</span> Gemini API enabled
                        <span className="block mt-1 text-[10px]">(Gemini 2.0 Flash via Backboard)</span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="rounded-sm border border-border bg-card p-5">
            <h2 className="mb-3 font-sans text-sm font-bold text-foreground">About WolfTrace</h2>
            <p className="font-sans text-xs leading-relaxed text-muted-foreground">
              WolfTrace is an investigative desk for handling rumors, deceptive media, and campus incidents.
              It provides tools for evidence tracking, fact-checking workflows, and collaborative investigation.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#A17120] animate-pulse" />
              <span className="font-mono text-[10px] text-muted-foreground">v1.0.0 &middot; All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
