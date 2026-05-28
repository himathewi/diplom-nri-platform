export const abilityKeys = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const

export type AbilityKey = (typeof abilityKeys)[number]

export type AbilityScores = Record<AbilityKey, number>

export type AttributeEffectDto = {
  attribute: AbilityKey
  modifier: number
  sourceItemId: string
  sourceName: string
}

export type FatigueState = 'NORMAL' | 'OVERLOADED' | 'EXHAUSTED'

export type CharacterFatigueDto = {
  limit: number
  current: number
  remaining: number
  state: FatigueState
}

export const defaultAbilityScores: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

export function isAbilityKey(value: unknown): value is AbilityKey {
  return typeof value === 'string' && abilityKeys.includes(value as AbilityKey)
}

export function getAbilityModifier(value: number) {
  return Math.floor((value - 10) / 2)
}

export function getAbilityModifiers(scores: AbilityScores): AbilityScores {
  return {
    strength: getAbilityModifier(scores.strength),
    dexterity: getAbilityModifier(scores.dexterity),
    constitution: getAbilityModifier(scores.constitution),
    intelligence: getAbilityModifier(scores.intelligence),
    wisdom: getAbilityModifier(scores.wisdom),
    charisma: getAbilityModifier(scores.charisma),
  }
}

function clampAbilityScore(value: number) {
  return Math.min(30, Math.max(1, value))
}

export function applyAttributeEffects(
  baseScores: AbilityScores,
  effects: AttributeEffectDto[],
): AbilityScores {
  const result: AbilityScores = {
    ...baseScores,
  }

  for (const effect of effects) {
    result[effect.attribute] = clampAbilityScore(
      result[effect.attribute] + effect.modifier,
    )
  }

  return result
}

export function calculateCharacterFatigue(input: {
  limit: number
  current: number
}): CharacterFatigueDto {
  const remaining = input.limit - input.current

  let state: FatigueState = 'NORMAL'

  if (input.current === input.limit + 1) {
    state = 'OVERLOADED'
  }

  if (input.current > input.limit + 1) {
    state = 'EXHAUSTED'
  }

  return {
    limit: input.limit,
    current: input.current,
    remaining: Math.max(0, remaining),
    state,
  }
}

export function normalizeAttributeEffects(
  rawEffects: unknown,
  source: {
    sourceItemId: string
    sourceName: string
  },
): AttributeEffectDto[] {
  if (!rawEffects) {
    return []
  }

  if (Array.isArray(rawEffects)) {
    return rawEffects.flatMap((effect) => {
      if (
        typeof effect !== 'object'
        || effect === null
        || !('attribute' in effect)
        || !('modifier' in effect)
      ) {
        return []
      }

      const attribute = (effect as { attribute: unknown }).attribute
      const modifier = (effect as { modifier: unknown }).modifier

      if (!isAbilityKey(attribute) || typeof modifier !== 'number') {
        return []
      }

      return [
        {
          attribute,
          modifier,
          sourceItemId: source.sourceItemId,
          sourceName: source.sourceName,
        },
      ]
    })
  }

  if (typeof rawEffects === 'object') {
    return Object.entries(rawEffects as Record<string, unknown>).flatMap(
      ([attribute, modifier]) => {
        if (!isAbilityKey(attribute) || typeof modifier !== 'number') {
          return []
        }

        return [
          {
            attribute,
            modifier,
            sourceItemId: source.sourceItemId,
            sourceName: source.sourceName,
          },
        ]
      },
    )
  }

  return []
}