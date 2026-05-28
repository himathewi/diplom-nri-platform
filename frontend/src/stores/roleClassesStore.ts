import { create } from 'zustand'
import { roleClassesApi } from '../api/roleClassesApi'
import type {
  AddSessionAllowedRoleClassPayload,
  CreateRoleClassPayload,
  RoleClass,
  SessionAllowedRoleClass,
  UpdateRoleClassPayload,
} from '../types/roleClass'

type RoleClassesState = {
  roleClasses: RoleClass[]
  selectedRoleClass: RoleClass | null
  sessionAllowedRoleClasses: SessionAllowedRoleClass[]
  isLoading: boolean
  error: string | null

  fetchRoleClasses: () => Promise<void>
  fetchRoleClassById: (id: string) => Promise<RoleClass | null>
  createRoleClass: (payload: CreateRoleClassPayload) => Promise<RoleClass | null>
  updateRoleClass: (
    id: string,
    payload: UpdateRoleClassPayload,
  ) => Promise<RoleClass | null>
  deleteRoleClass: (id: string) => Promise<boolean>

  addSessionAllowedRoleClass: (
    sessionId: string,
    payload: AddSessionAllowedRoleClassPayload,
  ) => Promise<SessionAllowedRoleClass | null>
  removeSessionAllowedRoleClass: (
    sessionId: string,
    roleClassId: string,
  ) => Promise<boolean>

  clearSelectedRoleClass: () => void
  clearSessionAllowedRoleClasses: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useRoleClassesStore = create<RoleClassesState>((set) => ({
  roleClasses: [],
  selectedRoleClass: null,
  sessionAllowedRoleClasses: [],
  isLoading: false,
  error: null,

  async fetchRoleClasses() {
    set({ isLoading: true, error: null })

    try {
      const roleClasses = await roleClassesApi.getRoleClasses()

      set({
        roleClasses,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async fetchRoleClassById(id) {
    set({ isLoading: true, error: null })

    try {
      const roleClass = await roleClassesApi.getRoleClassById(id)

      set({
        selectedRoleClass: roleClass,
        isLoading: false,
      })

      return roleClass
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async createRoleClass(payload) {
    set({ isLoading: true, error: null })

    try {
      const roleClass = await roleClassesApi.createRoleClass(payload)

      set((state) => ({
        roleClasses: [roleClass, ...state.roleClasses],
        selectedRoleClass: roleClass,
        isLoading: false,
      }))

      return roleClass
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async updateRoleClass(id, payload) {
    set({ isLoading: true, error: null })

    try {
      const updatedRoleClass = await roleClassesApi.updateRoleClass(id, payload)

      set((state) => ({
        roleClasses: state.roleClasses.map((roleClass) =>
          roleClass.id === id ? updatedRoleClass : roleClass,
        ),
        selectedRoleClass:
          state.selectedRoleClass?.id === id
            ? updatedRoleClass
            : state.selectedRoleClass,
        isLoading: false,
      }))

      return updatedRoleClass
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async deleteRoleClass(id) {
    set({ isLoading: true, error: null })

    try {
      await roleClassesApi.deleteRoleClass(id)

      set((state) => ({
        roleClasses: state.roleClasses.filter(
          (roleClass) => roleClass.id !== id,
        ),
        selectedRoleClass:
          state.selectedRoleClass?.id === id ? null : state.selectedRoleClass,
        isLoading: false,
      }))

      return true
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return false
    }
  },

  async addSessionAllowedRoleClass(sessionId, payload) {
    set({ isLoading: true, error: null })

    try {
      const allowedRoleClass = await roleClassesApi.addSessionAllowedRoleClass(
        sessionId,
        payload,
      )

      set((state) => ({
        sessionAllowedRoleClasses: [
          allowedRoleClass,
          ...state.sessionAllowedRoleClasses,
        ],
        isLoading: false,
      }))

      return allowedRoleClass
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async removeSessionAllowedRoleClass(sessionId, roleClassId) {
    set({ isLoading: true, error: null })

    try {
      await roleClassesApi.removeSessionAllowedRoleClass(sessionId, roleClassId)

      set((state) => ({
        sessionAllowedRoleClasses: state.sessionAllowedRoleClasses.filter(
          (item) => item.roleClassId !== roleClassId,
        ),
        isLoading: false,
      }))

      return true
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return false
    }
  },

  clearSelectedRoleClass() {
    set({ selectedRoleClass: null })
  },

  clearSessionAllowedRoleClasses() {
    set({ sessionAllowedRoleClasses: [] })
  },

  clearError() {
    set({ error: null })
  },
}))