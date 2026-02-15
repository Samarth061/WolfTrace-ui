'use client'

export function LightningSeparator() {
  return (
    <div className="relative h-40 overflow-hidden bg-gradient-to-b from-background via-[#0a0806] to-background">
      {/* Dark rain atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1410]/60 to-transparent" />

      {/* Vertical rain lines */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-[#764608]/30 to-transparent"
            style={{
              left: `${i * 5}%`,
              animationDelay: `${i * 0.1}s`,
              animation: 'rain 1.5s linear infinite',
            }}
          />
        ))}
      </div>

      {/* Realistic thin lightning bolts */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
        {/* Lightning bolt 1 - Thin jagged line */}
        <path
          className="lightning-bolt"
          d="M 0,100 L 150,95 L 180,110 L 250,90 L 320,105 L 400,85 L 500,95 L 650,80 L 750,90 L 850,85 L 1000,90"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
          opacity="0"
          style={{
            filter: 'drop-shadow(0 0 3px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))',
            animation: 'flash1 3s ease-in-out infinite'
          }}
        />

        {/* Lightning bolt 2 - Another path */}
        <path
          className="lightning-bolt"
          d="M 0,110 L 120,115 L 200,105 L 300,120 L 450,100 L 600,115 L 780,105 L 900,110 L 1000,105"
          fill="none"
          stroke="#A17120"
          strokeWidth="1"
          opacity="0"
          style={{
            filter: 'drop-shadow(0 0 3px rgba(161, 113, 32, 0.9)) drop-shadow(0 0 6px rgba(161, 113, 32, 0.5))',
            animation: 'flash2 3s ease-in-out infinite 1s'
          }}
        />

        {/* Lightning bolt 3 - Forked lightning */}
        <path
          className="lightning-bolt"
          d="M 50,90 L 200,85 L 350,95 L 500,80 L 650,90 L 800,85 L 950,95 M 500,80 L 520,110"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.8"
          opacity="0"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 1)) drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))',
            animation: 'flash3 3s ease-in-out infinite 2s'
          }}
        />
      </svg>

      {/* Flash overlay for realistic lightning effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.03) 0%, transparent 70%)',
          animation: 'screenFlash 3s ease-in-out infinite'
        }}
      />

      {/* Film grain texture */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />

      <style jsx>{`
        @keyframes flash1 {
          0%, 10%, 100% { opacity: 0; }
          5% { opacity: 1; }
          7% { opacity: 0.3; }
          9% { opacity: 0.8; }
        }

        @keyframes flash2 {
          0%, 15%, 100% { opacity: 0; }
          8% { opacity: 0.9; }
          10% { opacity: 0.2; }
          12% { opacity: 1; }
        }

        @keyframes flash3 {
          0%, 20%, 100% { opacity: 0; }
          13% { opacity: 1; }
          15% { opacity: 0.4; }
          17% { opacity: 0.9; }
          19% { opacity: 0.3; }
        }

        @keyframes screenFlash {
          0%, 20%, 100% { opacity: 0; }
          5%, 8%, 13% { opacity: 0.15; }
        }
      `}</style>
    </div>
  )
}
