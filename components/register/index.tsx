'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RegisterHeader    from './RegisterHeader'
import AvatarUpload      from './AvatarUpload'
import PasswordStrength  from './PasswordStrength'
import RegisterFooter    from './RegisterFooter'
import { AtIcon, EnvelopeIcon, LockIcon, EyeIcon, EyeOffIcon } from './icons'
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/shared/register'

/* ── Mensagem de erro inline ── */

function FieldError({ message, show }: { message: string; show: boolean }) {
  if (!show || !message) return null
  return (
    <p className="font-display text-red-400/75 mt-1" style={{ fontSize: '0.72rem' }}>
      {message}
    </p>
  )
}

/* ── Componente principal ── */

export default function RegisterCard() {
  const router                        = useRouter()
  const [avatarFile, setAvatarFile]     = useState<File | null>(null)
  const [username, setUsername]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [terms, setTerms]               = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError]   = useState('')
  const [touched, setTouched]           = useState<Record<string, boolean>>({})

  const touch = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }))

  const errors = {
    username: validateUsername(username),
    email:    validateEmail(email),
    password: validatePassword(password),
    confirm:  validateConfirmPassword(confirm, password),
    terms:    terms ? '' : 'Voce precisa aceitar os termos.',
  }

  const isFormValid = Object.values(errors).every(e => !e)

  const handleRegister = async () => {
    setTouched({
      username: true,
      email: true,
      password: true,
      confirm: true,
      terms: true,
    })

    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const formData = new FormData()
      formData.set('username', username.trim())
      formData.set('email', email.trim())
      formData.set('password', password)

      if (avatarFile) {
        formData.set('avatar', avatarFile)
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      })

      const data = (await response.json().catch(() => null)) as
        | { message?: string; fieldErrors?: Record<string, string> }
        | null

      if (!response.ok) {
        if (data?.fieldErrors) {
          const touchedFromServer = Object.keys(data.fieldErrors).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {} as Record<string, boolean>
          )
          setTouched(prev => ({ ...prev, ...touchedFromServer }))
        }

        setSubmitError(
          data?.message ?? 'Nao foi possivel concluir o cadastro. Tente novamente.'
        )
        return
      }

      router.push('/login?registered=1')
    } catch {
      setSubmitError('Nao foi possivel conectar ao servidor no momento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass = (key: keyof typeof errors) =>
    `input-field${touched[key] && errors[key] ? ' has-error' : ''}`

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
        <RegisterHeader />
        <AvatarUpload onChange={setAvatarFile} disabled={isSubmitting} />

        {/* Nome de usuário */}
        <div className="mb-3">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <AtIcon />
            </div>
            <input
              type="text"
              placeholder="Nome de usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onBlur={() => touch('username')}
              className={fieldClass('username')}
              autoComplete="username"
            />
          </div>
          <FieldError message={errors.username} show={!!touched.username} />
        </div>

        {/* E-mail */}
        <div className="mb-3">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <EnvelopeIcon />
            </div>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              className={fieldClass('email')}
              autoComplete="email"
            />
          </div>
          <FieldError message={errors.email} show={!!touched.email} />
        </div>

        {/* Senha */}
        <div className="mb-3">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <LockIcon />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              className={fieldClass('password')}
              style={{ paddingRight: '2.75rem' }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <PasswordStrength password={password} />
          <FieldError message={errors.password} show={!!touched.password} />
        </div>

        {/* Confirmar senha */}
        <div className="mb-5">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
              <LockIcon />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirmar senha"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onBlur={() => touch('confirm')}
              className={fieldClass('confirm')}
              style={{ paddingRight: '2.75rem' }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <FieldError message={errors.confirm} show={!!touched.confirm && confirm.length > 0} />
        </div>

        {/* Termos */}
        <div
          role="checkbox"
          aria-checked={terms}
          tabIndex={0}
          onClick={() => {
            setTerms(t => !t)
            touch('terms')
          }}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              setTerms(t => !t)
              touch('terms')
            }
          }}
          className="flex items-start gap-2.5 cursor-pointer mb-5 outline-none"
        >
          <div className={`checkbox-box mt-px flex-shrink-0${terms ? ' is-checked' : ''}`}>
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
          <span
            className="font-display text-white/55 leading-snug"
            style={{ fontSize: '0.82rem' }}
          >
            Concordo com os{' '}
            <Link
              href="/terms"
              onClick={e => e.stopPropagation()}
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Termos de uso
            </Link>
            {' '}e a{' '}
            <Link
              href="/privacy"
              onClick={e => e.stopPropagation()}
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Política de privacidade
            </Link>
          </span>
        </div>
        <FieldError message={errors.terms} show={!!touched.terms} />

        {submitError ? (
          <p
            role="status"
            aria-live="polite"
            className="font-display text-red-400/90 mb-4"
            style={{ fontSize: '0.78rem' }}
          >
            {submitError}
          </p>
        ) : null}

        {/* Botão criar conta */}
        <button
          type="button"
          disabled={!isFormValid || isSubmitting}
          onClick={handleRegister}
          className="btn-primary w-full rounded-xl py-3.5 font-display font-semibold text-sm tracking-wide"
        >
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>

        <RegisterFooter />
      </div>
    </div>
  )
}
