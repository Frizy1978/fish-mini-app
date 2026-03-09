import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../../lib/http.js";
import { adminService } from "./admin.service.js";

const adminRouter = Router();

const activateSchema = z.object({
  batchId: z.string().min(1)
});

adminRouter.post(
  "/catalog/sync",
  asyncHandler(async (_request, response) => {
    response.json(await adminService.syncCatalog());
  })
);

adminRouter.post(
  "/sheets/rebuild/:batchId",
  asyncHandler(async (request, response) => {
    response.json(await adminService.rebuildSheets(String(request.params.batchId)));
  })
);

adminRouter.post(
  "/batch/activate",
  asyncHandler(async (request, response) => {
    response.json(await adminService.activateBatch(activateSchema.parse(request.body).batchId));
  })
);

adminRouter.post(
  "/batch/close",
  asyncHandler(async (_request, response) => {
    response.json(await adminService.closeActiveBatch());
  })
);

export { adminRouter };
