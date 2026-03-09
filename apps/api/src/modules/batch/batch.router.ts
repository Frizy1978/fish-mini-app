import { Router } from "express";

import { asyncHandler } from "../../lib/http.js";
import { batchService } from "./batch.service.js";

const batchRouter = Router();

batchRouter.get(
  "/active",
  asyncHandler(async (_request, response) => {
    response.json(await batchService.getActiveBatch());
  })
);

export { batchRouter };
