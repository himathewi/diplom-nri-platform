export type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'

export type AbilityScores = Record<AbilityName, number>

export const abilityNames: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
]

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
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

export function isValidAbilityScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 30
}

export function validateAbilityScores(scores: AbilityScores): boolean {
  return abilityNames.every((ability) => isValidAbilityScore(scores[ability]))
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