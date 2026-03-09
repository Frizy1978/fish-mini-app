import { Prisma, PrismaClient, RequestStatus } from "@prisma/client";
import { demoUser, mockBatch, mockProducts } from "@fominiapp/shared";

const prisma = new PrismaClient();

async function main() {
  await prisma.batch.upsert({
    where: { batchId: mockBatch.batchId },
    update: {
      title: mockBatch.title,
      city: mockBatch.city,
      pickupPoint: mockBatch.pickupPoint,
      status: mockBatch.status,
      startAt: new Date(mockBatch.startAt),
      endAt: new Date(mockBatch.endAt),
      pickupWindow: mockBatch.pickupWindow,
      isActive: true
    },
    create: {
      id: mockBatch.id,
      batchId: mockBatch.batchId,
      title: mockBatch.title,
      city: mockBatch.city,
      pickupPoint: mockBatch.pickupPoint,
      status: mockBatch.status,
      startAt: new Date(mockBatch.startAt),
      endAt: new Date(mockBatch.endAt),
      pickupWindow: mockBatch.pickupWindow,
      isActive: true
    }
  });

  await prisma.user.upsert({
    where: { telegramUserId: demoUser.telegramUserId },
    update: {
      telegramUsername: demoUser.telegramUsername,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      phone: demoUser.phone,
      city: demoUser.city,
      pickupPoint: demoUser.pickupPoint
    },
    create: {
      telegramUserId: demoUser.telegramUserId,
      telegramUsername: demoUser.telegramUsername,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      phone: demoUser.phone,
      city: demoUser.city,
      pickupPoint: demoUser.pickupPoint
    }
  });

  for (const product of mockProducts) {
    await prisma.productCache.upsert({
      where: { id: product.id },
      update: {
        wooProductId: product.wooProductId,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        categoryIdsJson: product.categoryIds,
        categoryNamesJson: product.categoryNames,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        imageUrl: product.imageUrl,
        accent: product.accent,
        price: product.price,
        currency: product.currency,
        unit: product.unit,
        isWeighted: product.isWeighted,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        relatedIdsJson: product.relatedProductIds,
        payloadJson: product as unknown as Prisma.InputJsonValue,
        syncedAt: new Date()
      },
      create: {
        id: product.id,
        wooProductId: product.wooProductId,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        categoryIdsJson: product.categoryIds,
        categoryNamesJson: product.categoryNames,
        shortDescription: product.shortDescription,
        fullDescription: product.fullDescription,
        imageUrl: product.imageUrl,
        accent: product.accent,
        price: product.price,
        currency: product.currency,
        unit: product.unit,
        isWeighted: product.isWeighted,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        relatedIdsJson: product.relatedProductIds,
        payloadJson: product as unknown as Prisma.InputJsonValue,
        syncedAt: new Date()
      }
    });
  }

  const batch = await prisma.batch.findUniqueOrThrow({ where: { batchId: mockBatch.batchId } });
  const user = await prisma.user.findUniqueOrThrow({
    where: { telegramUserId: demoUser.telegramUserId }
  });

  await prisma.request.upsert({
    where: { requestId: "REQ-20260306-DEMO" },
    update: {},
    create: {
      requestId: "REQ-20260306-DEMO",
      batchId: batch.id,
      userId: user.id,
      status: RequestStatus.submitted,
      estimatedTotal: 2442,
      currency: "RUB",
      comment: "Если будет мидия крупнее, замените на нее.",
      itemsJson: [
        { productId: 101, qtyRequested: 0.8, itemComment: "Стейки потолще" },
        { productId: 107, qtyRequested: 1 }
      ],
      submittedAt: new Date("2026-03-06T10:00:00.000Z"),
      items: {
        create: [
          {
            productId: 101,
            productNameSnapshot: "Стейк лосося охлажденный",
            skuSnapshot: "SALMON-STEAK",
            unit: "kg",
            qtyRequested: 0.8,
            priceSnapshot: 2190,
            estimatedSum: 1752,
            itemComment: "Стейки потолще",
            isWeighted: true
          },
          {
            productId: 107,
            productNameSnapshot: "Форель слабосоленая нарезка",
            skuSnapshot: "TROUT-SLICED",
            unit: "pack",
            qtyRequested: 1,
            priceSnapshot: 690,
            estimatedSum: 690,
            isWeighted: false
          }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
