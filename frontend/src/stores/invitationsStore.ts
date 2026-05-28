import { create } from 'zustand'
import { invitationsApi } from '../api/invitationsApi'
import type {
  AcceptInvitationByCodePayload,
  CreateSessionInvitationPayload,
  SessionInvitation,
  InvitationPublicInfo,
} from '../types/invitation'

type InvitationsState = {
  invitations: SessionInvitation[]
  selectedInvitation: InvitationPublicInfo | null
  createdInviteUrl: string | null
  createdCode: string | null
  isLoading: boolean
  error: string | null

  fetchSessionInvitations: (sessionId: string) => Promise<void>
  createSessionInvitation: (
    sessionId: string,
    payload: CreateSessionInvitationPayload,
  ) => Promise<SessionInvitation | null>
  getInvitationByLinkToken: (token: string) => Promise<InvitationPublicInfo | null>
  acceptInvitationByLinkToken: (token: string) => Promise<SessionInvitation | null>
  acceptInvitationByCode: (
    payload: AcceptInvitationByCodePayload,
  ) => Promise<SessionInvitation | null>
  revokeInvitation: (id: string) => Promise<boolean>

  clearInvitationResult: () => void
  clearSelectedInvitation: () => void
  clearError: () => void
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}

export const useInvitationsStore = create<InvitationsState>((set) => ({
  invitations: [],
  selectedInvitation: null,
  createdInviteUrl: null,
  createdCode: null,
  isLoading: false,
  error: null,

  async fetchSessionInvitations(sessionId) {
    set({ isLoading: true, error: null })

    try {
      const invitations = await invitationsApi.getSessionInvitations(sessionId)

      set({
        invitations,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })
    }
  },

  async createSessionInvitation(sessionId, payload) {
    set({
      isLoading: true,
      error: null,
      createdInviteUrl: null,
      createdCode: null,
    })

    try {
      const response = await invitationsApi.createSessionInvitation(
        sessionId,
        payload,
      )

      set((state) => ({
        invitations: [response.invitation, ...state.invitations],
        createdInviteUrl: response.inviteUrl ?? null,
        createdCode: response.code ?? null,
        isLoading: false,
      }))

      return response.invitation
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async getInvitationByLinkToken(token) {
    set({ isLoading: true, error: null })

    try {
      const invitation = await invitationsApi.getInvitationByLinkToken(token)

      set({
        selectedInvitation: invitation,
        isLoading: false,
      })

      return invitation
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async acceptInvitationByLinkToken(token) {
    set({ isLoading: true, error: null })

    try {
      const invitation = await invitationsApi.acceptInvitationByLinkToken(token)

      set({
        isLoading: false,
      })

      return invitation
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async acceptInvitationByCode(payload) {
    set({ isLoading: true, error: null })

    try {
      const invitation = await invitationsApi.acceptInvitationByCode(payload)

      set({
        isLoading: false,
      })

      return invitation
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
      })

      return null
    }
  },

  async revokeInvitation(id) {
    set({ isLoading: true, error: null })

    try {
      await invitationsApi.revokeInvitation(id)

      set((state) => ({
        invitations: state.invitations.filter(
          (invitation) => invitation.id !== id,
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

  clearInvitationResult() {
    set({
      createdInviteUrl: null,
      createdCode: null,
    })
  },

  clearSelectedInvitation() {
    set({
      selectedInvitation: null,
    })
  },

  clearError() {
    set({
      error: null,
    })
  },
}))