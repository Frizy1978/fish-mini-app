import { Router } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../../lib/http.js";
import { catalogService } from "./catalog.service.js";

const catalogRouter = Router();

const listSchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().optional()
});

catalogRouter.get(
  "/categories",
  asyncHandler(async (_request, response) => {
    response.json(await catalogService.getCategories());
  })
);

catalogRouter.get(
  "/products",
  asyncHandler(async (request, response) => {
    response.json(await catalogService.getProducts(listSchema.parse(request.query)));
  })
);

catalogRouter.get(
  "/products/:id",
  asyncHandler(async (request, response) => {
    const product = await catalogService.getProduct(Number(request.params.id));
    if (!product) {
      throw new ApiError(404, "Товар не найден");
    }
    response.json(product);
  })
);

catalogRouter.get(
  "/new",
  asyncHandler(async (_request, response) => {
    response.json(await catalogService.getFresh());
  })
);

catalogRouter.get(
  "/featured",
  asyncHandler(async (_request, response) => {
    response.json(await catalogService.getFeatured());
  })
);

catalogRouter.get(
  "/products/:id/related",
  asyncHandler(async (request, response) => {
    response.json(await catalogService.getRelated(Number(request.params.id)));
  })
);

export { catalogRouter };
