import { Prisma } from '@prisma/client'

import { prisma } from '../../lib/prisma'

const characterSheetInclude = Prisma.validator<Prisma.CharacterInclude>()({
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  },
  roleClass: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
  stats: true,
  sessionParticipants: {
    include: {
      session: {
        select: {
          id: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          createdAt: true,
          updatedAt: true,
          scenario: {
            select: {
              id: true,
              title: true,
              description: true,
              goal: true,
              difficulty: true,
              direction: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
        },
      },
      items: {
        include: {
          item: {
            select: {
              id: true,
              name: true,
              type: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
})

export const characterSheetRepository = {
  findByIdForSheet(characterId: string) {
    return prisma.character.findUnique({
      where: {
        id: characterId,
      },
      include: characterSheetInclude,
    })
  },
}

export type CharacterSheetRepository = typeof characterSheetRepository

export type CharacterSheetEntity = NonNullable<
  Awaited<ReturnType<CharacterSheetRepository['findByIdForSheet']>>
>