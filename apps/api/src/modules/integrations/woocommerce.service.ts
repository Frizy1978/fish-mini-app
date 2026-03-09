import { Prisma } from "@prisma/client";
import { mockCategories, mockProducts, type Category, type Product } from "@fominiapp/shared";

import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";

interface WooProductResponse {
  id: number;
  sku: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  images?: Array<{ src: string }>;
  price?: string;
  categories?: Array<{ id: number; name: string }>;
  featured?: boolean;
  meta_data?: Array<{ key: string; value: string }>;
}

class WooCommerceService {
  async fetchCategories(): Promise<Category[]> {
    if (env.WOOCOMMERCE_MOCK_MODE || !env.WOOCOMMERCE_BASE_URL) {
      return mockCategories;
    }

    return mockCategories;
  }

  async fetchProducts(): Promise<Product[]> {
    if (env.WOOCOMMERCE_MOCK_MODE || !env.WOOCOMMERCE_BASE_URL) {
      return mockProducts;
    }

    const url = new URL("/wp-json/wc/v3/products", env.WOOCOMMERCE_BASE_URL);
    url.searchParams.set("consumer_key", env.WOOCOMMERCE_CONSUMER_KEY ?? "");
    url.searchParams.set("consumer_secret", env.WOOCOMMERCE_CONSUMER_SECRET ?? "");
    url.searchParams.set("per_page", "100");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      logger.error("WooCommerce request failed", await response.text());
      return mockProducts;
    }

    const payload = (await response.json()) as WooProductResponse[];
    return payload.map((item) => this.mapWooProduct(item));
  }

  async syncCatalog() {
    const products = await this.fetchProducts();

    for (const product of products) {
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

    return { synced: products.length, mode: env.WOOCOMMERCE_MOCK_MODE ? "mock" : "live" };
  }

  private mapWooProduct(item: WooProductResponse): Product {
    const unit = item.meta_data?.find((entry) => entry.key === "unit")?.value ?? "kg";
    const weighted = item.meta_data?.find((entry) => entry.key === "is_weighted")?.value === "true";
    const isNew = item.meta_data?.find((entry) => entry.key === "is_new")?.value === "true";

    return {
      id: item.id,
      wooProductId: item.id,
      sku: item.sku || `WC-${item.id}`,
      slug: item.slug,
      name: item.name,
      categoryIds: item.categories?.map((category) => category.id) ?? [],
      categoryNames: item.categories?.map((category) => category.name) ?? [],
      shortDescription: item.short_description || item.description || item.name,
      fullDescription: item.description || item.short_description || item.name,
      imageUrl: item.images?.[0]?.src ?? "/images/fish-steak.svg",
      accent: "from-cyan-300 via-sky-100 to-white",
      price: Number(item.price ?? 0),
      currency: "RUB",
      unit: unit === "pcs" || unit === "pack" ? unit : "kg",
      isWeighted: weighted,
      isNew,
      isFeatured: Boolean(item.featured),
      isActive: true,
      relatedProductIds: []
    };
  }
}

export const wooCommerceService = new WooCommerceService();
