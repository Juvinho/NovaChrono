import Link from 'next/link'

export default function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 max-w-3xl mx-auto">

      {/* Nome */}
      <h1
        className="animate-fade-in-1 font-display font-extrabold leading-none tracking-tight select-none text-white"
        style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          textShadow:
            '0 0 80px rgba(99,102,241,0.35), 0 0 160px rgba(124,58,237,0.18)',
        }}
      >
        Chrono
      </h1>

      {/* Separador */}
      <div
        className="animate-fade-in-2 mt-5 mb-4 h-px w-10 rounded-full"
        style={{ background: 'rgba(124, 58, 237, 0.4)' }}
        aria-hidden="true"
      />

      {/* Slogan */}
      <p
        className="animate-fade-in-2 font-display font-light text-white/50 text-sm sm:text-base md:text-lg"
        style={{ letterSpacing: '0.05em' }}
      >
        Sua linha. Sua história.
      </p>

      {/* Botões */}
      <div className="animate-fade-in-3 flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
        <Link
          href="/login"
          className="btn-primary rounded-full px-12 py-3.5 font-display font-semibold text-sm tracking-wide w-full sm:w-auto text-center"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="btn-outline rounded-full px-12 py-3.5 font-display font-semibold text-sm tracking-wide w-full sm:w-auto text-center"
        >
          Criar conta
        </Link>
      </div>
    </div>
  )
}
