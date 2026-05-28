export type HpRule = {
  hitDie: number
  levelOneBase: number
  fixedPerLevel: number
}

type CharacterForHpCalculation = {
  level: number
  stats?: {
    constitution?: number | null
  } | null
}

const DEFAULT_HP_RULE: HpRule = {
  hitDie: 8,
  levelOneBase: 8,
  fixedPerLevel: 5,
}

export function getHpRuleForCharacter(
  _character: CharacterForHpCalculation,
): HpRule {
  return DEFAULT_HP_RULE
}

export function getConModifier(constitution: number): number {
  return Math.floor((constitution - 10) / 2)
}

export function calculateMaxHp(character: CharacterForHpCalculation): number {
  const rule = getHpRuleForCharacter(character)
  const constitution = character.stats?.constitution ?? 10
  const conModifier = getConModifier(constitution)

  return rule.levelOneBase + conModifier
}
