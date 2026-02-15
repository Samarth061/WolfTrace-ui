'use client'

import { useEffect, useRef } from 'react'

export function SubwayTrain() {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Try to play train sound when component mounts
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.3 // Set volume to 30%
          await audioRef.current.play()
        } catch (err) {
          console.log('Audio autoplay prevented. Click anywhere to enable sound.')
        }
      }
    }

    playAudio()

    // Enable audio on first user interaction
    const enableAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(err => console.log('Could not play audio:', err))
      }
    }

    document.addEventListener('click', enableAudio, { once: true })

    return () => {
      document.removeEventListener('click', enableAudio)
    }
  }, [])

  return (
    <section className="relative px-6 py-0 -mt-32 -mb-0" aria-label="Subway train animation">
      {/* Train sound effect - Add your train sound file to /public/sounds/train.mp3 */}
      <audio
        ref={audioRef}
        src="/sounds/train.mp3"
        loop
        preload="auto"
        className="hidden"
      />
      <div className="mx-auto w-full max-w-none overflow-hidden">
        <svg
          version="1.1"
          id="subwayTrain"
          xmlns="http://www.w3.org/2000/svg"
          x="0"
          y="0"
          width="2800"
          height="400"
          viewBox="0 0 2800 400"
          className="block h-56 w-full md:h-64 lg:h-72"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Subway train animation"
        >
          <defs>
            <linearGradient id="trainBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C29D4B" />
              <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <filter id="trainShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2D1F0D" floodOpacity="0.4" />
            </filter>
          </defs>

          <style type="text/css">
            {`
              .train-body { fill: url(#trainBody); stroke: #5C4314; stroke-width: 2; }
              .train-window { fill: #1a1a1a; stroke: #3a3a3a; stroke-width: 1.5; }
              .train-door { fill: #8B6914; stroke: #5C4314; stroke-width: 2; }
              .train-door-line { stroke: #3a3a3a; stroke-width: 1; }
              .train-panel { fill: none; stroke: #3a3a3a; stroke-width: 0.8; opacity: 0.5; }
              .train-wheel { fill: #5a5a5a; stroke: #3a3a3a; stroke-width: 2; }
              .train-wheel-inner { fill: #3a3a3a; }
              .train-rail { fill: none; stroke: #2D1F0D; stroke-width: 3; }
              .train-connector { fill: #5C4314; stroke: #3a3a3a; stroke-width: 1.5; }

              /* Smoke puffs */
              .smoke {
                fill: #7a7a7a;
              }
              .smoke-light {
                fill: #9a9a9a;
              }

              @keyframes smokeFloat1 {
                0%, 100% { transform: translate(0, 0); opacity: 0.85; }
                25% { transform: translate(-3px, -10px); opacity: 0.75; }
                50% { transform: translate(2px, -20px); opacity: 0.65; }
                75% { transform: translate(-2px, -30px); opacity: 0.55; }
              }

              @keyframes smokeFloat2 {
                0%, 100% { transform: translate(0, 0); opacity: 0.8; }
                25% { transform: translate(2px, -12px); opacity: 0.7; }
                50% { transform: translate(-3px, -24px); opacity: 0.6; }
                75% { transform: translate(1px, -36px); opacity: 0.5; }
              }

              @keyframes smokeFloat3 {
                0%, 100% { transform: translate(0, 0); opacity: 0.75; }
                25% { transform: translate(-2px, -15px); opacity: 0.65; }
                50% { transform: translate(3px, -30px); opacity: 0.55; }
                75% { transform: translate(-1px, -45px); opacity: 0.45; }
              }

              .smoke-anim-1 { animation: smokeFloat1 4s ease-in-out infinite; }
              .smoke-anim-2 { animation: smokeFloat2 5s ease-in-out infinite; }
              .smoke-anim-3 { animation: smokeFloat3 6s ease-in-out infinite; }
            `}
          </style>

          {/* Rails */}
          <line className="train-rail" x1="0" y1="320" x2="2800" y2="320" />
          <line className="train-rail" x1="0" y1="335" x2="2800" y2="335" />

          <g filter="url(#trainShadow)">
            <g>
              {/* CAR 1 (Front) */}
              <g id="car1">
                {/* Main body */}
                <rect className="train-body" x="50" y="200" width="800" height="100" rx="6" />

                {/* Top roof line */}
                <rect className="train-body" x="50" y="195" width="800" height="5" rx="2" />

                {/* Front nose */}
                <path className="train-body" d="M 50 200 L 50 300 L 35 290 L 35 215 L 50 200 Z" />

                {/* Windows - 9 windows */}
                <rect className="train-window" x="80" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="165" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="250" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="335" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="420" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="505" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="590" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="675" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="760" y="220" width="70" height="40" rx="2" />

                {/* Doors */}
                <rect className="train-door" x="145" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="155" y1="225" x2="155" y2="285" />
                <line className="train-door-line" x1="170" y1="225" x2="170" y2="285" />

                <rect className="train-door" x="395" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="405" y1="225" x2="405" y2="285" />
                <line className="train-door-line" x1="420" y1="225" x2="420" y2="285" />

                <rect className="train-door" x="645" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="655" y1="225" x2="655" y2="285" />
                <line className="train-door-line" x1="670" y1="225" x2="670" y2="285" />

                {/* Ribbed lower section */}
                <line className="train-panel" x1="50" y1="270" x2="850" y2="270" />
                {Array.from({ length: 40 }).map((_, i) => (
                  <line
                    key={`panel1-${i}`}
                    className="train-panel"
                    x1={50 + i * 20}
                    y1="270"
                    x2={50 + i * 20}
                    y2="300"
                  />
                ))}

                {/* Wheels */}
                <g>
                  <circle className="train-wheel" cx="150" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="150" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="150" cy="310" r="3" />

                  <circle className="train-wheel" cx="300" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="300" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="300" cy="310" r="3" />

                  <circle className="train-wheel" cx="550" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="550" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="550" cy="310" r="3" />

                  <circle className="train-wheel" cx="700" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="700" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="700" cy="310" r="3" />
                </g>

                {/* Headlights */}
                <circle cx="40" cy="230" r="5" fill="#A17120" opacity="0.95" />
                <circle cx="40" cy="270" r="5" fill="#A17120" opacity="0.95" />

                {/* Undercarriage */}
                <rect className="train-body" x="50" y="300" width="800" height="6" />
              </g>

              {/* Connector */}
              <rect className="train-connector" x="845" y="245" width="25" height="25" rx="3" />
              <circle cx="857" cy="257" r="6" fill="#3a3a3a" />

              {/* CAR 2 (Middle) */}
              <g id="car2">
                {/* Main body */}
                <rect className="train-body" x="865" y="200" width="800" height="100" rx="6" />

                {/* Top roof line */}
                <rect className="train-body" x="865" y="195" width="800" height="5" rx="2" />

                {/* Windows - 9 windows */}
                <rect className="train-window" x="895" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="980" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1065" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1150" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1235" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1320" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1405" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1490" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1575" y="220" width="70" height="40" rx="2" />

                {/* Doors */}
                <rect className="train-door" x="960" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="970" y1="225" x2="970" y2="285" />
                <line className="train-door-line" x1="985" y1="225" x2="985" y2="285" />

                <rect className="train-door" x="1210" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="1220" y1="225" x2="1220" y2="285" />
                <line className="train-door-line" x1="1235" y1="225" x2="1235" y2="285" />

                <rect className="train-door" x="1460" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="1470" y1="225" x2="1470" y2="285" />
                <line className="train-door-line" x1="1485" y1="225" x2="1485" y2="285" />

                {/* Ribbed lower section */}
                <line className="train-panel" x1="865" y1="270" x2="1665" y2="270" />
                {Array.from({ length: 40 }).map((_, i) => (
                  <line
                    key={`panel2-${i}`}
                    className="train-panel"
                    x1={865 + i * 20}
                    y1="270"
                    x2={865 + i * 20}
                    y2="300"
                  />
                ))}

                {/* Wheels */}
                <g>
                  <circle className="train-wheel" cx="965" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="965" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="965" cy="310" r="3" />

                  <circle className="train-wheel" cx="1115" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="1115" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="1115" cy="310" r="3" />

                  <circle className="train-wheel" cx="1365" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="1365" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="1365" cy="310" r="3" />

                  <circle className="train-wheel" cx="1515" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="1515" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="1515" cy="310" r="3" />
                </g>

                {/* Undercarriage */}
                <rect className="train-body" x="865" y="300" width="800" height="6" />
              </g>

              {/* Connector */}
              <rect className="train-connector" x="1660" y="245" width="25" height="25" rx="3" />
              <circle cx="1672" cy="257" r="6" fill="#3a3a3a" />

              {/* CAR 3 (Rear) */}
              <g id="car3">
                {/* Main body */}
                <rect className="train-body" x="1680" y="200" width="800" height="100" rx="6" />

                {/* Top roof line */}
                <rect className="train-body" x="1680" y="195" width="800" height="5" rx="2" />

                {/* Rear end */}
                <path className="train-body" d="M 2480 200 L 2480 300 L 2495 290 L 2495 215 L 2480 200 Z" />

                {/* Windows - 9 windows */}
                <rect className="train-window" x="1710" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1795" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1880" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="1965" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="2050" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="2135" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="2220" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="2305" y="220" width="70" height="40" rx="2" />
                <rect className="train-window" x="2390" y="220" width="70" height="40" rx="2" />

                {/* Doors */}
                <rect className="train-door" x="1775" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="1785" y1="225" x2="1785" y2="285" />
                <line className="train-door-line" x1="1800" y1="225" x2="1800" y2="285" />

                <rect className="train-door" x="2025" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="2035" y1="225" x2="2035" y2="285" />
                <line className="train-door-line" x1="2050" y1="225" x2="2050" y2="285" />

                <rect className="train-door" x="2275" y="220" width="35" height="70" rx="1" />
                <line className="train-door-line" x1="2285" y1="225" x2="2285" y2="285" />
                <line className="train-door-line" x1="2300" y1="225" x2="2300" y2="285" />

                {/* Ribbed lower section */}
                <line className="train-panel" x1="1680" y1="270" x2="2480" y2="270" />
                {Array.from({ length: 40 }).map((_, i) => (
                  <line
                    key={`panel3-${i}`}
                    className="train-panel"
                    x1={1680 + i * 20}
                    y1="270"
                    x2={1680 + i * 20}
                    y2="300"
                  />
                ))}

                {/* Wheels */}
                <g>
                  <circle className="train-wheel" cx="1780" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="1780" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="1780" cy="310" r="3" />

                  <circle className="train-wheel" cx="1930" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="1930" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="1930" cy="310" r="3" />

                  <circle className="train-wheel" cx="2180" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="2180" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="2180" cy="310" r="3" />

                  <circle className="train-wheel" cx="2330" cy="310" r="16" />
                  <circle className="train-wheel-inner" cx="2330" cy="310" r="8" />
                  <circle className="train-wheel-inner" cx="2330" cy="310" r="3" />
                </g>

                {/* Taillights */}
                <circle cx="2490" cy="230" r="5" fill="#c45c5c" opacity="0.95" />
                <circle cx="2490" cy="270" r="5" fill="#c45c5c" opacity="0.95" />

                {/* Engine smokestack at the rear */}
                <rect className="train-body" x="2430" y="180" width="14" height="20" rx="2" />

                {/* Floating smoke trail with realistic movement */}
                <g className="smoke-anim-1">
                  <circle className="smoke" cx="2437" cy="172" r="5" />
                  <circle className="smoke-light" cx="2437" cy="172" r="3" />
                </g>

                <g className="smoke-anim-2" style={{ animationDelay: '0.3s' }}>
                  <circle className="smoke" cx="2434" cy="160" r="7" />
                  <circle className="smoke-light" cx="2434" cy="160" r="4" />
                </g>

                <g className="smoke-anim-3" style={{ animationDelay: '0.6s' }}>
                  <circle className="smoke" cx="2430" cy="146" r="9" />
                  <circle className="smoke-light" cx="2430" cy="146" r="5.5" />
                </g>

                <g className="smoke-anim-1" style={{ animationDelay: '0.9s' }}>
                  <circle className="smoke" cx="2426" cy="130" r="11" />
                  <circle className="smoke-light" cx="2426" cy="130" r="7" />
                </g>

                <g className="smoke-anim-2" style={{ animationDelay: '1.2s' }}>
                  <circle className="smoke" cx="2421" cy="112" r="13" />
                  <circle className="smoke-light" cx="2421" cy="112" r="8.5" />
                </g>

                <g className="smoke-anim-3" style={{ animationDelay: '1.5s' }}>
                  <circle className="smoke" cx="2416" cy="92" r="15" />
                  <circle className="smoke-light" cx="2416" cy="92" r="10" />
                </g>

                <g className="smoke-anim-1" style={{ animationDelay: '1.8s' }}>
                  <circle className="smoke" cx="2410" cy="70" r="17" />
                  <circle className="smoke-light" cx="2410" cy="70" r="11.5" />
                </g>

                <g className="smoke-anim-2" style={{ animationDelay: '2.1s' }}>
                  <circle className="smoke" cx="2404" cy="47" r="19" />
                  <circle className="smoke-light" cx="2404" cy="47" r="13" />
                </g>

                <g className="smoke-anim-3" style={{ animationDelay: '2.4s' }}>
                  <circle className="smoke" cx="2398" cy="24" r="21" />
                  <circle className="smoke-light" cx="2398" cy="24" r="14.5" />
                </g>

                {/* Undercarriage */}
                <rect className="train-body" x="1680" y="300" width="800" height="6" />
              </g>

              {/* Animation */}
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                begin="0.5s"
                dur="10s"
                values="-2700 0; 3000 0"
                repeatCount="indefinite"
              />
            </g>
          </g>
        </svg>
      </div>
    </section>
  )
}
