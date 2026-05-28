import { ValidationError } from '../../shared/errors'
import { characterRepository } from '../characters/character.repository'
import {
  CharacterNotFoundError,
  InvalidItemQuantityError,
  ItemNotFoundError,
  ItemOwnershipError,
  ItemTemplateNotFoundError,
} from '../characters/errors'
import { characterInventoryRepository } from './character-inventory.repository'
import type {
  CreateItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'

export const characterInventoryService = {
  async getItemTemplates() {
    return characterInventoryRepository.findAllItemTemplates()
  },

  async addItem(characterId: string, data: CreateItemInput) {
    const character = await characterRepository.findById(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    let resolvedNameSnapshot = data.nameSnapshot

    if (data.itemTemplateId) {
      const template = await characterInventoryRepository.findItemTemplateById(
        data.itemTemplateId,
      )

      if (!template) {
        throw new ItemTemplateNotFoundError(data.itemTemplateId)
      }

      if (!resolvedNameSnapshot) {
        resolvedNameSnapshot = template.name
      }
    }

    if (!resolvedNameSnapshot) {
      throw new ValidationError(
        'nameSnapshot is required when itemTemplateId is not provided',
      )
    }

    return characterInventoryRepository.createItem(characterId, {
      ...data,
      nameSnapshot: resolvedNameSnapshot,
    })
  },

  async updateItem(characterId: string, itemId: string, data: UpdateItemInput) {
    const item = await characterInventoryRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new InvalidItemQuantityError(data.quantity)
    }

    return characterInventoryRepository.updateItem(itemId, data)
  },

  async deleteItem(characterId: string, itemId: string) {
    const item = await characterInventoryRepository.findItemById(itemId)

    if (!item) {
      throw new ItemNotFoundError(itemId)
    }

    if (item.characterId !== characterId) {
      throw new ItemOwnershipError(characterId, itemId)
    }

    return characterInventoryRepository.deleteItem(itemId)
  },
}
