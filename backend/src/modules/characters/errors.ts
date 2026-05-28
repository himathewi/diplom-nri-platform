import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors'

export class CharacterNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Character with id "${id}" not found` : 'Character not found',
      id ? { characterId: id } : undefined,
    )
  }
}

export class CharacterForbiddenError extends ForbiddenError {
  constructor(id?: string) {
    super('You do not have permission to access this character', {
      characterId: id,
    })
  }
}

export class SessionNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Session with id "${id}" not found` : 'Session not found',
      id ? { sessionId: id } : undefined,
    )
  }
}

export class InvalidSessionStatusForCharacterCreationError extends ConflictError {
  constructor(sessionId: string, status: string) {
    super('Characters can be created only for planned sessions', {
      sessionId,
      status,
    })
  }
}

export class RoleClassNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Role class with id "${id}" not found` : 'Role class not found',
      id ? { roleClassId: id } : undefined,
    )
  }
}

export class RoleClassNotAllowedError extends ForbiddenError {
  constructor(sessionId: string, roleClassId: string) {
    super('Selected role class is not allowed for this session', {
      sessionId,
      roleClassId,
    })
  }
}

export class CharacterAlreadyExistsForSessionError extends ConflictError {
  constructor(sessionId: string, userId: string) {
    super('User already has a character for this session', {
      sessionId,
      userId,
    })
  }
}

export class CurrentFatigueExceedsLimitError extends ValidationError {
  constructor(currentFatigue: number, fatigueLimit: number) {
    super('Current fatigue cannot exceed fatigue limit', {
      currentFatigue,
      fatigueLimit,
    })
  }
}

export class ItemNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Item with id "${id}" not found` : 'Item not found',
      id ? { itemId: id } : undefined,
    )
  }
}

export class ItemTemplateNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(
      id ? `Item template with id "${id}" not found` : 'Item template not found',
      id ? { itemTemplateId: id } : undefined,
    )
  }
}

export class ItemOwnershipError extends ForbiddenError {
  constructor(characterId?: string, itemId?: string) {
    super('Item does not belong to this character', {
      characterId,
      itemId,
    })
  }
}

export class InvalidItemQuantityError extends ValidationError {
  constructor(quantity?: number) {
    super('Invalid item quantity', {
      quantity,
    })
  }
}
