import { create } from 'zustand'
import { usersApi } from '../api/usersApi'
import type { UpdateUserPayload, User, UsersStatus } from '../types/user'

type UsersStore = {
  users: User[]
  selectedUser: User | null
  currentUser: User | null

  status: UsersStatus
  error: string | null

  fetchUsers: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  fetchUserById: (id: string) => Promise<void>
  updateUser: (id: string, payload: UpdateUserPayload) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>

  setSelectedUser: (user: User | null) => void
  clearError: () => void
  resetUsersState: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Произошла ошибка при работе с пользователями'
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  selectedUser: null,
  currentUser: null,

  status: 'idle',
  error: null,

  async fetchUsers() {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const users = await usersApi.getUsers()

      set({
        users,
        status: 'success',
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  async fetchCurrentUser() {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const currentUser = await usersApi.getCurrentUser()

      set({
        currentUser,
        status: 'success',
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  async fetchUserById(id) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const selectedUser = await usersApi.getUserById(id)

      set({
        selectedUser,
        status: 'success',
        error: null,
      })
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })
    }
  },

  async updateUser(id, payload) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const updatedUser = await usersApi.updateUser(id, payload)

      set({
        users: get().users.map((user) =>
          user.id === id ? updatedUser : user,
        ),
        selectedUser:
          get().selectedUser?.id === id ? updatedUser : get().selectedUser,
        currentUser:
          get().currentUser?.id === id ? updatedUser : get().currentUser,
        status: 'success',
        error: null,
      })

      return updatedUser
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })

      return null
    }
  },

  async deleteUser(id) {
    set({
      status: 'loading',
      error: null,
    })

    try {
      await usersApi.deleteUser(id)

      set({
        users: get().users.filter((user) => user.id !== id),
        selectedUser:
          get().selectedUser?.id === id ? null : get().selectedUser,
        currentUser:
          get().currentUser?.id === id ? null : get().currentUser,
        status: 'success',
        error: null,
      })

      return true
    } catch (error) {
      set({
        status: 'error',
        error: getErrorMessage(error),
      })

      return false
    }
  },

  setSelectedUser(user) {
    set({
      selectedUser: user,
    })
  },

  clearError() {
    set({
      error: null,
    })
  },

  resetUsersState() {
    set({
      users: [],
      selectedUser: null,
      currentUser: null,
      status: 'idle',
      error: null,
    })
  },
}))