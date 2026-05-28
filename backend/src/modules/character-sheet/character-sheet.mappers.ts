import type { AbilityName, AbilityScores } from '../calculation/stats.rules'
import { normalizeItemEffects } from '../calculation/item-effects.rules'

import type {
  CharacterItemDto,
  CharacterProfileDto,
  EquipmentSlot,
} from './character-sheet.types'
import type {
  CharacterEntity,
  CharacterItemEntity,
  CharacterStatsEntity,
} from './character-sheet.contracts'

export function toCharacterProfileDto(
  character: CharacterEntity,
): CharacterProfileDto {
  return {
    id: character.id,
    name: character.name,
    race: character.race,
    className: character.className,
    level: character.level,

    description: character.description,
    alignment: character.alignment,
    background: character.background,
    avatarUrl: character.avatarUrl,

    currentHp: character.currentHp,
    temporaryHp: character.temporaryHp,
    speed: character.speed,
    inspiration: character.inspiration,

    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}

export function toCharacterItemDto(
  item: CharacterItemEntity,
): CharacterItemDto {
  const template = item.itemTemplate ?? null

  const hasItemType = item.type !== null && item.type !== undefined
  const hasItemEffects = item.effects !== null && item.effects !== undefined
  const hasItemAllowedSlots =
    item.allowedSlots !== null && item.allowedSlots !== undefined
  const hasTemplateAllowedSlots =
    template?.allowedSlots !== null && template?.allowedSlots !== undefined

  const type = hasItemType ? item.type : template?.type ?? 'misc'

  const itemEffects = normalizeItemEffects(item.effects)
  const templateEffects = normalizeItemEffects(template?.effects)

  const itemAllowedSlots = normalizeAllowedSlots(item.allowedSlots)
  const templateAllowedSlots = normalizeAllowedSlots(template?.allowedSlots)
  const templateSlot = normalizeAllowedSlots(template?.slot)

  return {
    id: item.id,
    itemId: item.id,
    name: item.nameSnapshot || template?.name || 'Item',
    type,
    effects: hasItemEffects ? itemEffects : templateEffects,
    allowedSlots: hasItemAllowedSlots
      ? itemAllowedSlots
      : hasTemplateAllowedSlots
        ? templateAllowedSlots
        : templateSlot,
    isEquipped: item.isEquipped,
    equippedSlot: normalizeEquipmentSlot(item.equippedSlot),
    quantity: item.quantity,
    notes: item.notes,
  }
}

export function toAbilityScores(
  stats: CharacterStatsEntity,
): AbilityScores {
  return {
    strength: stats.strength,
    dexterity: stats.dexterity,
    constitution: stats.constitution,
    intelligence: stats.intelligence,
    wisdom: stats.wisdom,
    charisma: stats.charisma,
  }
}

export function normalizeAbilityName(
  ability: AbilityName | string | null | undefined,
): AbilityName | null {
  if (
    ability === 'strength' ||
    ability === 'dexterity' ||
    ability === 'constitution' ||
    ability === 'intelligence' ||
    ability === 'wisdom' ||
    ability === 'charisma'
  ) {
    return ability
  }

  return null
}

function normalizeEquipmentSlot(slot: unknown): EquipmentSlot | null {
  if (
    slot === 'mainHand' ||
    slot === 'offHand' ||
    slot === 'head' ||
    slot === 'body' ||
    slot === 'ring1' ||
    slot === 'ring2' ||
    slot === 'amulet' ||
    slot === 'boots'
  ) {
    return slot
  }

  return null
}

function normalizeAllowedSlots(value: unknown): EquipmentSlot[] {
  if (!value) {
    return []
  }

  if (typeof value === 'string') {
    const slot = normalizeEquipmentSlot(value)
    return slot ? [slot] : []
  }

  if (Array.isArray(value)) {
    return value
      .map((slot) => normalizeEquipmentSlot(slot))
      .filter((slot): slot is EquipmentSlot => slot !== null)
  }

  return []
}
