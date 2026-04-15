import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { AvatarFileError, saveAvatarFile } from '@/lib/server/avatar'
import { validateRegisterPayload } from '@/lib/server/register-validation'

export const runtime = 'nodejs'

interface RegisterErrorBody {
  message: string
  fieldErrors?: Record<string, string>
}

function normalizeFormValue(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function errorResponse(status: number, body: RegisterErrorBody) {
  return NextResponse.json(body, { status })
}

function stringifyError(error: unknown) {
  if (!error) {
    return 'unknown-error'
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }

  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function hasPrismaErrorCode(error: unknown): error is { code: string } {
  if (!error || typeof error !== 'object') {
    return false
  }

  return typeof (error as { code?: unknown }).code === 'string'
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('[api/register] DATABASE_URL is missing in runtime environment')
      return errorResponse(503, {
        message: 'Configuracao de banco ausente no servidor.',
      })
    }

    const formData = await request.formData()

    const username = normalizeFormValue(formData.get('username'))
    const email = normalizeFormValue(formData.get('email')).toLowerCase()
    const password = normalizeFormValue(formData.get('password'))

    const fieldErrors = validateRegisterPayload({ username, email, password })
    if (Object.keys(fieldErrors).length > 0) {
      return errorResponse(422, {
        message: 'Revise os dados e tente novamente.',
        fieldErrors,
      })
    }

    const avatarEntry = formData.get('avatar')
    let avatarFile: File | null = null

    if (avatarEntry instanceof File && avatarEntry.size > 0) {
      avatarFile = avatarEntry
    } else if (avatarEntry && typeof avatarEntry !== 'string') {
      return errorResponse(422, { message: 'Arquivo de avatar invalido.' })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: {
        username: true,
        email: true,
      },
    })

    if (existingUser) {
      const duplicateErrors: Record<string, string> = {}

      if (existingUser.username === username) {
        duplicateErrors.username = 'Nome de usuario indisponivel.'
      }
      if (existingUser.email === email) {
        duplicateErrors.email = 'E-mail ja cadastrado.'
      }

      return errorResponse(409, {
        message: 'Ja existe uma conta com esses dados.',
        fieldErrors: duplicateErrors,
      })
    }

    let avatarUrl: string | null = null
    if (avatarFile) {
      avatarUrl = await saveAvatarFile(avatarFile, username)
    }

    const passwordHash = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        avatarUrl,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso.',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[api/register] request failed', {
      reason: stringifyError(error),
      prismaCode: hasPrismaErrorCode(error) ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error instanceof AvatarFileError) {
      return errorResponse(error.statusCode, { message: error.message })
    }

    if (hasPrismaErrorCode(error) && error.code === 'P2002') {
      return errorResponse(409, {
        message: 'Ja existe uma conta com esses dados.',
      })
    }

    if (hasPrismaErrorCode(error) && error.code === 'P2021') {
      return errorResponse(503, {
        message: 'Estrutura do banco ainda nao foi aplicada (tabela User ausente).',
      })
    }

    if (hasPrismaErrorCode(error) && error.code === 'P1001') {
      return errorResponse(503, {
        message: 'Banco de dados indisponivel no momento.',
      })
    }

    return errorResponse(503, {
      message: 'Erro interno ao criar a conta.',
    })
  }
}
