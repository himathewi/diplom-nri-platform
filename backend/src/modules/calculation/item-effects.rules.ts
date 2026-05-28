import type { AbilityName, AbilityScores } from './stats.rules'
import { normalizeAbilityName } from './stats.rules'

export type ItemEffectDto = {
  stat?: AbilityName
  value?: number
}

type ItemWithEffects = {
  effects: ItemEffectDto[]
}

export function normalizeItemEffects(value: unknown): ItemEffectDto[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((effect) => normalizeItemEffect(effect))
    .filter((effect): effect is ItemEffectDto => effect !== null)
}

export function normalizeItemEffect(effect: unknown): ItemEffectDto | null {
  if (!effect || typeof effect !== 'object') {
    return null
  }

  const rawEffect = effect as {
    stat?: unknown
    value?: unknown
  }

  const stat =
    typeof rawEffect.stat === 'string'
      ? normalizeAbilityName(rawEffect.stat)
      : null

  if (!stat || typeof rawEffect.value !== 'number') {
    return null
  }

  return {
    stat,
    value: rawEffect.value,
  }
}

export function calculateFinalStats(
  baseStats: AbilityScores,
  availableItems: ItemWithEffects[],
): AbilityScores {
  const finalStats: AbilityScores = {
    ...baseStats,
  }

  for (const item of availableItems) {
    for (const effect of item.effects) {
      if (!effect.stat || typeof effect.value !== 'number') {
        continue
      }

      finalStats[effect.stat] += effect.value
    }
  }

  return finalStats
}
