import { httpClient } from './httpClient'
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '../types/auth'

export const authApi = {
  register(data: RegisterInput): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/register', data)
  },

  login(data: LoginInput): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/login', data)
  },

  getCurrentUser(): Promise<AuthUser> {
    return httpClient.get<AuthUser>('/auth/me')
  },
}