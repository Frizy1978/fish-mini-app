import type { BatchSummary } from "@fominiapp/shared";

import { ApiError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";

type BatchRecord = Awaited<ReturnType<typeof prisma.batch.findFirstOrThrow>>;

function mapBatch(batch: BatchRecord): BatchSummary {
  return {
    id: batch.id,
    batchId: batch.batchId,
    title: batch.title,
    city: batch.city,
    pickupPoint: batch.pickupPoint,
    status: batch.status,
    startAt: batch.startAt.toISOString(),
    endAt: batch.endAt.toISOString(),
    pickupWindow: batch.pickupWindow,
    isActive: batch.isActive
  };
}

class BatchService {
  async getActiveBatch() {
    const batch = await prisma.batch.findFirst({
      where: {
        isActive: true
      }
    });

    if (!batch) {
      throw new ApiError(404, "Активный сбор заявок не найден");
    }

    return mapBatch(batch);
  }

  async activateBatch(batchId: string) {
    await prisma.batch.updateMany({
      data: { isActive: false },
      where: { isActive: true }
    });

    const batch = await prisma.batch.findUnique({
      where: { batchId }
    });

    if (!batch) {
      throw new ApiError(404, "Batch не найден");
    }

    const updated = await prisma.batch.update({
      where: { batchId },
      data: {
        isActive: true,
        status: "open"
      }
    });

    return mapBatch(updated);
  }

  async closeActiveBatch() {
    const activeBatch = await prisma.batch.findFirst({
      where: { isActive: true }
    });

    if (!activeBatch) {
      throw new ApiError(404, "Нет активного batch для закрытия");
    }

    const updated = await prisma.batch.update({
      where: { id: activeBatch.id },
      data: {
        isActive: false,
        status: "closed"
      }
    });

    return mapBatch(updated);
  }
}

export const batchService = new BatchService();
