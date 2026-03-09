import type { BatchSummary, Category, Product } from '@fominiapp/shared';

export type DisplayCategory = {
  key: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  categoryId: number;
  matches: (product: Product) => boolean;
};

export const brandAssets = {
  logo: '/ui/logo.png',
  hero: '/ui/hero.png'
} as const;

const categoryAssets = {
  fresh: '/ui/catalog-categories/fresh-fish.png',
  conserves: '/ui/catalog-categories/conserves.png',
  coldSmoked: '/ui/catalog-categories/cold-smoked.png',
  seafood: '/ui/catalog-categories/seafood.png',
  hotSmoked: '/ui/catalog-categories/hot-smoked.png',
  salted: '/ui/catalog-categories/salted-fish.png',
  semiFinished: '/ui/catalog-categories/semi-finished.png'
} as const;

const productAssets: Record<string, string> = {
  'salmon-steak': '/ui/products/salmon-steak.png',
  'cod-fillet': '/ui/products/cod-fillet.png',
  'shrimp-xl': '/ui/products/shrimp-xl.png',
  'mussel-meat': '/ui/products/mussel-meat.png',
  'smoked-mackerel': '/ui/products/smoked-mackerel.png',
  'pollock-cutlet': '/ui/products/pollock-cutlet.png',
  'trout-sliced': '/ui/products/trout-sliced.png',
  'hake-carcass': '/ui/products/hake-carcass.png',
  'squid-rings': '/ui/products/squid-rings.png',
  'seafood-mix': '/ui/products/seafood-mix.png',
  'herring-fillet': '/ui/products/herring-fillet.png',
  'pike-dumplings': '/ui/products/pike-dumplings.png',
  default: '/ui/products/default-fish.png'
};

function resolveCategoryImage(category: Category, products: Product[]) {
  const categoryImageUrl = category.imageUrl?.trim();

  if (categoryImageUrl && /^https?:\/\//i.test(categoryImageUrl)) {
    return categoryImageUrl;
  }

  if (categoryImageUrl && categoryImageUrl.startsWith('/')) {
    return categoryImageUrl;
  }

  const haystack = `${category.slug} ${category.name}`.toLowerCase();

  if (/fresh|свеж|охлаж/.test(haystack)) {
    return categoryAssets.fresh;
  }

  if (/консерв|conserve/.test(haystack)) {
    return categoryAssets.conserves;
  }

  if (/cold|холод|копчен/.test(haystack)) {
    return categoryAssets.coldSmoked;
  }

  if (/море|seafood|кревет|мид|кальмар/.test(haystack)) {
    return categoryAssets.seafood;
  }

  if (/горяч|gril|грил/.test(haystack)) {
    return categoryAssets.hotSmoked;
  }

  if (/соль|солен|малосол/.test(haystack)) {
    return categoryAssets.salted;
  }

  if (/котлет|полу|пельмен/.test(haystack)) {
    return categoryAssets.semiFinished;
  }

  const firstProduct = products.find((product) => product.categoryIds.includes(category.id));
  return firstProduct ? getDisplayProductImage(firstProduct) : productAssets.default;
}

export function buildDisplayCategories(categories: Category[], products: Product[]): DisplayCategory[] {
  return categories.map((category) => ({
    key: String(category.id),
    title: category.name,
    subtitle: category.description || category.name,
    imageSrc: resolveCategoryImage(category, products),
    categoryId: category.id,
    matches: (product) => product.categoryIds.includes(category.id)
  }));
}

export function buildNoveltyProducts(products: Product[], fresh: Product[]) {
  const unique = new Map<number, Product>();

  for (const product of [...fresh, ...products.filter((item) => item.isFeatured), ...products]) {
    if (product.isActive && !unique.has(product.id)) {
      unique.set(product.id, product);
    }
  }

  return Array.from(unique.values()).slice(0, 8);
}

export function getDisplayProductImage(product: Product) {
  const imageUrl = product.imageUrl?.trim();

  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl && imageUrl.startsWith('/ui/')) {
    return imageUrl;
  }

  return productAssets[product.slug] ?? imageUrl ?? productAssets.default;
}

export function getDisplayDateParts(batch: BatchSummary) {
  const date = new Date(batch.endAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });
  const timeMatch = batch.pickupWindow.match(/\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}/);

  return {
    date,
    time: timeMatch ? timeMatch[0].replace(/\s*[-–]\s*/, ' - ') : '12:00 - 16:00'
  };
}

export function formatUnitLabel(unit: Product['unit']) {
  const value = unit.trim();
  return value || 'шт';
}
