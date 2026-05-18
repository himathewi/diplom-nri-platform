import { httpClient } from './httpClient'
import type { UpdateUserPayload, User } from '../types/user'

export const usersApi = {
  getUsers() {
    return httpClient.get<User[]>('/users')
  },

  getCurrentUser() {
    return httpClient.get<User>('/users/me')
  },

  getUserById(id: string) {
    return httpClient.get<User>(`/users/${id}`)
  },

  updateUser(id: string, payload: UpdateUserPayload) {
    return httpClient.patch<User>(`/users/${id}`, payload)
  },

  deleteUser(id: string) {
    return httpClient.delete<void>(`/users/${id}`)
  },
}