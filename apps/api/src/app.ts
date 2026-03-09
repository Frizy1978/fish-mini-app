import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { adminRouter } from "./modules/admin/admin.router.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { batchRouter } from "./modules/batch/batch.router.js";
import { cartRouter } from "./modules/cart/cart.router.js";
import { catalogRouter } from "./modules/catalog/catalog.router.js";
import { requestRouter } from "./modules/requests/request.router.js";

function buildAllowedOrigins() {
  const origins = new Set(env.CORS_ALLOWED_ORIGINS);

  if (env.TELEGRAM_MINI_APP_URL) {
    origins.add(env.TELEGRAM_MINI_APP_URL);
  }

  return origins;
}

export function createApp() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (!allowedOrigins.size || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin is not allowed"));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "fominiapp-api",
      mode: env.NODE_ENV
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/batch", batchRouter);
  app.use("/api/v1/catalog", catalogRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/requests", requestRouter);
  app.use("/api/v1/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
