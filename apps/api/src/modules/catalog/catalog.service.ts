import {
  getRelatedProducts,
  mockCategories,
  type CatalogFilters,
  type Category,
  type Product
} from "@fominiapp/shared";

import { prisma } from "../../lib/prisma.js";

type ProductRecord = Awaited<ReturnType<typeof prisma.productCache.findFirstOrThrow>>;

function mapProduct(record: ProductRecord): Product {
  return {
    id: record.id,
    wooProductId: record.wooProductId,
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    categoryIds: record.categoryIdsJson as number[],
    categoryNames: record.categoryNamesJson as string[],
    shortDescription: record.shortDescription,
    fullDescription: record.fullDescription,
    imageUrl: record.imageUrl,
    accent: record.accent,
    price: Number(record.price),
    currency: "RUB",
    unit: record.unit as Product["unit"],
    isWeighted: record.isWeighted,
    isNew: record.isNew,
    isFeatured: record.isFeatured,
    isActive: record.isActive,
    relatedProductIds: record.relatedIdsJson as number[]
  };
}

class CatalogService {
  async getCategories(): Promise<Category[]> {
    return mockCategories;
  }

  async getProducts(filters: CatalogFilters = {}) {
    const products = await prisma.productCache.findMany({
      where: {
        isActive: true,
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { shortDescription: { contains: filters.search, mode: "insensitive" } },
                { sku: { contains: filters.search, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: [{ isFeatured: "desc" }, { isNew: "desc" }, { name: "asc" }]
    });

    const mapped = products.map(mapProduct);

    return filters.categoryId
      ? mapped.filter((product) => product.categoryIds.includes(filters.categoryId as number))
      : mapped;
  }

  async getProduct(id: number) {
    const product = await prisma.productCache.findUnique({
      where: { id }
    });

    if (!product) {
      return null;
    }

    return mapProduct(product);
  }

  async getFeatured() {
    const products = await this.getProducts();
    return products.filter((product) => product.isFeatured);
  }

  async getFresh() {
    const products = await this.getProducts();
    return products.filter((product) => product.isNew);
  }

  async getRelated(id: number) {
    const products = await this.getProducts();
    return getRelatedProducts(id, products);
  }
}

export const catalogService = new CatalogService();
