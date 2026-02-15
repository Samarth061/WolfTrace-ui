'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Scan, Sparkles, Send, Loader2, Image as ImageIcon, Video as VideoIcon, Music, X, BarChart3 } from 'lucide-react'
import type { ForensicAnalysis, ChatMessage } from '@/lib/types'
import { generateMockForensicAnalysis } from '@/lib/mock-data'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  caseId: string
}

export function ForensicsLab({ caseId }: Props) {
  // File upload state
  const [file, setFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  // Scanning state
  const [scanning, setScanning] = useState(false)

  // Analysis state
  const [analysis, setAnalysis] = useState<ForensicAnalysis | null>(null)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the Evidence Assistant. Upload media to begin forensic analysis, or ask me questions about the evidence in this case.',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Create file preview URL for all media types
  useEffect(() => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      const url = URL.createObjectURL(file)
      setFilePreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setFilePreviewUrl(null)
    }
  }, [file])

  function handleFileSelect(selectedFile: File | null) {
    if (!selectedFile) return

    // Validate file type
    const isValid = selectedFile.type.startsWith('image/') ||
      selectedFile.type.startsWith('video/') ||
      selectedFile.type.startsWith('audio/')

    if (!isValid) {
      alert('Please upload an image, video, or audio file.')
      return
    }

    setFile(selectedFile)
    setAnalysis(null) // Reset previous analysis
  }

  function handleScanForensics() {
    if (!file) return

    setScanning(true)

    // Simulate scanning delay (2-3 seconds)
    setTimeout(() => {
      const result = generateMockForensicAnalysis(file)
      setAnalysis(result)
      setScanning(false)

      // Add a message to chat about the scan
      const scanMessage: ChatMessage = {
        id: `scan-${Date.now()}`,
        role: 'assistant',
        content: `Forensic scan complete for "${file.name}". Authenticity: ${result.metrics.authenticityScore.toFixed(1)}%, Deepfake Risk: ${result.metrics.deepfakeProbability.toFixed(1)}%, ML Accuracy: ${result.metrics.mlAccuracy.toFixed(1)}%. ${result.metrics.deepfakeProbability < 10 ? 'Very low deepfake probability.' : result.metrics.deepfakeProbability < 20 ? 'Low deepfake risk detected.' : 'Moderate deepfake risk - recommend further investigation.'}`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, scanMessage])
    }, 2500)
  }

  function handleResetScan() {
    setFile(null)
    setFilePreviewUrl(null)
    setAnalysis(null)
    setScanning(false)
  }

  function handleSendMessage() {
    if (!input.trim() || sending) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)

    // Generate mock response based on keywords
    setTimeout(() => {
      let response = ''

      const lowerInput = input.toLowerCase()

      if (lowerInput.includes('authentic') || lowerInput.includes('manipulat') || lowerInput.includes('real')) {
        if (analysis) {
          response = `Based on the forensic scan, the authenticity score is ${analysis.metrics.authenticityScore.toFixed(1)}%. The manipulation probability is ${analysis.metrics.manipulationProbability.toFixed(1)}%, which is ${analysis.metrics.manipulationProbability < 20 ? 'relatively low' : 'elevated'}. ${analysis.findings[0] || 'Further analysis recommended.'}`
        } else {
          response = 'Please upload and scan media first to analyze authenticity.'
        }
      } else if (lowerInput.includes('when') || lowerInput.includes('time')) {
        if (analysis) {
          const timePrediction = analysis.predictions.find(p => p.label.toLowerCase().includes('temporal'))
          response = timePrediction
            ? timePrediction.description
            : `The file was created at ${new Date(analysis.timestamp).toLocaleString()}. Metadata analysis shows ${analysis.metadata.duration || 'standard timestamp data'}.`
        } else {
          response = 'Upload media to perform temporal analysis.'
        }
      } else if (lowerInput.includes('where') || lowerInput.includes('location')) {
        if (analysis) {
          const locationPrediction = analysis.predictions.find(p => p.label.toLowerCase().includes('location'))
          response = locationPrediction
            ? locationPrediction.description
            : 'No specific location data could be extracted from this evidence.'
        } else {
          response = 'Upload media to analyze location data.'
        }
      } else if (lowerInput.includes('help') || lowerInput.includes('what can')) {
        response = 'I can help you analyze uploaded media evidence. You can ask about authenticity, manipulation detection, temporal analysis, location identification, or any findings from the forensic scan. Note: Full AI capabilities will be available when the backend is integrated.'
      } else {
        response = analysis
          ? `I've analyzed "${analysis.fileName}". The quality score is ${analysis.metrics.qualityScore.toFixed(1)}%. You can ask me about specific aspects like authenticity, timeline, or location details. What would you like to know?`
          : 'Please upload media evidence first, then I can help you analyze it. You can also ask general questions about the case evidence.'
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setSending(false)
    }, 800)
  }

  function getMetricColor(score: number): string {
    if (score > 80) return 'text-[#6aad6e] border-[#6aad6e]/30 bg-[#6aad6e]/10'
    if (score > 50) return 'text-[#A17120] border-[#A17120]/30 bg-[#A17120]/10'
    return 'text-[#c45c5c] border-[#c45c5c]/30 bg-[#c45c5c]/10'
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main Area - Left */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0a0602]">
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Upload State */}
            {!file && !scanning && !analysis && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-2xl">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-border bg-card/50 p-12 transition-colors hover:border-[#764608]/40"
                  >
                    <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 font-sans text-lg text-foreground">Upload Media Evidence</p>
                    <p className="font-sans text-sm text-muted-foreground">
                      Click to upload image, video, or audio file for forensic analysis
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      onChange={e => handleFileSelect(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Selected - Ready to Scan */}
            {file && !scanning && !analysis && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-2xl space-y-6">
                  {/* File Preview */}
                  <div className="rounded-sm border border-border bg-card p-6">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm bg-[#A17120]/10">
                        {file.type.startsWith('image/') && <ImageIcon className="h-8 w-8 text-[#A17120]" />}
                        {file.type.startsWith('video/') && <VideoIcon className="h-8 w-8 text-[#A17120]" />}
                        {file.type.startsWith('audio/') && <Music className="h-8 w-8 text-[#A17120]" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-sans text-lg font-semibold text-foreground">{file.name}</h3>
                        <p className="font-mono text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                        </p>
                      </div>
                      <button
                        onClick={handleResetScan}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Media Preview */}
                    {filePreviewUrl && file && (
                      <div className="mb-4 overflow-hidden rounded-sm bg-[#070401]">
                        {file.type.startsWith('image/') && (
                          <img src={filePreviewUrl} alt="Preview" className="max-h-64 w-full object-contain" />
                        )}
                        {file.type.startsWith('video/') && (
                          <video
                            src={filePreviewUrl}
                            controls
                            className="max-h-64 w-full"
                            preload="metadata"
                          >
                            Your browser does not support video playback.
                          </video>
                        )}
                        {file.type.startsWith('audio/') && (
                          <div className="flex items-center justify-center p-8">
                            <audio
                              src={filePreviewUrl}
                              controls
                              className="w-full"
                              preload="metadata"
                            >
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Scan Button with Animation */}
                  <button
                    onClick={handleScanForensics}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-sm bg-[#A17120] px-6 py-3 font-sans text-sm font-semibold text-[#070401] transition-all hover:bg-[#A17120]/90 animate-pulse-glow"
                  >
                    <Scan className="h-4 w-4 transition-transform group-hover:rotate-12" />
                    Scan Forensics
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-[#A17120]/20 to-transparent animate-shimmer" />
                  </button>
                </div>
              </div>
            )}

            {/* Scanning State */}
            {scanning && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-[#A17120]" />
                    <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-[#A17120]/20" />
                  </div>
                  <p className="font-sans text-sm text-foreground">Analyzing forensic data...</p>
                  <p className="font-mono text-xs text-muted-foreground/60">Scanning for authenticity markers</p>
                </div>
              </div>
            )}

            {/* Results State */}
            {analysis && !scanning && (
              <div className="space-y-6 pb-6">
                {/* File Info Header */}
                <div className="rounded-sm border border-border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#A17120]/10">
                      {analysis.fileType === 'image' && <ImageIcon className="h-6 w-6 text-[#A17120]" />}
                      {analysis.fileType === 'video' && <VideoIcon className="h-6 w-6 text-[#A17120]" />}
                      {analysis.fileType === 'audio' && <Music className="h-6 w-6 text-[#A17120]" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-sans text-base font-semibold text-foreground">{analysis.fileName}</h3>
                      <p className="font-mono text-xs text-muted-foreground">
                        Scan ID: {analysis.scanId}
                      </p>
                    </div>
                    <button
                      onClick={handleResetScan}
                      className="rounded-sm border border-border bg-card px-4 py-2 font-sans text-xs text-muted-foreground transition-colors hover:bg-[#A17120]/10 hover:text-[#A17120]"
                    >
                      Scan New File
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    Forensic Metrics & ML Analysis
                  </h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    {/* Row 1: Primary Metrics */}
                    <div className={`rounded-sm border p-4 ${getMetricColor(analysis.metrics.authenticityScore)}`}>
                      <p className="mb-1 font-mono text-xs uppercase tracking-wider opacity-70">Authenticity Score</p>
                      <p className="font-sans text-2xl font-bold">{analysis.metrics.authenticityScore.toFixed(1)}%</p>
                    </div>
                    <div className={`rounded-sm border p-4 ${getMetricColor(100 - analysis.metrics.deepfakeProbability)}`}>
                      <p className="mb-1 font-mono text-xs uppercase tracking-wider opacity-70">Deepfake Risk</p>
                      <p className="font-sans text-2xl font-bold">{analysis.metrics.deepfakeProbability.toFixed(1)}%</p>
                      <p className="mt-1 font-mono text-xs opacity-60">
                        {analysis.metrics.deepfakeProbability < 10 ? 'Very Low' : analysis.metrics.deepfakeProbability < 20 ? 'Low' : 'Moderate'}
                      </p>
                    </div>
                    <div className={`rounded-sm border p-4 ${getMetricColor(100 - analysis.metrics.manipulationProbability)}`}>
                      <p className="mb-1 font-mono text-xs uppercase tracking-wider opacity-70">Manipulation Risk</p>
                      <p className="font-sans text-2xl font-bold">{analysis.metrics.manipulationProbability.toFixed(1)}%</p>
                    </div>

                    {/* Row 2: Secondary Metrics */}
                    <div className={`rounded-sm border p-4 ${getMetricColor(analysis.metrics.qualityScore)}`}>
                      <p className="mb-1 font-mono text-xs uppercase tracking-wider opacity-70">Quality Score</p>
                      <p className="font-sans text-2xl font-bold">{analysis.metrics.qualityScore.toFixed(1)}%</p>
                    </div>
                    <div className={`rounded-sm border p-4 ${getMetricColor(analysis.metrics.mlAccuracy)}`}>
                      <p className="mb-1 font-mono text-xs uppercase tracking-wider opacity-70">ML Model Accuracy</p>
                      <p className="font-sans text-2xl font-bold">{analysis.metrics.mlAccuracy.toFixed(1)}%</p>
                      <p className="mt-1 font-mono text-xs opacity-60">
                        {analysis.metrics.mlAccuracy > 95 ? 'Excellent' : analysis.metrics.mlAccuracy > 90 ? 'Very Good' : 'Good'}
                      </p>
                    </div>
                    <div className="rounded-sm border border-border bg-card/30 p-4">
                      <p className="mb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground opacity-70">Overall Status</p>
                      <p className="font-sans text-lg font-bold text-foreground">
                        {analysis.metrics.authenticityScore > 80 && analysis.metrics.deepfakeProbability < 20
                          ? '✓ Likely Authentic'
                          : analysis.metrics.authenticityScore > 60
                          ? '⚠ Needs Review'
                          : '✗ High Suspicion'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Predictions */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Analysis Predictions
                  </h4>
                  <div className="space-y-3">
                    {analysis.predictions.map((prediction, idx) => (
                      <div key={idx} className="rounded-sm border border-border bg-card p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h5 className="font-sans text-sm font-semibold text-foreground">{prediction.label}</h5>
                          <span className="font-mono text-xs text-[#A17120]">
                            {prediction.confidence.toFixed(1)}% confidence
                          </span>
                        </div>
                        <p className="font-sans text-sm text-muted-foreground">{prediction.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div>
                  <h4 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    File Metadata
                  </h4>
                  <div className="rounded-sm border border-border bg-card p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">File Size</p>
                        <p className="font-sans text-sm text-foreground">{analysis.metadata.fileSize}</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">Format</p>
                        <p className="font-sans text-sm text-foreground">{analysis.metadata.format}</p>
                      </div>
                      {analysis.metadata.dimensions && (
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">Dimensions</p>
                          <p className="font-sans text-sm text-foreground">{analysis.metadata.dimensions}</p>
                        </div>
                      )}
                      {analysis.metadata.duration && (
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">Duration</p>
                          <p className="font-sans text-sm text-foreground">{analysis.metadata.duration}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <h4 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Key Findings
                  </h4>
                  <div className="rounded-sm border border-border bg-card p-4">
                    <ul className="space-y-2">
                      {analysis.findings.map((finding, idx) => (
                        <li key={idx} className="flex gap-2 font-sans text-sm text-foreground">
                          <span className="text-[#A17120]">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chatbot Sidebar - Right */}
      <div className="flex w-[380px] flex-col border-l border-border bg-[#0d0804]">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#A17120]" />
            <h3 className="font-sans text-base font-semibold text-foreground">Evidence Assistant</h3>
          </div>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            Ask questions about the forensic analysis
          </p>
        </div>

        {/* Message History */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-sm p-3 ${
                    message.role === 'user'
                      ? 'bg-[#A17120]/10 border border-[#A17120]/20'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="font-sans text-sm text-foreground">{message.content}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground/60">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask about the evidence..."
              rows={2}
              className="flex-1 resize-none rounded-sm border border-border bg-card px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-[#764608] focus:outline-none focus:ring-1 focus:ring-[#764608]/40"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || sending}
              className="flex h-auto items-center justify-center rounded-sm bg-[#A17120] px-4 text-[#070401] transition-all hover:bg-[#A17120]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 font-sans text-xs text-muted-foreground/60">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
