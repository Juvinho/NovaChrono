import Image from 'next/image'
import Link from 'next/link'

export default function LoginHeader() {
  return (
    <div className="text-center mb-8">
      <Link href="/" className="inline-flex items-center justify-center mb-3" aria-label="Voltar para home">
        <Image
          src="/Chrono.png"
          alt="Chrono"
          width={112}
          height={36}
          priority
        />
      </Link>
      <Link
        href="/"
        className="font-display font-extrabold text-white text-2xl tracking-tight hover:text-white/75 transition-colors"
      >
        Chrono
      </Link>
      <p className="mt-2.5 font-display font-light text-white/75 text-lg leading-snug">
        Bem-vindo de volta
      </p>
    </div>
  )
}
