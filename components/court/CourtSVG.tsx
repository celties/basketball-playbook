'use client';

/**
 * Static half-court SVG background.
 * viewBox coordinate system: 500 x 470 (50ft x 47ft @ 10px/ft)
 * Endline at y=0 (top), halfcourt at y=470 (bottom).
 * Basket center at (250, 55).
 */
export default function CourtSVG() {
  return (
    <g>
      {/* Floor */}
      <rect x="0" y="0" width="500" height="470" fill="#c8892a" />
      {/* Floor grain lines */}
      {Array.from({ length: 23 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          y1={i * 21}
          x2="500"
          y2={i * 21}
          stroke="#b87820"
          strokeWidth="0.4"
        />
      ))}

      {/* ---- White court lines ---- */}

      {/* Outer boundary */}
      <rect
        x="1"
        y="1"
        width="498"
        height="469"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
      />

      {/* Paint / Lane */}
      <rect
        x="170"
        y="0"
        width="160"
        height="190"
        fill="rgba(255,255,255,0.08)"
        stroke="white"
        strokeWidth="2"
      />

      {/* Free throw circle – upper half dashed (inside lane) */}
      <path
        d="M 190 190 A 60 60 0 0 1 310 190"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="6 5"
      />
      {/* Free throw circle – lower half solid */}
      <path
        d="M 190 190 A 60 60 0 0 0 310 190"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />

      {/* Backboard */}
      <line
        x1="220"
        y1="28"
        x2="280"
        y2="28"
        stroke="white"
        strokeWidth="3"
      />
      {/* Backboard neck */}
      <line
        x1="250"
        y1="28"
        x2="250"
        y2="45"
        stroke="white"
        strokeWidth="2"
      />

      {/* Basket rim (orange) */}
      <circle
        cx="250"
        cy="55"
        r="9"
        fill="none"
        stroke="#ff6600"
        strokeWidth="2.5"
      />

      {/* Restricted area arc */}
      <path
        d="M 210 55 A 40 40 0 0 0 290 55"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />

      {/* 3-point corner lines */}
      <line
        x1="30"
        y1="0"
        x2="30"
        y2="144"
        stroke="white"
        strokeWidth="2"
      />
      <line
        x1="470"
        y1="0"
        x2="470"
        y2="144"
        stroke="white"
        strokeWidth="2"
      />

      {/* 3-point arc */}
      <path
        d="M 30 144 A 237.5 237.5 0 0 0 470 144"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />

      {/* Half-court line */}
      <line
        x1="0"
        y1="469"
        x2="500"
        y2="469"
        stroke="white"
        strokeWidth="2"
      />
      {/* Half-court center circle (partial) */}
      <path
        d="M 190 469 A 60 60 0 0 1 310 469"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
    </g>
  );
}
