import { httpClient } from './httpClient'
import type {
  AddSessionAllowedRoleClassPayload,
  CreateRoleClassPayload,
  RoleClass,
  SessionAllowedRoleClass,
  UpdateRoleClassPayload,
} from '../types/roleClass'

export const roleClassesApi = {
  getRoleClasses() {
    return httpClient.get<RoleClass[]>('/role-classes')
  },

  getRoleClassById(id: string) {
    return httpClient.get<RoleClass>(`/role-classes/${id}`)
  },

  createRoleClass(payload: CreateRoleClassPayload) {
    return httpClient.post<RoleClass>('/role-classes', payload)
  },

  updateRoleClass(id: string, payload: UpdateRoleClassPayload) {
    return httpClient.patch<RoleClass>(`/role-classes/${id}`, payload)
  },

  deleteRoleClass(id: string) {
    return httpClient.delete<void>(`/role-classes/${id}`)
  },

  addSessionAllowedRoleClass(
    sessionId: string,
    payload: AddSessionAllowedRoleClassPayload,
  ) {
    return httpClient.post<SessionAllowedRoleClass>(
      `/sessions/${sessionId}/allowed-role-classes`,
      payload,
    )
  },

  removeSessionAllowedRoleClass(sessionId: string, roleClassId: string) {
    return httpClient.delete<void>(
      `/sessions/${sessionId}/allowed-role-classes/${roleClassId}`,
    )
  },
}