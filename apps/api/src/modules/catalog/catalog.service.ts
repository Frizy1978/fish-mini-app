import {
  getRelatedProducts,
  mockCategories,
  type CatalogFilters,
  type Category,
  type Product
} from '@fominiapp/shared';

import { prisma } from '../../lib/prisma.js';
import { wooCommerceService } from '../integrations/woocommerce.service.js';

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
    currency: 'RUB',
    unit: record.unit,
    isWeighted: record.isWeighted,
    isNew: record.isNew,
    isFeatured: record.isFeatured,
    isActive: record.isActive,
    relatedProductIds: record.relatedIdsJson as number[]
  };
}

class CatalogService {
  async getCategories(): Promise<Category[]> {
    const products = await this.getProducts();
    const activeCategoryIds = new Set(products.flatMap((product) => product.categoryIds));

    try {
      const liveCategories = await wooCommerceService.fetchCategories();
      if (liveCategories.length) {
        const filteredLiveCategories = activeCategoryIds.size
          ? liveCategories.filter((category) => activeCategoryIds.has(category.id))
          : liveCategories;

        if (filteredLiveCategories.length) {
          return filteredLiveCategories;
        }
      }
    } catch {
      // Fallback below.
    }

    if (!products.length) {
      return mockCategories;
    }

    const accentPalette = [
      'from-cyan-500/30 via-sky-500/10 to-white',
      'from-amber-500/30 via-orange-500/10 to-white',
      'from-teal-500/30 via-emerald-500/10 to-white',
      'from-rose-500/25 via-pink-500/10 to-white'
    ] as const;
    const categoryMap = new Map<number, Category>();

    for (const product of products) {
      product.categoryIds.forEach((categoryId, index) => {
        if (!categoryMap.has(categoryId)) {
          const name = product.categoryNames[index] ?? `Категория ${categoryId}`;
          categoryMap.set(categoryId, {
            id: categoryId,
            slug: name
              .toLowerCase()
              .replace(/[^a-zа-яё0-9]+/gi, '-')
              .replace(/^-+|-+$/g, ''),
            name,
            description: name,
            accent: accentPalette[categoryMap.size % accentPalette.length],
            imageUrl: product.imageUrl
          });
        }
      });
    }

    return Array.from(categoryMap.values()).sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  }

  async getProducts(filters: CatalogFilters = {}) {
    const normalizedSearch = filters.search?.trim();
    const products = await prisma.productCache.findMany({
      where: {
        isActive: true,
        ...(normalizedSearch
          ? {
              OR: [
                { name: { contains: normalizedSearch, mode: 'insensitive' } },
                { shortDescription: { contains: normalizedSearch, mode: 'insensitive' } },
                { sku: { contains: normalizedSearch, mode: 'insensitive' } }
              ]
            }
          : {})
      },
      orderBy: [{ isFeatured: 'desc' }, { isNew: 'desc' }, { name: 'asc' }]
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
