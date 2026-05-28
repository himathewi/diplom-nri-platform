/// <reference types="node" />

import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable ${name} is required`)
  }

  return value.trim()
}

async function main() {
  const email = getRequiredEnv('ADMIN_EMAIL').toLowerCase()
  const password = getRequiredEnv('ADMIN_PASSWORD')
  const name = process.env.ADMIN_NAME?.trim() || 'Администратор'

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must contain at least 8 characters')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      password: passwordHash,
      role: 'ADMIN',
    },
    create: {
      email,
      name,
      password: passwordHash,
      role: 'ADMIN',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  console.log('Admin user is ready:')
  console.log(admin)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })