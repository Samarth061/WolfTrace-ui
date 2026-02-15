'use client'

export function SubwayTrain() {
  return (
    <section className="relative px-6 py-0 -mt-32 -mb-0" aria-label="Subway train animation">
      <div className="mx-auto w-full max-w-none overflow-hidden">
        <svg
          version="1.1"
          id="subwayTrain"
          xmlns="http://www.w3.org/2000/svg"
          x="0"
          y="0"
          width="2993"
          height="560"
          viewBox="0 50 2993 480"
          enableBackground="new 0 0 2993 560"
          xmlSpace="preserve"
          className="block h-64 w-full md:h-80 lg:h-96"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Realistic vintage subway train animation"
        >
          <defs>
            {/* Enhanced Bronze/Gold Gradients */}
            <linearGradient id="trainBodyMain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C29D4B" />
              <stop offset="33%" stopColor="#A17120" />
              <stop offset="67%" stopColor="#8B6914" />
              <stop offset="100%" stopColor="#6B5010" />
            </linearGradient>

            <linearGradient id="trainHighlight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF7A" />
              <stop offset="100%" stopColor="#C29D4B" />
            </linearGradient>

            <linearGradient id="trainShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5C4314" />
              <stop offset="100%" stopColor="#2D1F0D" />
            </linearGradient>

            <radialGradient id="windowGlow">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#A17120" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#A17120" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="wheelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a5a5a" />
              <stop offset="100%" stopColor="#3a3a3a" />
            </linearGradient>

            {/* Filters */}
            <filter id="trainShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#2D1F0D" floodOpacity="0.5" />
            </filter>

            <filter id="weathering" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>
              <feColorMatrix in="noise" type="saturate" values="0"/>
              <feBlend in="SourceGraphic" in2="noise" mode="multiply" opacity="0.15"/>
            </filter>

            {/* Rivet Pattern */}
            <pattern id="rivetPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="20" r="1.5" fill="#5C4314" opacity="0.6"/>
              <circle cx="35" cy="20" r="1.5" fill="#5C4314" opacity="0.6"/>
            </pattern>

            {/* Reusable Wheel Symbol */}
            <symbol id="trainWheel" viewBox="0 0 30 30">
              <circle cx="15" cy="15" r="15" fill="url(#wheelGradient)" stroke="#2D1F0D" strokeWidth="1"/>
              <circle cx="15" cy="15" r="10" fill="none" stroke="#4A4A4A" strokeWidth="1.5"/>
              <line x1="15" y1="5" x2="15" y2="25" stroke="#4A4A4A" strokeWidth="1"/>
              <line x1="5" y1="15" x2="25" y2="15" stroke="#4A4A4A" strokeWidth="1"/>
              <line x1="8.5" y1="8.5" x2="21.5" y2="21.5" stroke="#4A4A4A" strokeWidth="1"/>
              <line x1="21.5" y1="8.5" x2="8.5" y2="21.5" stroke="#4A4A4A" strokeWidth="1"/>
              <circle cx="15" cy="15" r="3" fill="#2D1F0D"/>
            </symbol>

            {/* Bogie (wheel assembly) */}
            <symbol id="bogie" viewBox="0 0 120 50">
              {/* Axle frame */}
              <rect x="10" y="15" width="100" height="8" fill="#4A4A4A" stroke="#2D1F0D" strokeWidth="1"/>
              {/* Front axle */}
              <line x1="25" y1="35" x2="25" y2="19" stroke="#4A4A4A" strokeWidth="3"/>
              {/* Rear axle */}
              <line x1="95" y1="35" x2="95" y2="19" stroke="#4A4A4A" strokeWidth="3"/>
              {/* Wheels */}
              <use href="#trainWheel" x="10" y="20" width="30" height="30"/>
              <use href="#trainWheel" x="80" y="20" width="30" height="30"/>
              {/* Suspension springs */}
              <path d="M 30 19 Q 32 16 34 19 T 38 19" stroke="#5a5a5a" strokeWidth="1.5" fill="none"/>
              <path d="M 100 19 Q 102 16 104 19 T 108 19" stroke="#5a5a5a" strokeWidth="1.5" fill="none"/>
            </symbol>

            {/* Window with glow */}
            <symbol id="trainWindow" viewBox="0 0 50 40">
              <rect x="2" y="2" width="46" height="36" fill="#1a1a1a" stroke="#5C4314" strokeWidth="2" rx="2"/>
              <rect x="2" y="2" width="46" height="36" fill="url(#windowGlow)" opacity="0.8" rx="2"/>
              {/* Reflection highlight */}
              <line x1="8" y1="8" x2="18" y2="18" stroke="white" strokeWidth="1" opacity="0.15"/>
            </symbol>
          </defs>

          <style type="text/css">
            {`
              .rail { fill: none; stroke: #2D1F0D; stroke-width: 3; }
              .trainBody { fill: url(#trainBodyMain); stroke: #5C4314; stroke-width: 1.5; }
              .trainRoof { fill: url(#trainHighlight); stroke: #5C4314; stroke-width: 1.5; }
              .trainUnderframe { fill: url(#trainShadow); stroke: #2D1F0D; stroke-width: 1; }
              .panelLine { fill: none; stroke: #5C4314; stroke-width: 1; opacity: 0.6; }
              .doorFrame { fill: none; stroke: #5C4314; stroke-width: 2; }
              .doorHandle { fill: #5a5a5a; stroke: #2D1F0D; stroke-width: 0.5; }
              .vent { fill: none; stroke: #5C4314; stroke-width: 1; opacity: 0.5; }
              .engineCover { fill: #2D1F0D; stroke: #1a1a1a; stroke-width: 1; }
              .coupling { fill: #4A4A4A; stroke: #2D1F0D; stroke-width: 1; }
              .weatherMark { fill: #8B6914; opacity: 0.3; }
              .scratch { stroke: #D4AF7A; stroke-width: 0.5; opacity: 0.2; }

              @keyframes windowPulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 0.95; }
              }

              .windowGlow {
                animation: windowPulse 4s ease-in-out infinite;
              }
            `}
          </style>

          {/* Static Rails */}
          <line className="rail" x1="0" y1="400" x2="2993" y2="400" />
          <line className="rail" x1="0" y1="420" x2="2993" y2="420" />
          {/* Cross ties */}
          {[...Array(16)].map((_, i) => (
            <rect key={i} x={i * 200} y="395" width="12" height="30" fill="#5C4314" opacity="0.4"/>
          ))}

          {/* Animated Train Group */}
          <g filter="url(#trainShadow)">
            <g>
              {/* Lead Car (Front) - Modern Subway */}
              <g id="lead-car">
                {/* Undercarriage */}
                <rect className="trainUnderframe" x="2900" y="360" width="260" height="20" rx="2"/>
                <use href="#bogie" x="2910" y="350" width="140" height="60"/>
                <use href="#bogie" x="2990" y="350" width="140" height="60"/>

                {/* Main body shell */}
                <rect className="trainBody" x="2900" y="220" width="260" height="140" rx="8"/>

                {/* Roof highlight */}
                <rect className="trainRoof" x="2900" y="220" width="260" height="35" rx="8"/>

                {/* Front nose/driver cab */}
                <path className="trainBody" d="M 3160 220 Q 3180 240 3180 280 L 3180 360 L 3160 360 L 3160 220 Z" stroke="#5C4314" strokeWidth="2"/>

                {/* Front windshield */}
                <path d="M 3165 240 Q 3175 250 3175 270" stroke="#1a1a1a" strokeWidth="12" fill="none"/>
                <path d="M 3165 240 Q 3175 250 3175 270" stroke="url(#windowGlow)" strokeWidth="10" fill="none" opacity="0.6"/>

                {/* Side windows */}
                <use href="#trainWindow" x="2915" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="3000" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="3085" y="270" width="65" height="50" className="windowGlow"/>

                {/* Doors */}
                <rect className="doorFrame" x="2985" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="2977" y="305" width="6" height="12" rx="1"/>

                {/* Rimmed Coupling */}
                <rect className="coupling" x="2880" y="310" width="18" height="18" rx="3"/>
                <circle className="coupling" cx="2889" cy="319" r="6" stroke="#5C4314" strokeWidth="2" fill="none"/>
              </g>

              {/* Car 1 - Passenger Car */}
              <g id="car-1">
                {/* Undercarriage */}
                <rect className="trainUnderframe" x="2630" y="360" width="240" height="20" rx="2"/>
                <use href="#bogie" x="2640" y="350" width="140" height="60"/>
                <use href="#bogie" x="2710" y="350" width="140" height="60"/>

                {/* Main body shell */}
                <rect className="trainBody" x="2630" y="220" width="240" height="140" rx="8"/>

                {/* Roof highlight */}
                <rect className="trainRoof" x="2630" y="220" width="240" height="35" rx="8"/>

                {/* Windows */}
                <use href="#trainWindow" x="2645" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="2730" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="2815" y="270" width="65" height="50" className="windowGlow"/>

                {/* Doors */}
                <rect className="doorFrame" x="2710" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="2702" y="305" width="6" height="12" rx="1"/>

                <rect className="doorFrame" x="2795" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="2787" y="305" width="6" height="12" rx="1"/>

                {/* Rimmed Coupling */}
                <rect className="coupling" x="2870" y="310" width="18" height="18" rx="3"/>
                <circle className="coupling" cx="2879" cy="319" r="6" stroke="#5C4314" strokeWidth="2" fill="none"/>
              </g>

              {/* Car 2 - Passenger Car */}
              <g id="car-2">
                {/* Undercarriage */}
                <rect className="trainUnderframe" x="2360" y="360" width="240" height="20" rx="2"/>
                <use href="#bogie" x="2370" y="350" width="140" height="60"/>
                <use href="#bogie" x="2440" y="350" width="140" height="60"/>

                {/* Main body shell */}
                <rect className="trainBody" x="2360" y="220" width="240" height="140" rx="8"/>

                {/* Roof highlight */}
                <rect className="trainRoof" x="2360" y="220" width="240" height="35" rx="8"/>

                {/* Windows */}
                <use href="#trainWindow" x="2375" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="2460" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="2545" y="270" width="65" height="50" className="windowGlow"/>

                {/* Doors */}
                <rect className="doorFrame" x="2440" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="2432" y="305" width="6" height="12" rx="1"/>

                <rect className="doorFrame" x="2525" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="2517" y="305" width="6" height="12" rx="1"/>

                {/* Rimmed Coupling */}
                <rect className="coupling" x="2600" y="310" width="18" height="18" rx="3"/>
                <circle className="coupling" cx="2609" cy="319" r="6" stroke="#5C4314" strokeWidth="2" fill="none"/>
              </g>

              {/* Car 3 - Passenger Car */}
              <g id="car-3">
                {/* Undercarriage */}
                <rect className="trainUnderframe" x="2090" y="360" width="240" height="20" rx="2"/>
                <use href="#bogie" x="2100" y="350" width="140" height="60"/>
                <use href="#bogie" x="2170" y="350" width="140" height="60"/>

                {/* Main body shell */}
                <rect className="trainBody" x="2090" y="220" width="240" height="140" rx="8"/>

                {/* Roof highlight */}
                <rect className="trainRoof" x="2090" y="220" width="240" height="35" rx="8"/>

                {/* Windows */}
                <use href="#trainWindow" x="2105" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="2190" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="2275" y="270" width="65" height="50" className="windowGlow"/>

                {/* Doors */}
                <rect className="doorFrame" x="2170" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="2162" y="305" width="6" height="12" rx="1"/>

                <rect className="doorFrame" x="2255" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="2247" y="305" width="6" height="12" rx="1"/>

                {/* Rimmed Coupling */}
                <rect className="coupling" x="2330" y="310" width="18" height="18" rx="3"/>
                <circle className="coupling" cx="2339" cy="319" r="6" stroke="#5C4314" strokeWidth="2" fill="none"/>
              </g>

              {/* Car 4 - Passenger Car */}
              <g id="car-4">
                {/* Undercarriage */}
                <rect className="trainUnderframe" x="1820" y="360" width="240" height="20" rx="2"/>
                <use href="#bogie" x="1830" y="350" width="140" height="60"/>
                <use href="#bogie" x="1900" y="350" width="140" height="60"/>

                {/* Main body shell */}
                <rect className="trainBody" x="1820" y="220" width="240" height="140" rx="8"/>

                {/* Roof highlight */}
                <rect className="trainRoof" x="1820" y="220" width="240" height="35" rx="8"/>

                {/* Windows */}
                <use href="#trainWindow" x="1835" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="1920" y="270" width="65" height="50" className="windowGlow"/>
                <use href="#trainWindow" x="2005" y="270" width="65" height="50" className="windowGlow"/>

                {/* Doors */}
                <rect className="doorFrame" x="1900" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="1892" y="305" width="6" height="12" rx="1"/>

                <rect className="doorFrame" x="1985" y="275" width="4" height="75" rx="1"/>
                <rect className="doorHandle" x="1977" y="305" width="6" height="12" rx="1"/>

                {/* Rimmed Coupling */}
                <rect className="coupling" x="2060" y="310" width="18" height="18" rx="3"/>
                <circle className="coupling" cx="2069" cy="319" r="6" stroke="#5C4314" strokeWidth="2" fill="none"/>
              </g>

              {/* Train Animation */}
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                begin="0.5s"
                dur="12s"
                values="-3400 0; 3400 0"
                repeatCount="indefinite"
              />
            </g>
          </g>

        </svg>
      </div>
    </section>
  )
}
