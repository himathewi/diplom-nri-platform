export type UserRole = 'ADMIN' | 'MODERATOR' | 'PARTICIPANT' | 'EXPERT'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  role?: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}