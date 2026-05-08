import 'server-only'

import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/shared/register'

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export function validateRegisterPayload(payload: RegisterPayload) {
  const fieldErrors: Record<string, string> = {}

  const usernameError = validateUsername(payload.username)
  if (usernameError) {
    fieldErrors.username = usernameError
  }

  const emailError = validateEmail(payload.email)
  if (emailError) {
    fieldErrors.email = emailError
  }

  const passwordError = validatePassword(payload.password)
  if (passwordError) {
    fieldErrors.password = passwordError
  }

  return fieldErrors
}
