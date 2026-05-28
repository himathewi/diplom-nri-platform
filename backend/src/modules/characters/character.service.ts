import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.schemas'
import { characterRepository } from './character.repository'
import { CharacterForbiddenError, CharacterNotFoundError } from './errors'
import { toCharacterProfileDto } from './character.mappers'
import type { CurrentUser } from '../../shared/types'

function canManageAnyCharacter(currentUser: CurrentUser) {
  return currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR'
}

function canAccessCharacter(
  character: { userId: string | null },
  currentUser: CurrentUser,
) {
  return canManageAnyCharacter(currentUser) || character.userId === currentUser.id
}

async function assertCanAccessCharacter(
  characterId: string,
  currentUser: CurrentUser,
) {
  const character = await characterRepository.findAccessById(characterId)

  if (!character) {
    throw new CharacterNotFoundError(characterId)
  }

  if (!canAccessCharacter(character, currentUser)) {
    throw new CharacterForbiddenError(characterId)
  }

  return character
}

export const characterService = {
  // =========================================================
  // Characters
  // =========================================================

  async getCharacters(currentUser: CurrentUser) {
    const characters = canManageAnyCharacter(currentUser)
      ? await characterRepository.findAll()
      : await characterRepository.findAllByUserId(currentUser.id)

    return characters.map(toCharacterProfileDto)
  },

  async getCharacterById(id: string, currentUser: CurrentUser) {
    await assertCanAccessCharacter(id, currentUser)

    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    return toCharacterProfileDto(character)
  },

  async createCharacter(data: CreateCharacterInput, currentUser: CurrentUser) {
    // Если форма передала baseStats, стартовые HP считаются от их CON.
    // Без baseStats остаётся дефолтный CON 10.
    const constitution = data.baseStats?.constitution ?? 10
    const conModifier = Math.floor((constitution - 10) / 2)
    const maxHp = 8 + conModifier

    // Новый персонаж создаётся полностью здоровым:
    // currentHp = maxHp.
    //
    // Также сразу задаём hit dice:
    // 1 уровень = 1 кость хитов 1d8.
    const character = await characterRepository.create({
      ...data,
      userId: currentUser.id,

      currentHp: maxHp,
      temporaryHp: 0,
      inspiration: false,

    })

    return toCharacterProfileDto(character)
  },

  async updateCharacter(
    id: string,
    data: UpdateCharacterInput,
    currentUser: CurrentUser,
  ) {
    await assertCanAccessCharacter(id, currentUser)

    const character = await characterRepository.findById(id)

    if (!character) {
      throw new CharacterNotFoundError(id)
    }

    const updatedCharacter = await characterRepository.update(id, data)

    return toCharacterProfileDto(updatedCharacter)
  },

  async deleteCharacter(id: string, currentUser: CurrentUser) {
    await assertCanAccessCharacter(id, currentUser)

    const existingCharacter = await characterRepository.findById(id)

    if (!existingCharacter) {
      throw new CharacterNotFoundError(id)
    }

    await characterRepository.delete(id)
  },

  assertCanAccessCharacter,
}
