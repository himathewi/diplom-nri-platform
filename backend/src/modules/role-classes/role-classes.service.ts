import type { CurrentUser } from '../../shared/types'

import {
  InvalidSessionStatusForRoleClassesError,
  RoleClassAlreadyAllowedError,
  RoleClassForbiddenError,
  RoleClassNotAllowedError,
  RoleClassNotFoundError,
  RoleClassSkillAlreadyExistsError,
  RoleClassSkillNotFoundError,
  RoleClassValidationError,
  SessionForbiddenError,
  SessionNotFoundError,
} from './role-classes.errors'

import { roleClassesRepository } from './role-classes.repository'

import type {
  AllowRoleClassForSessionInput,
  CreateRoleClassInput,
  CreateRoleClassSkillInput,
  UpdateRoleClassSkillInput,
  UpdateRoleClassInput,
} from './role-classes.schemas'

function canManageCatalog(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canManageSession(
  session: {
    moderatorId: string
  },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN'
    || (
      currentUser.role === 'MODERATOR'
      && session.moderatorId === currentUser.id
    )
  )
}

function canViewSession(
  session: {
    moderatorId: string
    participants: { userId: string }[]
    team: { members: { userId: string }[] } | null
  },
  currentUser: CurrentUser,
) {
  if (canManageSession(session, currentUser)) {
    return true
  }

  if (currentUser.role !== 'PARTICIPANT') {
    return false
  }

  const isParticipant = session.participants.some(
    (participant) => participant.userId === currentUser.id,
  )

  const isTeamMember = Boolean(
    session.team?.members.some((member) => member.userId === currentUser.id),
  )

  return isParticipant || isTeamMember
}

function assertCanManageCatalog(currentUser: CurrentUser) {
  if (!canManageCatalog(currentUser)) {
    throw new RoleClassForbiddenError()
  }
}

function assertSessionCanBeConfigured(session: {
  id: string
  status: string
}) {
  if (session.status !== 'PLANNED') {
    throw new InvalidSessionStatusForRoleClassesError(
      session.id,
      session.status,
    )
  }
}

async function assertRoleClassExists(roleClassId: string) {
  const roleClass = await roleClassesRepository.findById(roleClassId)

  if (!roleClass) {
    throw new RoleClassNotFoundError(roleClassId)
  }

  return roleClass
}

async function assertUniqueRoleClassName(name: string, currentId?: string) {
  const existing = await roleClassesRepository.findByName(name)

  if (existing && existing.id !== currentId) {
    throw new RoleClassValidationError(
      `Role class with name "${name}" already exists`,
    )
  }
}

async function assertUniqueRoleClassSkillName(
  roleClassId: string,
  name: string,
  currentSkillId?: string,
) {
  const existing = await roleClassesRepository.findSkillByName(roleClassId, name)

  if (existing && existing.id !== currentSkillId) {
    throw new RoleClassSkillAlreadyExistsError(roleClassId, name)
  }
}

async function assertUniqueRoleClassSkillNames(
  roleClassId: string,
  skills: CreateRoleClassInput['skills'],
) {
  if (!skills || skills.length === 0) {
    return
  }

  const normalizedNames = new Set<string>()

  for (const skill of skills) {
    const normalizedName = skill.name.trim().toLowerCase()

    if (normalizedNames.has(normalizedName)) {
      throw new RoleClassSkillAlreadyExistsError(roleClassId, skill.name)
    }

    normalizedNames.add(normalizedName)
  }
}

function canReadRoleClass(
  roleClass: {
    isPublic: boolean
    createdById: string | null
  },
  currentUser: CurrentUser,
) {
  return (
    currentUser.role === 'ADMIN'
    || roleClass.isPublic
    || roleClass.createdById === currentUser.id
  )
}

function canManageRoleClass(
  roleClass: {
    createdById: string | null
  },
  currentUser: CurrentUser,
) {
  return currentUser.role === 'ADMIN' || roleClass.createdById === currentUser.id
}

async function assertRoleClassCanBeManaged(
  roleClassId: string,
  currentUser: CurrentUser,
) {
  assertCanManageCatalog(currentUser)

  const roleClass = await roleClassesRepository.findById(roleClassId)

  if (!roleClass) {
    throw new RoleClassNotFoundError(roleClassId)
  }

  if (!canManageRoleClass(roleClass, currentUser)) {
    throw new RoleClassForbiddenError()
  }

  return roleClass
}

async function assertRoleClassSkillCanBeManaged(
  skillId: string,
  currentUser: CurrentUser,
) {
  assertCanManageCatalog(currentUser)

  const skill = await roleClassesRepository.findSkillById(skillId)

  if (!skill) {
    throw new RoleClassSkillNotFoundError(skillId)
  }

  if (!canManageRoleClass(skill.roleClass, currentUser)) {
    throw new RoleClassForbiddenError()
  }

  return skill
}

function assertRoleClassCanBeUsedInSession(
  roleClass: {
    id: string
    isPublic: boolean
    isActive: boolean
    createdById: string | null
  },
  session: {
    moderatorId: string
  },
) {
  if (!roleClass.isActive) {
    throw new RoleClassNotFoundError(roleClass.id)
  }

  if (!roleClass.isPublic && roleClass.createdById !== session.moderatorId) {
    throw new RoleClassForbiddenError()
  }
}

export const roleClassesService = {
  async getRoleClasses(currentUser: CurrentUser) {
    assertCanManageCatalog(currentUser)

    if (currentUser.role === 'ADMIN') {
      return roleClassesRepository.findAll()
    }

    return roleClassesRepository.findVisibleForModerator(currentUser.id)
  },

  async getRoleClassById(roleClassId: string, currentUser: CurrentUser) {
    assertCanManageCatalog(currentUser)

    const roleClass = await roleClassesRepository.findById(roleClassId)

    if (!roleClass) {
      throw new RoleClassNotFoundError(roleClassId)
    }

    if (!canReadRoleClass(roleClass, currentUser)) {
      throw new RoleClassForbiddenError()
    }

    return roleClass
  },

  async createRoleClass(
    data: CreateRoleClassInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageCatalog(currentUser)
    await assertUniqueRoleClassName(data.name)
    await assertUniqueRoleClassSkillNames('new', data.skills)

    return roleClassesRepository.create(
      data,
      currentUser.id,
      currentUser.role === 'ADMIN' ? data.isPublic ?? true : false,
    )
  },

  async updateRoleClass(
    roleClassId: string,
    data: UpdateRoleClassInput,
    currentUser: CurrentUser,
  ) {
    assertCanManageCatalog(currentUser)

    const roleClass = await roleClassesRepository.findById(roleClassId)

    if (!roleClass) {
      throw new RoleClassNotFoundError(roleClassId)
    }

    if (!canManageRoleClass(roleClass, currentUser)) {
      throw new RoleClassForbiddenError()
    }

    if (currentUser.role === 'MODERATOR' && data.isPublic === true) {
      throw new RoleClassForbiddenError()
    }

    if (data.name !== undefined) {
      await assertUniqueRoleClassName(data.name, roleClassId)
    }

    return roleClassesRepository.update(roleClassId, data)
  },

  async deleteRoleClass(roleClassId: string, currentUser: CurrentUser) {
    assertCanManageCatalog(currentUser)

    const roleClass = await roleClassesRepository.findById(roleClassId)

    if (!roleClass) {
      throw new RoleClassNotFoundError(roleClassId)
    }

    if (!canManageRoleClass(roleClass, currentUser)) {
      throw new RoleClassForbiddenError()
    }

    return roleClassesRepository.deactivate(roleClassId)
  },

  async createRoleClassSkill(
    roleClassId: string,
    data: CreateRoleClassSkillInput,
    currentUser: CurrentUser,
  ) {
    await assertRoleClassCanBeManaged(roleClassId, currentUser)
    await assertUniqueRoleClassSkillName(roleClassId, data.name)

    return roleClassesRepository.createSkill(roleClassId, data)
  },

  async updateRoleClassSkill(
    roleClassId: string,
    skillId: string,
    data: UpdateRoleClassSkillInput,
    currentUser: CurrentUser,
  ) {
    const skill = await assertRoleClassSkillCanBeManaged(skillId, currentUser)

    if (skill.roleClassId !== roleClassId) {
      throw new RoleClassSkillNotFoundError(skillId)
    }

    if (data.name !== undefined) {
      await assertUniqueRoleClassSkillName(roleClassId, data.name, skillId)
    }

    return roleClassesRepository.updateSkill(skillId, data)
  },

  async deleteRoleClassSkill(
    roleClassId: string,
    skillId: string,
    currentUser: CurrentUser,
  ) {
    const skill = await assertRoleClassSkillCanBeManaged(skillId, currentUser)

    if (skill.roleClassId !== roleClassId) {
      throw new RoleClassSkillNotFoundError(skillId)
    }

    return roleClassesRepository.deleteSkill(skillId)
  },

  async getSessionRoleClasses(sessionId: string, currentUser: CurrentUser) {
    const session = await roleClassesRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canViewSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    return roleClassesRepository.findSessionAllowedRoleClasses(sessionId)
  },

  async allowRoleClassForSession(
    sessionId: string,
    data: AllowRoleClassForSessionInput,
    currentUser: CurrentUser,
  ) {
    const session = await roleClassesRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canManageSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    assertSessionCanBeConfigured(session)
    const roleClass = await assertRoleClassExists(data.roleClassId)
    assertRoleClassCanBeUsedInSession(roleClass, session)

    const existing = await roleClassesRepository.findSessionAllowedRoleClass(
      sessionId,
      data.roleClassId,
    )

    if (existing) {
      throw new RoleClassAlreadyAllowedError(sessionId, data.roleClassId)
    }

    return roleClassesRepository.createSessionAllowedRoleClass(
      sessionId,
      data.roleClassId,
    )
  },

  async removeRoleClassFromSession(
    sessionId: string,
    roleClassId: string,
    currentUser: CurrentUser,
  ) {
    const session = await roleClassesRepository.findSessionForAccess(sessionId)

    if (!session) {
      throw new SessionNotFoundError(sessionId)
    }

    if (!canManageSession(session, currentUser)) {
      throw new SessionForbiddenError()
    }

    assertSessionCanBeConfigured(session)
    await assertRoleClassExists(roleClassId)

    const allowedRoleClass =
      await roleClassesRepository.findSessionAllowedRoleClass(
        sessionId,
        roleClassId,
      )

    if (!allowedRoleClass) {
      throw new RoleClassNotAllowedError(sessionId, roleClassId)
    }

    return roleClassesRepository.deleteSessionAllowedRoleClass(
      sessionId,
      roleClassId,
    )
  },
}
