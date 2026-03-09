import { batchService } from "../batch/batch.service.js";
import { googleSheetsService } from "../integrations/google-sheets.service.js";
import { wooCommerceService } from "../integrations/woocommerce.service.js";

class AdminService {
  async syncCatalog() {
    return wooCommerceService.syncCatalog("manual");
  }

  startCatalogSyncScheduler() {
    wooCommerceService.startScheduler();
  }

  async rebuildSheets(batchId: string) {
    return googleSheetsService.rebuildForBatch(batchId);
  }

  async activateBatch(batchId: string) {
    return batchService.activateBatch(batchId);
  }

  async closeActiveBatch() {
    return batchService.closeActiveBatch();
  }
}

export const adminService = new AdminService();
