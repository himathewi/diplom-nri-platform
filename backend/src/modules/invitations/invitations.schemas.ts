import { InvitationType } from '@prisma/client'
import { z } from 'zod'

export const sessionInvitationParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict()

export const invitationParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

export const invitationTokenParamsSchema = z
  .object({
    token: z.string().min(16),
  })
  .strict()

export const createInvitationSchema = z
  .object({
    type: z.nativeEnum(InvitationType).default(InvitationType.LINK),
    invitedUserId: z.string().uuid().nullable().optional(),
    expiresInHours: z.number().int().min(1).max(168).default(24),
  })
  .strict()

export const acceptCodeInvitationSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, 'Invitation code must contain 6 digits'),
  })
  .strict()

export type SessionInvitationParamsInput = z.infer<
  typeof sessionInvitationParamsSchema
>

export type InvitationParamsInput = z.infer<typeof invitationParamsSchema>

export type InvitationTokenParamsInput = z.infer<
  typeof invitationTokenParamsSchema
>

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>

export type AcceptCodeInvitationInput = z.infer<
  typeof acceptCodeInvitationSchema
>