import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../../lib/http.js";
import { cartService } from "./cart.service.js";

const cartRouter = Router();

const previewSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number(),
      qtyRequested: z.number().positive(),
      itemComment: z.string().max(240).optional()
    })
  )
});

cartRouter.post(
  "/preview",
  asyncHandler(async (request, response) => {
    const payload = previewSchema.parse(request.body);
    response.json(await cartService.preview(payload.items));
  })
);

export { cartRouter };
