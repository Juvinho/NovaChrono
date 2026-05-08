import 'server-only'

import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  MAX_AVATAR_BYTES,
  isAcceptedAvatarType,
  isHeicOrHeifFile,
  validateAvatarFile,
} from '@/lib/shared/register'

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
}

const AVATAR_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')

type HeicConvertFn = (input: {
  buffer: Buffer
  format: 'JPEG'
  quality: number
}) => Promise<Buffer | ArrayBuffer | Uint8Array>

export class AvatarFileError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'AvatarFileError'
    this.statusCode = statusCode
  }
}

function extensionFromName(fileName: string) {
  const extension = path.extname(fileName || '').toLowerCase()
  return extension
}

function normalizeSlug(input: string) {
  const collapsed = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return collapsed.slice(0, 36) || 'user'
}

function resolveTargetExtension(file: File) {
  const byName = extensionFromName(file.name)
  if (byName) return byName

  const byMime = MIME_EXTENSION_MAP[(file.type || '').toLowerCase()]
  if (byMime) return byMime

  return '.jpg'
}

async function convertHeicToJpeg(fileBuffer: Buffer) {
  const heicConvertModule = (await import('heic-convert')) as {
    default?: HeicConvertFn
  }

  const convert = heicConvertModule.default
  if (!convert) {
    throw new Error('Converter HEIC indisponivel.')
  }

  const converted = await convert({
    buffer: fileBuffer,
    format: 'JPEG',
    quality: 0.9,
  })

  if (Buffer.isBuffer(converted) || converted instanceof Uint8Array) {
    return converted
  }

  return new Uint8Array(converted)
}

export async function saveAvatarFile(file: File, username: string) {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new AvatarFileError('A foto deve ter no maximo 5 MB.', 413)
  }

  if (!isAcceptedAvatarType(file.type, file.name)) {
    throw new AvatarFileError('Formato de imagem invalido para foto de perfil.', 415)
  }

  const validationError = validateAvatarFile({
    size: file.size,
    type: file.type,
    name: file.name,
  })

  if (validationError) {
    throw new AvatarFileError(validationError, 400)
  }

  const sourceBuffer = Buffer.from(await file.arrayBuffer())
  let outputBuffer: Uint8Array = sourceBuffer
  let extension = resolveTargetExtension(file)

  if (isHeicOrHeifFile(file.type, file.name)) {
    try {
      outputBuffer = await convertHeicToJpeg(sourceBuffer)
      extension = '.jpg'
    } catch {
      throw new AvatarFileError('Nao foi possivel converter a foto HEIC/HEIF para JPG.', 415)
    }
  }

  await mkdir(AVATAR_UPLOAD_DIR, { recursive: true })

  const safeSlug = normalizeSlug(username)
  const fileName = `${Date.now()}-${safeSlug}-${randomUUID().slice(0, 8)}${extension}`
  const fullPath = path.join(AVATAR_UPLOAD_DIR, fileName)

  await writeFile(fullPath, outputBuffer)

  return `/uploads/avatars/${fileName}`
}
