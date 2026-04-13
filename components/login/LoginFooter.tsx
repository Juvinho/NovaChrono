import Link from 'next/link'

export default function LoginFooter() {
  return (
    <p className="text-center font-display text-xs text-white/30 mt-7">
      Não tem conta?{' '}
      <Link
        href="/register"
        className="text-violet-400 hover:text-violet-300 transition-colors"
      >
        Criar conta
      </Link>
    </p>
  )
}
