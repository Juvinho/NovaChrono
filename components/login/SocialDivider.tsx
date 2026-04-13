import { GoogleIcon } from './icons'

interface Props {
  onGoogleLogin?: () => void
}

export default function SocialDivider({ onGoogleLogin }: Props) {
  return (
    <>
      {/* Divisor */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span className="font-display text-xs text-white/25">ou</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* Botão Google */}
      <button
        type="button"
        onClick={onGoogleLogin}
        className="btn-outline w-full rounded-xl py-3.5 font-display font-semibold text-sm tracking-wide flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        Entrar com Google
      </button>
    </>
  )
}
