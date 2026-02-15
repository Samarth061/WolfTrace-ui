'use client'

export function NoirSeparator() {
  return (
    <div className="relative h-32 overflow-hidden">
      {/* Animated fog effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#1a1410]/80 to-background">
        <div className="absolute inset-0 animate-pulse-slow opacity-40">
          <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-[#764608]/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#A17120]/20 via-transparent to-transparent blur-3xl" />
        </div>
      </div>

      {/* Streetlight glow sweeping effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="animate-sweep absolute left-0 top-0 h-full w-96 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent blur-2xl" />
      </div>

      {/* Rain effect (vertical lines) */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="animate-rain absolute top-0 w-px bg-gradient-to-b from-transparent via-[#A17120]/40 to-transparent"
            style={{
              left: `${(i + 1) * 8}%`,
              height: '100%',
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${2 + (i % 3) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Film grain texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-40 mix-blend-overlay" />

      {/* Divider line with glow */}
      <div className="absolute left-1/2 top-1/2 w-64 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-[#A17120] to-transparent blur-sm" />
          <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
        </div>
        {/* Corner brackets */}
        <div className="absolute -left-8 -top-2 h-4 w-4 border-l-2 border-t-2 border-[#A17120]/40" />
        <div className="absolute -right-8 -top-2 h-4 w-4 border-r-2 border-t-2 border-[#A17120]/40" />
        <div className="absolute -bottom-2 -left-8 h-4 w-4 border-b-2 border-l-2 border-[#A17120]/40" />
        <div className="absolute -bottom-2 -right-8 h-4 w-4 border-b-2 border-r-2 border-[#A17120]/40" />
      </div>

      {/* Spotlight effect */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#A17120]/10 via-transparent to-transparent blur-xl animate-pulse-slow" />
    </div>
  )
}
