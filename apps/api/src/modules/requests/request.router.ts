import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../../lib/http.js";
import { authService } from "../auth/auth.service.js";
import { requestService } from "./request.service.js";

const requestRouter = Router();

const submissionSchema = z.object({
  user: z.object({
    telegramUserId: z.string(),
    telegramUsername: z.string().optional(),
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    phone: z.string().min(6),
    city: z.string().min(1),
    pickupPoint: z.string().min(1)
  }),
  batchId: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.number(),
      qtyRequested: z.number().positive(),
      itemComment: z.string().max(240).optional()
    })
  ),
  comment: z.string().max(500).optional()
});

requestRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const session = await authService.getCurrentUser(request.headers.authorization);
    const payload = submissionSchema.parse(request.body);

    response.status(201).json(
      await requestService.createRequest({
        ...payload,
        user: {
          ...payload.user,
          telegramUserId: session.user.telegramUserId,
          telegramUsername: session.user.telegramUsername
        }
      })
    );
  })
);

requestRouter.get(
  "/my",
  asyncHandler(async (request, response) => {
    const session = await authService.getCurrentUser(request.headers.authorization);
    response.json(await requestService.getMyRequests(session.user.telegramUserId));
  })
);

export { requestRouter };
