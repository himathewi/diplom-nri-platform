import { prisma } from '../../lib/prisma'
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.schemas'

const characterProfileSelect = {
  id: true,
  userId: true,

  name: true,
  race: true,
  className: true,
  level: true,

  description: true,
  alignment: true,
  background: true,
  avatarUrl: true,

  currentHp: true,
  temporaryHp: true,
  speed: true,
  inspiration: true,

  stats: {
    select: {
      strength: true,
      dexterity: true,
      constitution: true,
      intelligence: true,
      wisdom: true,
      charisma: true,
    },
  },

  createdAt: true,
  updatedAt: true,
} as const

const characterSheetInclude = {
  stats: true,
  items: {
    include: {
      itemTemplate: true,
    },
  },
} as const

type CreateCharacterRepositoryInput = CreateCharacterInput & {
  userId: string
  currentHp: number
  temporaryHp: number
  inspiration: boolean
}

export const characterRepository = {
  findAll() {
    return prisma.character.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: characterProfileSelect,
    })
  },

  findAllByUserId(userId: string) {
    return prisma.character.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: characterProfileSelect,
    })
  },

  findById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: characterProfileSelect,
    })
  },

  findAccessById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    })
  },

  findByIdForSheet(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: characterSheetInclude,
    })
  },

  create(data: CreateCharacterRepositoryInput) {
    return prisma.character.create({
      data: {
        name: data.name,
        userId: data.userId,
        race: data.race,
        className: data.className,
        level: data.level ?? 1,

        description: data.description ?? null,
        alignment: data.alignment ?? null,
        background: data.background ?? null,

        avatarUrl:
          typeof data.avatarUrl === 'string' && data.avatarUrl.trim()
            ? data.avatarUrl
            : null,

        currentHp: data.currentHp,
        temporaryHp: data.temporaryHp,
        speed: data.speed ?? 30,
        inspiration: data.inspiration,

        stats: {
          create: {
            strength: data.baseStats?.strength ?? 10,
            dexterity: data.baseStats?.dexterity ?? 10,
            constitution: data.baseStats?.constitution ?? 10,
            intelligence: data.baseStats?.intelligence ?? 10,
            wisdom: data.baseStats?.wisdom ?? 10,
            charisma: data.baseStats?.charisma ?? 10,
          },
        },
      },
      select: characterProfileSelect,
    })
  },

  update(id: string, data: UpdateCharacterInput) {
    return prisma.character.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.race !== undefined && { race: data.race }),
        ...(data.className !== undefined && { className: data.className }),

        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.alignment !== undefined && {
          alignment: data.alignment,
        }),
        ...(data.background !== undefined && {
          background: data.background,
        }),

        ...(data.avatarUrl !== undefined && {
          avatarUrl:
            typeof data.avatarUrl === 'string' && data.avatarUrl.trim()
              ? data.avatarUrl
              : null,
        }),

        ...(data.speed !== undefined && { speed: data.speed }),
      },
      select: characterProfileSelect,
    })
  },

  findHealthStateById(id: string) {
    return prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        level: true,
        currentHp: true,
        temporaryHp: true,
        stats: {
          select: {
            constitution: true,
          },
        },
      },
    })
  },

  updateHealthState(
    id: string,
    data: {
      currentHp: number
      temporaryHp: number
    },
  ) {
    return prisma.character.update({
      where: { id },
      data,
      select: characterProfileSelect,
    })
  },

  delete(id: string) {
    return prisma.character.delete({
      where: { id },
    })
  },
}
