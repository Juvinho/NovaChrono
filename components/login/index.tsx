'use client'

import { useState } from 'react'
import Link from 'next/link'
import LoginHeader    from './LoginHeader'
import SocialDivider  from './SocialDivider'
import LoginFooter    from './LoginFooter'
import { EnvelopeIcon, LockIcon } from './icons'

export default function LoginCard() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const handleLogin = () => {
    const storage = remember ? localStorage : sessionStorage
    // storage.setItem('auth_token', token)
    void storage
  }

  return (
    <div className="animate-fade-in-1 relative z-10 w-full max-w-sm px-4">
      <div
        className="rounded-3xl px-8 py-10"
        style={{
          background:           'rgba(8, 11, 20, 0.65)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border:               '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <LoginHeader />

        {/* Campo email */}
        <div className="relative mb-3">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
            <EnvelopeIcon />
          </div>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field"
            autoComplete="email"
          />
        </div>

        {/* Campo senha */}
        <div className="relative mb-3">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
            <LockIcon />
          </div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-field"
            autoComplete="current-password"
          />
        </div>

        {/* Lembrar de mim + Esqueceu a senha */}
        <div className="flex items-center justify-between mb-6 mt-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={remember}
            onClick={() => setRemember(r => !r)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className={`checkbox-box${remember ? ' is-checked' : ''}`}>
              <svg width="10" height="8" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                <path
                  className="checkbox-mark"
                  d="M1.5 4.5L4 7L9.5 1.5"
                  stroke="#a5b4fc"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-display text-white/60 select-none" style={{ fontSize: '0.85rem' }}>
              Lembrar de mim
            </span>
          </button>

          <Link
            href="/forgot-password"
            className="font-display text-xs text-violet-400/60 hover:text-violet-400 transition-colors"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        {/* Botão entrar */}
        <button
          type="button"
          onClick={handleLogin}
          className="btn-primary w-full rounded-xl py-3.5 font-display font-semibold text-sm tracking-wide"
        >
          Entrar
        </button>

        <SocialDivider />

        <LoginFooter />
      </div>
    </div>
  )
}
