'use client'

import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
  originX: number
  originY: number
  active: number
  closest: Point[]
  circle: Circle
  vx?: number
  vy?: number
}

class Circle {
  pos: Point
  radius: number
  color: string
  active: number

  constructor(pos: Point, rad: number, color: string) {
    this.pos = pos
    this.radius = rad
    this.color = color
    this.active = 0
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = `rgba(212, 175, 55, ${this.active})`
    ctx.fill()
  }
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    const target = { x: width / 2, y: height / 2 }
    let animateHeader = true

    canvas.width = width
    canvas.height = height

    // Create points
    const points: Point[] = []
    for (let x = 0; x < width; x = x + width / 20) {
      for (let y = 0; y < height; y = y + height / 20) {
        const px = x + Math.random() * width / 20
        const py = y + Math.random() * height / 20
        const p = {
          x: px,
          originX: px,
          y: py,
          originY: py,
          active: 0,
          closest: [] as Point[],
          circle: null as any,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        }
        points.push(p)
      }
    }

    // Find 5 closest points for each point
    for (let i = 0; i < points.length; i++) {
      const closest: Point[] = []
      const p1 = points[i]
      for (let j = 0; j < points.length; j++) {
        const p2 = points[j]
        if (p1 !== p2) {
          let placed = false
          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (closest[k] === undefined) {
                closest[k] = p2
                placed = true
              }
            }
          }

          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                closest[k] = p2
                placed = true
              }
            }
          }
        }
      }
      p1.closest = closest
    }

    // Assign a circle to each point
    for (const point of points) {
      const c = new Circle(point, 2 + Math.random() * 2, 'rgba(212,175,55,0.3)')
      point.circle = c
    }

    function getDistance(p1: Point, p2: Point) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
    }

    function shiftPoint(p: Point) {
      const duration = 1000 + Math.random() * 1000
      const targetX = p.originX - 50 + Math.random() * 100
      const targetY = p.originY - 50 + Math.random() * 100
      const startX = p.x
      const startY = p.y
      const startTime = Date.now()

      function update() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeInOutCirc(progress)

        p.x = startX + (targetX - startX) * eased
        p.y = startY + (targetY - startY) * eased

        if (progress < 1) {
          requestAnimationFrame(update)
        } else {
          shiftPoint(p)
        }
      }

      update()
    }

    function easeInOutCirc(t: number): number {
      return t < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2
    }

    function drawLines(p: Point) {
      if (!p.active) return
      for (const closest of p.closest) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(closest.x, closest.y)
        ctx.strokeStyle = `rgba(161, 113, 32, ${p.active})`
        ctx.stroke()
      }
    }

    function animate() {
      if (animateHeader) {
        ctx.clearRect(0, 0, width, height)
        for (const point of points) {
          // Detect points in range
          const dist = Math.abs(getDistance(target, point))
          if (dist < 4000) {
            point.active = 0.3
            point.circle.active = 0.6
          } else if (dist < 20000) {
            point.active = 0.1
            point.circle.active = 0.3
          } else if (dist < 40000) {
            point.active = 0.02
            point.circle.active = 0.1
          } else {
            point.active = 0
            point.circle.active = 0
          }

          drawLines(point)
          point.circle.draw(ctx)
        }
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize animation
    for (const point of points) {
      shiftPoint(point)
    }
    animate()

    // Event listeners
    function mouseMove(e: MouseEvent) {
      let posx = 0
      let posy = 0
      if (e.pageX || e.pageY) {
        posx = e.pageX
        posy = e.pageY
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
      }
      target.x = posx
      target.y = posy
    }

    function scrollCheck() {
      if (document.body.scrollTop > height) {
        animateHeader = false
      } else {
        animateHeader = true
      }
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    if (!('ontouchstart' in window)) {
      window.addEventListener('mousemove', mouseMove)
    }
    window.addEventListener('scroll', scrollCheck)
    window.addEventListener('resize', resize)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('scroll', scrollCheck)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.4 }}
    />
  )
}
