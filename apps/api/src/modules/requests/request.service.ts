import { Prisma } from "@prisma/client";
import type { CartPreviewItem, CreatedRequest, RequestRecord, RequestSubmission } from "@fominiapp/shared";

import { RequestStatus } from "@prisma/client";

import { ApiError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { batchService } from "../batch/batch.service.js";
import { cartService } from "../cart/cart.service.js";
import { googleSheetsService } from "../integrations/google-sheets.service.js";
import { telegramBotService } from "../integrations/telegram-bot.service.js";

function createTemporaryRequestId() {
  return `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function formatRequestId(batchSequence: number, requestSequence: number) {
  return `MSK-${String(batchSequence).padStart(4, "0")}-${String(requestSequence).padStart(8, "0")}`;
}

class RequestService {
  async createRequest(payload: RequestSubmission): Promise<RequestRecord> {
    const batch = await prisma.batch.findUnique({
      where: { batchId: payload.batchId }
    });

    if (!batch || batch.status !== "open") {
      throw new ApiError(400, "РЎР±РѕСЂ Р·Р°СЏРІРѕРє Р·Р°РєСЂС‹С‚ РёР»Рё batch РЅРµ РЅР°Р№РґРµРЅ");
    }

    const user = await prisma.user.upsert({
      where: { telegramUserId: payload.user.telegramUserId },
      update: {
        telegramUsername: payload.user.telegramUsername,
        firstName: payload.user.firstName,
        lastName: payload.user.lastName,
        phone: payload.user.phone,
        city: payload.user.city,
        pickupPoint: payload.user.pickupPoint
      },
      create: {
        telegramUserId: payload.user.telegramUserId,
        telegramUsername: payload.user.telegramUsername,
        firstName: payload.user.firstName,
        lastName: payload.user.lastName,
        phone: payload.user.phone,
        city: payload.user.city,
        pickupPoint: payload.user.pickupPoint
      }
    });

    const preview = await cartService.preview(payload.items);
    if (!preview.items.length) {
      throw new ApiError(400, "РљРѕСЂР·РёРЅР° РїСѓСЃС‚Р°");
    }

    const created = await prisma.request.create({
      data: {
        requestId: createTemporaryRequestId(),
        batchId: batch.id,
        userId: user.id,
        status: RequestStatus.submitted,
        estimatedTotal: preview.estimatedTotal,
        currency: preview.currency,
        comment: payload.comment,
        itemsJson: payload.items as unknown as Prisma.InputJsonValue,
        submittedAt: new Date(),
        items: {
          create: preview.items.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.productName,
            skuSnapshot: item.sku,
            unit: item.unit,
            qtyRequested: item.qtyRequested,
            priceSnapshot: item.price,
            estimatedSum: item.estimatedSum,
            itemComment: item.itemComment,
            isWeighted: item.isWeighted
          }))
        }
      }
    });

    await prisma.request.update({
      where: { id: created.id },
      data: {
        requestId: formatRequestId(batch.id, created.id)
      }
    });

    const record = await this.mapRequestRecord(created.id);
    const sheetsRow = googleSheetsService.createCustomerRow(record);

    await googleSheetsService.appendCustomerRequest(sheetsRow);
    await googleSheetsService.rebuildForBatch(batch.batchId);
    await telegramBotService.sendOrderSubmittedMessage(record.user, {
      requestId: record.requestId,
      status: record.status,
      estimatedTotal: record.estimatedTotal,
      currency: record.currency,
      submittedAt: record.submittedAt
    } satisfies CreatedRequest);

    return record;
  }

  async getMyRequests(telegramUserId: string) {
    const user = await prisma.user.findUnique({
      where: { telegramUserId }
    });

    if (!user) {
      return [];
    }

    const requests = await prisma.request.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return Promise.all(requests.map((request) => this.mapRequestRecord(request.id)));
  }

  async ensureActiveBatch() {
    return batchService.getActiveBatch();
  }

  private async mapRequestRecord(id: number): Promise<RequestRecord> {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: true,
        batch: true,
        items: true
      }
    });

    if (!request) {
      throw new ApiError(404, "Р—Р°СЏРІРєР° РЅРµ РЅР°Р№РґРµРЅР°");
    }

    return {
      id: request.id,
      requestId: request.requestId,
      status: request.status,
      estimatedTotal: Number(request.estimatedTotal),
      currency: "RUB",
      submittedAt: request.submittedAt.toISOString(),
      comment: request.comment ?? undefined,
      batch: {
        id: request.batch.id,
        batchId: request.batch.batchId,
        title: request.batch.title,
        city: request.batch.city,
        pickupPoint: request.batch.pickupPoint,
        status: request.batch.status,
        startAt: request.batch.startAt.toISOString(),
        endAt: request.batch.endAt.toISOString(),
        pickupWindow: request.batch.pickupWindow,
        isActive: request.batch.isActive
      },
      user: {
        telegramUserId: request.user.telegramUserId,
        telegramUsername: request.user.telegramUsername ?? undefined,
        firstName: request.user.firstName,
        lastName: request.user.lastName ?? undefined,
        phone: request.user.phone ?? "",
        city: request.user.city,
        pickupPoint: request.user.pickupPoint
      },
      items: request.items.map(
        (item): CartPreviewItem => ({
          productId: item.productId,
          productName: item.productNameSnapshot,
          sku: item.skuSnapshot,
          unit: item.unit as CartPreviewItem["unit"],
          qtyRequested: Number(item.qtyRequested),
          price: Number(item.priceSnapshot),
          estimatedSum: Number(item.estimatedSum),
          itemComment: item.itemComment ?? undefined,
          isWeighted: item.isWeighted
        })
      )
    };
  }
}

export const requestService = new RequestService();
