import { create } from 'zustand'
import { authApi } from '../api/authApi'
import { AUTH_TOKEN_KEY } from '../api/httpClient'
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  register: (data: RegisterInput) => Promise<void>
  login: (data: LoginInput) => Promise<void>
  loadCurrentUser: () => Promise<void>
  logout: () => void
  clearError: () => void
}

function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(AUTH_TOKEN_KEY)
}

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

const initialToken = getStoredToken()

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  isLoading: false,
  error: null,
  isAuthenticated: Boolean(initialToken),

  async register(data) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const response = await authApi.register(data)

      setStoredToken(response.token)

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось зарегистрироваться',
      })

      throw error
    }
  },

  async login(data) {
    set({
      isLoading: true,
      error: null,
    })

    try {
      const response = await authApi.login(data)

      setStoredToken(response.token)

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось войти в систему',
      })

      throw error
    }
  },

  async loadCurrentUser() {
    const token = getStoredToken()

    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      })

      return
    }

    set({
      isLoading: true,
      error: null,
    })

    try {
      const user = await authApi.getCurrentUser()

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setStoredToken(null)

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось получить текущего пользователя',
      })
    }
  },

  logout() {
    setStoredToken(null)

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  clearError() {
    set({
      error: null,
    })
  },
}))