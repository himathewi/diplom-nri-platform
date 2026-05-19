import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";

import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { AppError } from "./shared/errors";

import { authRoutes } from "./modules/auth/auth.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { teamsRoutes } from "./modules/teams/teams.routes";
import { scenariosRoutes } from "./modules/scenarios/scenarios.routes";
import { sessionsRoutes } from "./modules/sessions/sessions.routes";
import { sessionEventsRoutes } from "./modules/session-events/session-events.routes";
import { decisionsRoutes } from "./modules/decisions/decisions.routes";
import { teamMetricsRoutes } from './modules/team-metrics/team-metrics.routes'

import { characterRoutes } from "./modules/characters/character.routes";
import { characterHpRoutes } from "./modules/character-hp/character-hp.routes";
import { characterStatsRoutes } from "./modules/character-stats/character-stats.routes";
import { characterAttacksRoutes } from "./modules/character-attacks/character-attacks.routes";
import { characterSpellsRoutes } from "./modules/character-spells/character-spells.routes";
import { characterInventoryRoutes } from "./modules/character-inventory/character-inventory.routes";

import { characterRepository } from "./modules/characters/character.repository";
import { characterAttacksRepository } from "./modules/character-attacks/character-attacks.repository";
import { characterSpellsRepository } from "./modules/character-spells/character-spells.repository";
import { characterStatsRepository as characterStatsDbRepository } from "./modules/character-stats/character-stats.repository";
import { characterInventoryRepository as characterInventoryDbRepository } from "./modules/character-inventory/character-inventory.repository";

import { characterSheetRoutes } from "./modules/character-sheet/character-sheet.routes";
import { CharacterSheetService } from "./modules/character-sheet/character-sheet.service";

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }

    const normalizedError = error as {
      statusCode?: number;
      message?: string;
      code?: string;
    };

    const statusCode =
      typeof normalizedError.statusCode === "number"
        ? normalizedError.statusCode
        : 500;

    if (statusCode >= 500) {
      app.log.error(error);
    }

    return reply.status(statusCode).send({
      message:
        statusCode >= 500
          ? "Internal server error"
          : normalizedError.message || "Request failed",
      code: normalizedError.code ?? "UNHANDLED_ERROR"
    });
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "nri-moderation-backend"
    };
  });

  app.get("/db-check", async () => {
    const count = await prisma.character.count();

    return {
      status: "ok",
      charactersCount: count
    };
  });

  const characterForSheetRepository = {
    findByIdForSheet: (id: string) => characterRepository.findByIdForSheet(id)
  };

  const characterStatsRepository = {
    findByCharacterId: (characterId: string) =>
      characterStatsDbRepository.findStatsByCharacterId(characterId)
  };

  const characterAttackRepository = {
    findByCharacterId: (characterId: string) =>
      characterAttacksRepository.findAttacksByCharacterId(characterId)
  };

  const characterSpellRepository = {
    findByCharacterId: (characterId: string) =>
      characterSpellsRepository.findSpellsByCharacterId(characterId)
  };

  const characterItemRepository = {
    findByCharacterId: (characterId: string) =>
      characterInventoryDbRepository.findByCharacterId(characterId)
  };

  const characterSheetService = new CharacterSheetService(
    characterForSheetRepository,
    characterStatsRepository,
    characterAttackRepository,
    characterSpellRepository,
    characterItemRepository
  );

  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(teamsRoutes);
  await app.register(scenariosRoutes);
  await app.register(sessionsRoutes);
  await app.register(sessionEventsRoutes);
  await app.register(decisionsRoutes);
  await app.register(teamMetricsRoutes)

  await app.register(characterSheetRoutes, {
    characterSheetService
  });

  await app.register(characterHpRoutes);
  await app.register(characterStatsRoutes);
  await app.register(characterAttacksRoutes);
  await app.register(characterSpellsRoutes);
  await app.register(characterInventoryRoutes);
  await app.register(characterRoutes);

  return app;
}
