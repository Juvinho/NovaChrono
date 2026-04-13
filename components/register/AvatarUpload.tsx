'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ACCEPTED_AVATAR_FORMATS_LABEL,
  MAX_AVATAR_BYTES,
  validateAvatarFile,
} from '@/lib/shared/register'

interface Props {
  onChange: (file: File | null) => void
  disabled?: boolean
}

function UserIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5"  y1="12" x2="19" y2="12" />
    </svg>
  )
}

const MAX_AVATAR_MB = Math.floor(MAX_AVATAR_BYTES / (1024 * 1024))

export default function AvatarUpload({ onChange, disabled = false }: Props) {
  const inputRef             = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError]     = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Revoga o object URL anterior para evitar memory leak
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const applyFile = (file: File | null) => {
    if (!file) return

    const validationError = validateAvatarFile({
      size: file.size,
      type: file.type,
      name: file.name,
    })

    if (validationError) {
      setError(validationError)
      return
    }

    if (preview) URL.revokeObjectURL(preview)

    setError('')
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    applyFile(file)

    // Limpa o value para permitir re-selecionar o mesmo arquivo
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (disabled) return

    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] ?? null
    applyFile(file)
  }

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={e => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={handleDrop}
        className={`relative w-20 h-20 rounded-full group focus:outline-none transition-transform ${
          disabled ? 'cursor-not-allowed opacity-65' : 'cursor-pointer'
        } ${isDragging ? 'scale-105' : ''}`}
        aria-label="Escolher foto de perfil"
      >
        {/* Círculo principal */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden transition-all duration-200"
          style={{
            border: isDragging
              ? '2px solid rgba(129,140,248,0.95)'
              : '2px solid rgba(99,102,241,0.35)',
            boxShadow: '0 0 0 0 rgba(99,102,241,0)',
          }}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Foto de perfil"
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white/25"
              style={{ background: 'rgba(5,8,15,0.7)' }}
            >
              <UserIcon />
            </div>
          )}
        </div>

        {/* Overlay no hover */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center text-white/80
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(5,8,15,0.72)' }}
        >
          <CameraIcon />
        </div>

        {/* Badge + */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center
                     justify-center text-white shadow-lg transition-transform duration-200
                     group-hover:scale-110"
          style={{ background: '#6366f1' }}
        >
          <PlusIcon />
        </div>
      </button>

      <p className="font-display text-white/30" style={{ fontSize: '0.72rem' }}>
        {preview ? 'Clique para trocar' : 'Foto de perfil (opcional)'}
      </p>

      <p className="font-display text-white/35 text-center" style={{ fontSize: '0.68rem' }}>
        {ACCEPTED_AVATAR_FORMATS_LABEL} ate {MAX_AVATAR_MB} MB
      </p>

      {error ? (
        <p
          role="status"
          aria-live="polite"
          className="font-display text-red-400/85 text-center"
          style={{ fontSize: '0.72rem' }}
        >
          {error}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
