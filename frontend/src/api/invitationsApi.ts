import { httpClient } from './httpClient'
import type {
  AcceptInvitationByCodePayload,
  CreateSessionInvitationPayload,
  CreateSessionInvitationResponse,
  InvitationPublicInfo,
  SessionInvitation,
} from '../types/invitation'

export const invitationsApi = {
  getSessionInvitations(sessionId: string) {
    return httpClient.get<SessionInvitation[]>(
      `/sessions/${sessionId}/invitations`,
    )
  },

  createSessionInvitation(
    sessionId: string,
    payload: CreateSessionInvitationPayload,
  ) {
    return httpClient.post<CreateSessionInvitationResponse>(
      `/sessions/${sessionId}/invitations`,
      payload,
    )
  },

  getInvitationByLinkToken(token: string) {
    return httpClient.get<InvitationPublicInfo>(`/invitations/link/${token}`)
  },

  acceptInvitationByLinkToken(token: string) {
    return httpClient.post<SessionInvitation>(
      `/invitations/link/${token}/accept`,
    )
  },

  acceptInvitationByCode(payload: AcceptInvitationByCodePayload) {
    return httpClient.post<SessionInvitation>(
      '/invitations/code/accept',
      payload,
    )
  },

  revokeInvitation(id: string) {
    return httpClient.delete<void>(`/invitations/${id}`)
  },
}