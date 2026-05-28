import { Prisma } from '@prisma/client'

import { prisma } from '../../lib/prisma'

import type {
  CreateItemInput,
  UpdateItemInput,
} from './character-inventory.schemas'

type CreateCharacterItemRepositoryInput = Omit<
  CreateItemInput,
  'nameSnapshot'
> & {
  nameSnapshot: string
}

const characterItemInclude = {
  itemTemplate: true,
} as const

function toNullableJsonInput(
  value: unknown | null | undefined,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return Prisma.DbNull
  }

  return value as Prisma.InputJsonValue
}

export const characterInventoryRepository = {
  findByCharacterId(characterId: string) {
    return prisma.characterItem.findMany({
      where: {
        characterId,
      },
      include: characterItemInclude,
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  findItemById(itemId: string) {
    return prisma.characterItem.findUnique({
      where: {
        id: itemId,
      },
      include: characterItemInclude,
    })
  },

  findAllItemTemplates() {
    return prisma.itemTemplate.findMany({
      orderBy: {
        name: 'asc',
      },
    })
  },

  findItemTemplateById(itemTemplateId: string) {
    return prisma.itemTemplate.findUnique({
      where: {
        id: itemTemplateId,
      },
    })
  },

  createItem(characterId: string, data: CreateCharacterItemRepositoryInput) {
    return prisma.characterItem.create({
      data: {
        characterId,
        itemTemplateId: data.itemTemplateId ?? null,
        nameSnapshot: data.nameSnapshot,
        quantity: data.quantity ?? 1,
        notes: data.notes ?? null,
        type: data.type ?? null,
        effects: toNullableJsonInput(data.effects),
      },
      include: characterItemInclude,
    })
  },

  updateItem(itemId: string, data: UpdateItemInput) {
    return prisma.characterItem.update({
      where: {
        id: itemId,
      },
      data: {
        ...(data.nameSnapshot !== undefined && {
          nameSnapshot: data.nameSnapshot,
        }),
        ...(data.quantity !== undefined && {
          quantity: data.quantity,
        }),
        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
        ...(data.type !== undefined && {
          type: data.type,
        }),
        ...(data.effects !== undefined && {
          effects: toNullableJsonInput(data.effects),
        }),
      },
      include: characterItemInclude,
    })
  },

  deleteItem(itemId: string) {
    return prisma.characterItem.delete({
      where: {
        id: itemId,
      },
      include: characterItemInclude,
    })
  },
}
