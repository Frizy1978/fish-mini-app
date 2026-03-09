import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { adminService } from "./modules/admin/admin.service.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT}`);
  adminService.startCatalogSyncScheduler();
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info(`Received ${signal}, shutting down API`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info("API shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("API shutdown failed", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Forced API shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled promise rejection", error);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
  void shutdown("uncaughtException");
});
