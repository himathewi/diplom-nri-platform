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
import { invitationsRoutes } from './modules/invitations/invitations.routes'
import { sessionEventsRoutes } from "./modules/session-events/session-events.routes";
import { decisionsRoutes } from "./modules/decisions/decisions.routes";
import { teamMetricsRoutes } from "./modules/team-metrics/team-metrics.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";

import { characterSheetRepository } from './modules/character-sheet/character-sheet.repository'
import { characterRoutes } from "./modules/characters/character.routes";
import { characterStatsRoutes } from "./modules/character-stats/character-stats.routes";
import { roleClassesRoutes } from "./modules/role-classes/role-classes.routes";
import { itemsRoutes } from "./modules/items/items.routes";
import { taskTemplatesRoutes } from "./modules/task-templates/task-templates.routes";

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

  const characterSheetService = new CharacterSheetService(
    characterSheetRepository,
  )

  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(teamsRoutes);
  await app.register(scenariosRoutes);
  await app.register(sessionsRoutes);
  await app.register(invitationsRoutes)
  await app.register(sessionEventsRoutes);
  await app.register(decisionsRoutes);
  await app.register(teamMetricsRoutes);
  await app.register(reportsRoutes);

  await app.register(roleClassesRoutes);
  await app.register(itemsRoutes);
  await app.register(taskTemplatesRoutes);

  await app.register(characterStatsRoutes);
  await app.register(characterRoutes);

  await app.register(characterSheetRoutes, {
    characterSheetService
  });

  return app;
}