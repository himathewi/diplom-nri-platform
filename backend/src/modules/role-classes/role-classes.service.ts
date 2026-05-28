import type { CurrentUser } from '../../shared/types'

import {
  InvalidSessionStatusForRoleClassesError,
  RoleClassAlreadyAllowedError,
  RoleClassForbiddenError,
  RoleClassNotAllowedError,
  RoleClassNotFoundError,
  RoleClassValidationError,
  SessionForbiddenError,
  SessionNotFoundError,
} from './role-classes.errors'

import { roleClassesRepository } from './role-classes.repository'

import type {
  AllowRoleClassForSessionInput,
  CreateRoleClassInput,
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
