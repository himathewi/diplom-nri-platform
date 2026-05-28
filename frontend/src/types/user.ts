import type { UserRole } from './enums'

export type { UserRole } from './enums'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type UpdateUserPayload = {
  email?: string
  name?: string
  role?: UserRole
}

export type UsersStatus = 'idle' | 'loading' | 'success' | 'error'