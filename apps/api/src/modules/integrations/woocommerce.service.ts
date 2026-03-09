import { Prisma } from '@prisma/client';
import { mockCategories, mockProducts, type Category, type Product } from '@fominiapp/shared';

import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';

type WooImage = {
  src?: string;
  thumbnail?: string;
};

interface WooCategoryResponse {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: WooImage | null;
}

interface WooProductResponse {
  id: number;
  sku: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  status?: string;
  images?: WooImage[];
  price?: string;
  categories?: Array<{ id: number; name: string }>;
  featured?: boolean;
  meta_data?: Array<{ key: string; value: unknown }>;
}

type CatalogSyncTrigger = 'manual' | 'schedule';

type CatalogSyncResult = {
  status: 'completed' | 'skipped';
  trigger: CatalogSyncTrigger;
  mode: 'mock' | 'live';
  categoriesSynced: number;
  productsCreated: number;
  productsUpdated: number;
  productsDeactivated: number;
  errors: number;
  reason?: string;
};

class WooCommerceService {
  private syncPromise: Promise<CatalogSyncResult> | null = null;
  private schedulerStarted = false;

  startScheduler() {
    if (this.schedulerStarted) {
      return;
    }

    this.schedulerStarted = true;
    const intervalMinutes = env.WOOCOMMERCE_SYNC_INTERVAL_MINUTES;
    const intervalMs = intervalMinutes * 60 * 1000;

    logger.info('Catalog sync scheduler started', {
      intervalMinutes,
      mode: env.WOOCOMMERCE_MOCK_MODE ? 'mock' : 'live'
    });

    setInterval(() => {
      void this.syncCatalog('schedule').catch((cause) => {
        logger.error('Scheduled catalog sync failed', this.serializeError(cause));
      });
    }, intervalMs);
  }

  async fetchCategories(): Promise<Category[]> {
    if (env.WOOCOMMERCE_MOCK_MODE || !env.WOOCOMMERCE_BASE_URL) {
      return mockCategories;
    }

    const payload = await this.fetchPaged<WooCategoryResponse>('/wp-json/wc/v3/products/categories', {
      hide_empty: 'false',
      orderby: 'name',
      order: 'asc'
    });

    const accents = [
      'from-cyan-500/30 via-sky-500/10 to-white',
      'from-amber-500/30 via-orange-500/10 to-white',
      'from-teal-500/30 via-emerald-500/10 to-white',
      'from-rose-500/25 via-pink-500/10 to-white'
    ] as const;

    return payload.map((item, index) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      description: item.description || item.name,
      accent: accents[index % accents.length],
      imageUrl: this.getWooImageUrl(item.image)
    }));
  }

  async fetchProducts(): Promise<Product[]> {
    if (env.WOOCOMMERCE_MOCK_MODE || !env.WOOCOMMERCE_BASE_URL) {
      return mockProducts;
    }

    const payload = await this.fetchPaged<WooProductResponse>('/wp-json/wc/v3/products');
    return payload.map((item) => this.mapWooProduct(item));
  }

  async syncCatalog(trigger: CatalogSyncTrigger = 'manual'): Promise<CatalogSyncResult> {
    if (this.syncPromise) {
      logger.info('Catalog sync skipped because another run is in progress', { trigger });
      return {
        status: 'skipped',
        trigger,
        mode: env.WOOCOMMERCE_MOCK_MODE ? 'mock' : 'live',
        categoriesSynced: 0,
        productsCreated: 0,
        productsUpdated: 0,
        productsDeactivated: 0,
        errors: 0,
        reason: 'sync_in_progress'
      };
    }

    const run = this.performSync(trigger).finally(() => {
      this.syncPromise = null;
    });

    this.syncPromise = run;
    return run;
  }

  private async performSync(trigger: CatalogSyncTrigger): Promise<CatalogSyncResult> {
    const mode = env.WOOCOMMERCE_MOCK_MODE ? 'mock' : 'live';
    const syncStartedAt = new Date();
    const errorMessages: string[] = [];
    let categories: Category[] = [];
    let products: Product[] = [];
    let productsFetched = false;

    logger.info('Catalog sync started', { trigger, mode, startedAt: syncStartedAt.toISOString() });

    try {
      categories = await this.fetchCategories();
    } catch (cause) {
      errorMessages.push(this.stringifyError(cause));
      logger.error('WooCommerce categories fetch failed during sync', this.serializeError(cause));
    }

    try {
      products = await this.fetchProducts();
      productsFetched = true;
    } catch (cause) {
      errorMessages.push(this.stringifyError(cause));
      logger.error('WooCommerce products fetch failed during sync', this.serializeError(cause));
    }

    let productsCreated = 0;
    let productsUpdated = 0;
    let productsDeactivated = 0;

    if (productsFetched) {
      const syncedAt = new Date();
      const liveWooIds = products.map((product) => product.wooProductId);
      const existingProducts = liveWooIds.length
        ? await prisma.productCache.findMany({
            where: {
              wooProductId: {
                in: liveWooIds
              }
            },
            select: {
              wooProductId: true
            }
          })
        : [];
      const existingWooIds = new Set(existingProducts.map((product) => product.wooProductId));

      for (const product of products) {
        await prisma.productCache.upsert({
          where: { wooProductId: product.wooProductId },
          update: {
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
            syncedAt
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
            syncedAt
          }
        });

        if (existingWooIds.has(product.wooProductId)) {
          productsUpdated += 1;
        } else {
          productsCreated += 1;
        }
      }

      const deactivateWhere = liveWooIds.length
        ? {
            isActive: true,
            wooProductId: {
              notIn: liveWooIds
            }
          }
        : {
            isActive: true
          };

      const deactivated = await prisma.productCache.updateMany({
        where: deactivateWhere,
        data: {
          isActive: false,
          syncedAt
        }
      });

      productsDeactivated = deactivated.count;
    }

    const result: CatalogSyncResult = {
      status: 'completed',
      trigger,
      mode,
      categoriesSynced: categories.length,
      productsCreated,
      productsUpdated,
      productsDeactivated,
      errors: errorMessages.length
    };

    logger.info('Catalog sync completed', result);
    if (errorMessages.length) {
      logger.error('Catalog sync completed with errors', errorMessages);
    }

    return result;
  }

  private async fetchPaged<T>(pathname: string, extraParams: Record<string, string> = {}): Promise<T[]> {
    if (!env.WOOCOMMERCE_BASE_URL) {
      return [];
    }

    const items: T[] = [];

    for (let page = 1; page < 100; page += 1) {
      const url = new URL(pathname, env.WOOCOMMERCE_BASE_URL);
      url.searchParams.set('consumer_key', env.WOOCOMMERCE_CONSUMER_KEY ?? '');
      url.searchParams.set('consumer_secret', env.WOOCOMMERCE_CONSUMER_SECRET ?? '');
      url.searchParams.set('per_page', '100');
      url.searchParams.set('page', String(page));

      Object.entries(extraParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const payload = await response.text();
        logger.error('WooCommerce request failed', payload);
        throw new Error(`WooCommerce request failed: ${payload}`);
      }

      const payload = (await response.json()) as T[];
      items.push(...payload);

      if (payload.length < 100) {
        break;
      }
    }

    return items;
  }

  private mapWooProduct(item: WooProductResponse): Product {
    const unit = this.getMetaValue(item, '_price_unit') ?? this.getMetaValue(item, 'unit') ?? 'kg';
    const weighted = this.getBooleanMetaValue(item, 'is_weighted');
    const isNew = this.getBooleanMetaValue(item, 'is_new');

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
      imageUrl: this.getWooImageUrl(item.images?.[0]) ?? '/images/fish-steak.svg',
      accent: 'from-cyan-300 via-sky-100 to-white',
      price: Number(item.price ?? 0),
      currency: 'RUB',
      unit,
      isWeighted: weighted,
      isNew,
      isFeatured: Boolean(item.featured),
      isActive: item.status ? item.status === 'publish' : true,
      relatedProductIds: []
    };
  }

  private getWooImageUrl(image?: WooImage | null) {
    const thumbnail = image?.thumbnail?.trim();
    if (thumbnail) {
      return thumbnail;
    }

    const source = image?.src?.trim();
    return source || undefined;
  }

  private getMetaValue(item: WooProductResponse, key: string): string | undefined {
    const rawValue = item.meta_data?.find((entry) => entry.key === key)?.value;

    if (typeof rawValue === 'string') {
      const value = rawValue.trim();
      return value || undefined;
    }

    if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      return String(rawValue);
    }

    if (Array.isArray(rawValue) && rawValue.length > 0) {
      return String(rawValue[0]).trim() || undefined;
    }

    return undefined;
  }

  private getBooleanMetaValue(item: WooProductResponse, key: string) {
    const value = this.getMetaValue(item, key)?.toLowerCase();
    return value === '1' || value === 'true' || value === 'yes';
  }

  private stringifyError(cause: unknown) {
    if (cause instanceof Error) {
      return cause.message;
    }

    return String(cause);
  }

  private serializeError(cause: unknown) {
    if (cause instanceof Error) {
      return {
        name: cause.name,
        message: cause.message,
        stack: cause.stack
      };
    }

    return cause;
  }
}

export const wooCommerceService = new WooCommerceService();
