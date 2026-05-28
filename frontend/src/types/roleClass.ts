export type ClassAbility = {
  id: string
  roleClassId: string
  title: string
  description: string
  fatigueCost: number | null
  createdAt: string
  updatedAt: string
}

export type RoleClass = {
  id: string
  name: string
  description: string | null
  abilities: ClassAbility[]
  createdAt: string
  updatedAt: string
}

export type SessionAllowedRoleClass = {
  id: string
  sessionId: string
  roleClassId: string
  roleClass: RoleClass
  createdAt: string
}

export type CreateRoleClassPayload = {
  name: string
  description?: string | null
  abilities?: Array<{
    title: string
    description: string
    fatigueCost?: number | null
  }>
}

export type UpdateRoleClassPayload = Partial<CreateRoleClassPayload>

export type AddSessionAllowedRoleClassPayload = {
  roleClassId: string
}