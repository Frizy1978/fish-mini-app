import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../../lib/http.js";
import { authService } from "./auth.service.js";

const authRouter = Router();

const telegramSchema = z.object({
  initData: z.string().optional(),
  initDataUnsafe: z
    .object({
      user: z
        .object({
          id: z.number(),
          username: z.string().optional(),
          first_name: z.string().optional(),
          last_name: z.string().optional()
        })
        .optional()
    })
    .optional()
});

authRouter.post(
  "/telegram",
  asyncHandler(async (request, response) => {
    const payload = telegramSchema.parse(request.body);
    response.json(await authService.authenticateTelegram(payload));
  })
);

authRouter.get(
  "/me",
  asyncHandler(async (request, response) => {
    response.json(await authService.getCurrentUser(request.headers.authorization));
  })
);

export { authRouter };
