import Link from 'next/link'

export default function RegisterFooter() {
  return (
    <p className="text-center font-display text-xs text-white/30 mt-7">
      Já tem conta?{' '}
      <Link
        href="/login"
        className="text-violet-400 hover:text-violet-300 transition-colors"
      >
        Entrar
      </Link>
    </p>
  )
}
