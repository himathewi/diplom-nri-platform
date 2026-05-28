import type { RoleClass } from './roleClass'
import type { User } from './user'

export type TemplateSourceType = 'TEMPLATE' | 'CUSTOM'

export type TaskTemplate = {
  id: string
  title: string
  descriptionForModerator: string
  descriptionForParticipants: string
  difficulty: number
  fatigueCost: number | null
  recommendedRoleClassId: string | null
  recommendedItemId: string | null
  sourceType: TemplateSourceType
  createdById: string | null
  isPublicTemplate: boolean
  createdAt: string
  updatedAt: string

  createdBy?: User | null
  recommendedRoleClass?: RoleClass | null
}

export type CreateTaskTemplatePayload = {
  title: string
  descriptionForModerator: string
  descriptionForParticipants: string
  difficulty: number
  fatigueCost?: number | null
  recommendedRoleClassId?: string | null
  recommendedItemId?: string | null
  sourceType?: TemplateSourceType
  isPublicTemplate?: boolean
}

export type UpdateTaskTemplatePayload = Partial<CreateTaskTemplatePayload>