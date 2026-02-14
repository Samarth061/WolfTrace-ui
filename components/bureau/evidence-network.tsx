'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { Evidence, EvidenceConnection } from '@/lib/types'

const typeIcons: Record<string, string> = {
  text: 'T',
  image: 'I',
  video: 'V',
}

const authenticityColors: Record<string, { fill: string; stroke: string; glow: string }> = {
  verified: { fill: '#1a3a1a', stroke: '#6aad6e', glow: 'rgba(106, 173, 110, 0.3)' },
  suspicious: { fill: '#3a1a1a', stroke: '#c45c5c', glow: 'rgba(196, 92, 92, 0.3)' },
  unknown: { fill: '#2a2010', stroke: '#A17120', glow: 'rgba(161, 113, 32, 0.2)' },
}

const relationColors: Record<string, string> = {
  supports: '#6aad6e',
  contradicts: '#c45c5c',
  related: '#A17120',
}

interface Node {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  evidence: Evidence
  radius: number
}

interface Props {
  evidence: Evidence[]
  connections: EvidenceConnection[]
  selectedId: string | null
  onSelect: (ev: Evidence) => void
}

export function EvidenceNetwork({ evidence, connections, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animRef = useRef<number>(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const dragRef = useRef<{ nodeId: string | null; offsetX: number; offsetY: number }>({ nodeId: null, offsetX: 0, offsetY: 0 })
  const panRef = useRef({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const lastPanPosRef = useRef({ x: 0, y: 0 })
  const [, forceUpdate] = useState(0)

  // Initialize nodes in a circle layout
  useEffect(() => {
    const cx = 400
    const cy = 300
    const radius = Math.min(200, evidence.length * 30)

    nodesRef.current = evidence.map((ev, i) => {
      const angle = (2 * Math.PI * i) / evidence.length
      return {
        id: ev.id,
        x: cx + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: cy + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        evidence: ev,
        radius: ev.reviewed ? 24 : 20,
      }
    })
    forceUpdate(n => n + 1)
  }, [evidence])

  // Force simulation and rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    let iteration = 0
    const maxIterations = 200

    function simulate() {
      const nodes = nodesRef.current
      if (iteration < maxIterations) {
        const alpha = 1 - iteration / maxIterations

        // Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x
            const dy = nodes[j].y - nodes[i].y
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
            const force = (alpha * 800) / (dist * dist)
            const fx = (dx / dist) * force
            const fy = (dy / dist) * force
            nodes[i].vx -= fx
            nodes[i].vy -= fy
            nodes[j].vx += fx
            nodes[j].vy += fy
          }
        }

        // Attraction along edges
        for (const conn of connections) {
          const a = nodes.find(n => n.id === conn.fromId)
          const b = nodes.find(n => n.id === conn.toId)
          if (!a || !b) continue
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const force = alpha * (dist - 120) * 0.01
          const fx = (dx / Math.max(dist, 1)) * force
          const fy = (dy / Math.max(dist, 1)) * force
          a.vx += fx
          a.vy += fy
          b.vx -= fx
          b.vy -= fy
        }

        // Center gravity
        const centerX = canvas!.getBoundingClientRect().width / 2 - panRef.current.x
        const centerY = canvas!.getBoundingClientRect().height / 2 - panRef.current.y
        for (const node of nodes) {
          node.vx += (centerX - node.x) * alpha * 0.002
          node.vy += (centerY - node.y) * alpha * 0.002
        }

        // Apply velocities with damping
        for (const node of nodes) {
          if (dragRef.current.nodeId === node.id) continue
          node.vx *= 0.7
          node.vy *= 0.7
          node.x += node.vx
          node.y += node.vy
        }

        iteration++
      }

      draw()
      animRef.current = requestAnimationFrame(simulate)
    }

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.getBoundingClientRect().width
      const h = canvas.getBoundingClientRect().height
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.translate(panRef.current.x, panRef.current.y)

      const nodes = nodesRef.current

      // Draw edges
      for (const conn of connections) {
        const a = nodes.find(n => n.id === conn.fromId)
        const b = nodes.find(n => n.id === conn.toId)
        if (!a || !b) continue

        const color = relationColors[conn.relation] || '#764608'
        const isHighlighted = selectedId && (conn.fromId === selectedId || conn.toId === selectedId)

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = color
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2
        ctx.globalAlpha = isHighlighted ? 0.9 : 0.4
        if (conn.relation === 'contradicts') {
          ctx.setLineDash([6, 4])
        } else if (conn.relation === 'related') {
          ctx.setLineDash([3, 3])
        } else {
          ctx.setLineDash([])
        }
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1

        // Arrow at midpoint
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const angle = Math.atan2(b.y - a.y, b.x - a.x)
        ctx.save()
        ctx.translate(mx, my)
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.moveTo(6, 0)
        ctx.lineTo(-3, -3)
        ctx.lineTo(-3, 3)
        ctx.closePath()
        ctx.fillStyle = color
        ctx.globalAlpha = isHighlighted ? 0.8 : 0.3
        ctx.fill()
        ctx.restore()
      }

      // Draw nodes
      for (const node of nodes) {
        const colors = authenticityColors[node.evidence.authenticity] || authenticityColors.unknown
        const isSelected = node.id === selectedId
        const isHovered = node.id === hoveredId
        const isConnectedToSelected = selectedId && connections.some(
          c => (c.fromId === selectedId && c.toId === node.id) || (c.toId === selectedId && c.fromId === node.id)
        )
        const dimmed = selectedId && !isSelected && !isConnectedToSelected

        // Glow for selected/hovered
        if (isSelected || isHovered) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2)
          ctx.fillStyle = colors.glow
          ctx.fill()
        }

        // Unreviewed pulse ring
        if (!node.evidence.reviewed) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2)
          ctx.strokeStyle = '#A17120'
          ctx.lineWidth = 1
          ctx.globalAlpha = 0.4 + 0.2 * Math.sin(Date.now() / 500)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = colors.fill
        ctx.globalAlpha = dimmed ? 0.3 : 1
        ctx.fill()
        ctx.strokeStyle = isSelected ? '#fff' : colors.stroke
        ctx.lineWidth = isSelected ? 2.5 : 1.5
        ctx.stroke()

        // Type icon
        ctx.fillStyle = colors.stroke
        ctx.font = `bold ${node.radius * 0.7}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(typeIcons[node.evidence.type] || '?', node.x, node.y)
        ctx.globalAlpha = 1

        // Title label below node
        ctx.fillStyle = dimmed ? 'rgba(161,113,32,0.3)' : '#C4A265'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        const label = node.evidence.title.length > 22 ? node.evidence.title.slice(0, 20) + '...' : node.evidence.title
        ctx.fillText(label, node.x, node.y + node.radius + 14)
      }

      ctx.restore()
    }

    simulate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [evidence, connections, selectedId, hoveredId])

  const getNodeAtPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left - panRef.current.x
    const y = clientY - rect.top - panRef.current.y

    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const node = nodesRef.current[i]
      const dx = x - node.x
      const dy = y - node.y
      if (dx * dx + dy * dy < node.radius * node.radius) {
        return node
      }
    }
    return null
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const node = getNodeAtPos(e.clientX, e.clientY)
    if (node) {
      const rect = canvasRef.current!.getBoundingClientRect()
      dragRef.current = {
        nodeId: node.id,
        offsetX: e.clientX - rect.left - panRef.current.x - node.x,
        offsetY: e.clientY - rect.top - panRef.current.y - node.y,
      }
    } else {
      isPanningRef.current = true
      lastPanPosRef.current = { x: e.clientX, y: e.clientY }
    }
  }, [getNodeAtPos])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.nodeId) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const node = nodesRef.current.find(n => n.id === dragRef.current.nodeId)
      if (node) {
        node.x = e.clientX - rect.left - panRef.current.x - dragRef.current.offsetX
        node.y = e.clientY - rect.top - panRef.current.y - dragRef.current.offsetY
        node.vx = 0
        node.vy = 0
      }
    } else if (isPanningRef.current) {
      const dx = e.clientX - lastPanPosRef.current.x
      const dy = e.clientY - lastPanPosRef.current.y
      panRef.current.x += dx
      panRef.current.y += dy
      lastPanPosRef.current = { x: e.clientX, y: e.clientY }
    } else {
      const node = getNodeAtPos(e.clientX, e.clientY)
      setHoveredId(node?.id || null)
    }
  }, [getNodeAtPos])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragRef.current.nodeId) {
      // If barely moved, treat as click
      const node = nodesRef.current.find(n => n.id === dragRef.current.nodeId)
      if (node) {
        onSelect(node.evidence)
      }
    }
    dragRef.current = { nodeId: null, offsetX: 0, offsetY: 0 }
    isPanningRef.current = false
  }, [onSelect])

  return (
    <div className="relative h-full w-full grid-bg">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-sm border border-border bg-[#0d0804]/90 px-3 py-2 backdrop-blur-sm">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Legend</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-sm bg-[#6aad6e]" />
            <span className="font-mono text-[10px] text-[#6aad6e]">Supports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-sm bg-[#c45c5c]" style={{ background: 'repeating-linear-gradient(90deg, #c45c5c 0 3px, transparent 3px 6px)' }} />
            <span className="font-mono text-[10px] text-[#c45c5c]">Contradicts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-4 rounded-sm bg-[#A17120]" style={{ background: 'repeating-linear-gradient(90deg, #A17120 0 2px, transparent 2px 4px)' }} />
            <span className="font-mono text-[10px] text-[#A17120]">Related</span>
          </div>
          <div className="mt-1 border-t border-border pt-1.5 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-[#6aad6e] bg-[#1a3a1a]" />
            <span className="font-mono text-[10px] text-muted-foreground">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-[#c45c5c] bg-[#3a1a1a]" />
            <span className="font-mono text-[10px] text-muted-foreground">Suspicious</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-[#A17120] bg-[#2a2010]" />
            <span className="font-mono text-[10px] text-muted-foreground">Unknown</span>
          </div>
        </div>
      </div>
    </div>
  )
}
