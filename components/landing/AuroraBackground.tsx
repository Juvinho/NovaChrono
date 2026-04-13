// Posições fixas para evitar divergência de hidratação SSR/cliente.
// x = left%, y = top%, s = tamanho em px, d = delay em s, t = duração em s
const PARTICLES = [
  { x:  8, y: 75, s: 2.0, d: 0.0, t:  7 },
  { x: 17, y: 42, s: 1.5, d: 1.2, t:  9 },
  { x: 29, y: 88, s: 1.0, d: 2.5, t:  6 },
  { x: 38, y: 15, s: 2.5, d: 0.8, t: 11 },
  { x: 45, y: 60, s: 1.0, d: 3.2, t:  8 },
  { x: 52, y: 30, s: 2.0, d: 1.7, t:  7 },
  { x: 61, y: 78, s: 1.5, d: 4.0, t: 10 },
  { x: 70, y: 22, s: 1.0, d: 2.1, t:  6 },
  { x: 78, y: 55, s: 2.0, d: 0.5, t:  9 },
  { x: 85, y: 90, s: 1.5, d: 3.5, t:  8 },
  { x: 92, y: 35, s: 1.0, d: 1.9, t:  7 },
  { x:  5, y: 48, s: 2.0, d: 2.8, t: 10 },
  { x: 23, y: 67, s: 1.0, d: 0.3, t:  6 },
  { x: 35, y: 95, s: 1.5, d: 4.5, t:  9 },
  { x: 48, y:  8, s: 2.0, d: 1.5, t: 11 },
  { x: 58, y: 52, s: 1.0, d: 3.8, t:  7 },
  { x: 67, y: 38, s: 2.5, d: 2.2, t:  8 },
  { x: 75, y: 72, s: 1.5, d: 0.9, t: 10 },
  { x: 88, y: 18, s: 1.0, d: 4.2, t:  6 },
  { x: 95, y: 63, s: 2.0, d: 1.1, t:  9 },
]

export default function AuroraBackground() {
  return (
    <>
      {/* Camada 1 — grid de profundidade sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
        }}
      />

      {/* Camada 2 — gradiente cônico girando */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          background: [
            'conic-gradient(',
            '  from 0deg at 30% 40%,',
            '  transparent 0deg,',
            '  rgba(99,102,241,0.06) 90deg,',
            '  transparent 180deg,',
            '  rgba(124,58,237,0.05) 270deg,',
            '  transparent 360deg',
            ')',
          ].join(''),
          animation: 'conicSpin 42s linear infinite',
        }}
      />

      {/* Camada 3 — aurora (mix-blend-mode: screen) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ isolation: 'isolate' }}
      >
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
        <div className="aurora-blob aurora-4" />
        <div className="aurora-blob aurora-5" />
      </div>

      {/* Camada 4 — partículas flutuando */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left:              `${p.x}%`,
              top:               `${p.y}%`,
              width:             `${p.s}px`,
              height:            `${p.s}px`,
              animationDelay:    `${p.d}s`,
              animationDuration: `${p.t}s`,
            }}
          />
        ))}
      </div>

      {/* Camada 5 — vinheta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 18%, rgba(5,8,15,0.75) 100%)',
        }}
      />
    </>
  )
}
