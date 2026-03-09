import { Prisma } from "@prisma/client";
import type {
  ConsolidatedProductsSheetRow,
  CustomerRequestsSheetRow,
  RequestRecord
} from "@fominiapp/shared";

import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";

class GoogleSheetsService {
  async appendCustomerRequest(row: CustomerRequestsSheetRow) {
    await prisma.integrationJob.create({
      data: {
        type: "GOOGLE_SHEETS_APPEND_REQUEST",
        status: env.GOOGLE_SHEETS_MOCK_MODE ? "mocked" : "queued",
        entityId: row.request_id,
        payloadJson: row as unknown as Prisma.InputJsonValue
      }
    });

    if (env.GOOGLE_SHEETS_MOCK_MODE) {
      logger.info("Mock append to customer requests sheet", row);
      return { mode: "mock" };
    }

    logger.info("Google Sheets append scaffold invoked", {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
      requestId: row.request_id
    });

    return { mode: "live-scaffold" };
  }

  async upsertConsolidatedRows(rows: ConsolidatedProductsSheetRow[], batchId: string) {
    await prisma.integrationJob.create({
      data: {
        type: "GOOGLE_SHEETS_UPSERT_CONSOLIDATED",
        status: env.GOOGLE_SHEETS_MOCK_MODE ? "mocked" : "queued",
        entityId: batchId,
        payloadJson: rows as unknown as Prisma.InputJsonValue
      }
    });

    if (env.GOOGLE_SHEETS_MOCK_MODE) {
      logger.info("Mock upsert to consolidated sheet", { batchId, rows });
      return { mode: "mock", rows: rows.length };
    }

    logger.info("Google Sheets consolidated scaffold invoked", {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
      batchId,
      rows: rows.length
    });

    return { mode: "live-scaffold", rows: rows.length };
  }

  async rebuildForBatch(batchId: string) {
    const requests = await prisma.request.findMany({
      where: {
        batch: { is: { batchId } }
      },
      include: {
        user: true,
        items: true
      }
    });

    const consolidatedMap = new Map<number, ConsolidatedProductsSheetRow>();

    for (const request of requests) {
      for (const item of request.items) {
        const current = consolidatedMap.get(item.productId) ?? {
          batch_id: batchId,
          product_id: item.productId,
          sku: item.skuSnapshot,
          product_name: item.productNameSnapshot,
          unit: item.unit as ConsolidatedProductsSheetRow["unit"],
          ordered_qty_total: 0,
          buyers_count: 0,
          buyers_list: "",
          estimated_total_sum: 0,
          store_available_qty: 0,
          need_to_buy: 0,
          notes: ""
        };

        current.ordered_qty_total += Number(item.qtyRequested);
        current.buyers_count += 1;
        current.estimated_total_sum += Number(item.estimatedSum);
        current.buyers_list = [current.buyers_list, request.user.firstName]
          .filter(Boolean)
          .join(", ");
        current.need_to_buy = current.ordered_qty_total;

        consolidatedMap.set(item.productId, current);
      }
    }

    return this.upsertConsolidatedRows([...consolidatedMap.values()], batchId);
  }

  createCustomerRow(request: RequestRecord): CustomerRequestsSheetRow {
    return {
      request_id: request.requestId,
      created_at: request.submittedAt,
      batch_id: request.batch.batchId,
      telegram_user_id: request.user.telegramUserId,
      telegram_username: request.user.telegramUsername ?? "",
      customer_name: `${request.user.firstName} ${request.user.lastName ?? ""}`.trim(),
      phone: request.user.phone,
      city: request.user.city,
      pickup_point: request.user.pickupPoint,
      order_comment: request.comment ?? "",
      items_text: request.items
        .map((item) => `${item.productName} x ${item.qtyRequested} ${item.unit}`)
        .join("; "),
      items_json: JSON.stringify(request.items),
      estimated_total: request.estimatedTotal,
      currency: request.currency,
      status: request.status
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();
