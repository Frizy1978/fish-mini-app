import { calculateCartPreview, type CartItemInput, type Product } from "@fominiapp/shared";

import { prisma } from "../../lib/prisma.js";

class CartService {
  async preview(items: CartItemInput[]) {
    const products = await prisma.productCache.findMany({
      where: {
        id: { in: items.map((item) => item.productId) },
        isActive: true
      }
    });

    return calculateCartPreview(
      items,
      products.map(
        (product): Product => ({
          id: product.id,
          wooProductId: product.wooProductId,
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          categoryIds: product.categoryIdsJson as number[],
          categoryNames: product.categoryNamesJson as string[],
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          imageUrl: product.imageUrl,
          accent: product.accent,
          price: Number(product.price),
          currency: "RUB",
          unit: product.unit as Product["unit"],
          isWeighted: product.isWeighted,
          isNew: product.isNew,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          relatedProductIds: product.relatedIdsJson as number[]
        })
      )
    );
  }
}

export const cartService = new CartService();
