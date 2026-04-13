export const MAX_AVATAR_BYTES = 5 * 1024 * 1024

export const ACCEPTED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export const ACCEPTED_AVATAR_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
] as const

export const ACCEPTED_AVATAR_FORMATS_LABEL = 'JPG, PNG, WEBP, HEIC e HEIF'

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface AvatarValidationInput {
  size: number
  type?: string | null
  name?: string | null
}

function extensionFromName(name?: string | null) {
  if (!name) return ''
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex < 0) return ''
  return name.slice(dotIndex).toLowerCase()
}

export function isAcceptedAvatarType(type?: string | null, name?: string | null) {
  const normalizedType = (type ?? '').toLowerCase().trim()
  const normalizedExt = extensionFromName(name)

  return (
    ACCEPTED_AVATAR_MIME_TYPES.includes(normalizedType as (typeof ACCEPTED_AVATAR_MIME_TYPES)[number]) ||
    ACCEPTED_AVATAR_EXTENSIONS.includes(normalizedExt as (typeof ACCEPTED_AVATAR_EXTENSIONS)[number])
  )
}

export function isHeicOrHeifFile(type?: string | null, name?: string | null) {
  const normalizedType = (type ?? '').toLowerCase().trim()
  const normalizedExt = extensionFromName(name)

  return (
    normalizedType === 'image/heic' ||
    normalizedType === 'image/heif' ||
    normalizedExt === '.heic' ||
    normalizedExt === '.heif'
  )
}

export function validateAvatarFile(file: AvatarValidationInput) {
  if (file.size > MAX_AVATAR_BYTES) {
    return 'A foto deve ter no maximo 5 MB.'
  }

  if (!isAcceptedAvatarType(file.type, file.name)) {
    return `Formato invalido. Use ${ACCEPTED_AVATAR_FORMATS_LABEL}.`
  }

  return ''
}

export function validateUsername(value: string) {
  if (!value) return 'Nome de usuario obrigatorio'
  if (value.length < 3) return 'Minimo 3 caracteres'
  if (!USERNAME_REGEX.test(value)) return 'Apenas letras, numeros e _'
  return ''
}

export function validateEmail(value: string) {
  if (!value) return 'E-mail obrigatorio'
  if (!EMAIL_REGEX.test(value)) return 'E-mail invalido'
  return ''
}

export function validatePassword(value: string) {
  if (!value) return 'Senha obrigatoria'
  if (value.length < 8) return 'Minimo 8 caracteres'
  return ''
}

export function validateConfirmPassword(confirm: string, password: string) {
  if (!confirm) return 'Confirme a senha'
  if (confirm !== password) return 'As senhas nao coincidem'
  return ''
}
