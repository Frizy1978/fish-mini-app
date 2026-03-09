import type { BatchSummary, Category, Product } from '@fominiapp/shared';

export type DisplayCategory = {
  key: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  matches: (product: Product) => boolean;
};

export const brandAssets = {
  logo: '/ui/logo.png',
  hero: '/ui/hero.png'
} as const;

const categoryAssets: Record<string, string> = {
  'fresh-fish': '/ui/catalog-categories/fresh-fish.png',
  conserves: '/ui/catalog-categories/conserves.png',
  'cold-smoked': '/ui/catalog-categories/cold-smoked.png',
  seafood: '/ui/catalog-categories/seafood.png',
  'hot-smoked': '/ui/catalog-categories/hot-smoked.png',
  'salted-fish': '/ui/catalog-categories/salted-fish.png',
  'semi-finished': '/ui/catalog-categories/semi-finished.png'
};

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

function findCategoryId(categories: Category[], slug: string) {
  return categories.find((category) => category.slug === slug)?.id;
}

function hasCategory(product: Product, categoryId?: number) {
  return typeof categoryId === 'number' ? product.categoryIds.includes(categoryId) : false;
}

export function buildDisplayCategories(categories: Category[]): DisplayCategory[] {
  const freshId = findCategoryId(categories, 'fresh-fish');
  const smokedId = findCategoryId(categories, 'smoked');
  const seafoodId = findCategoryId(categories, 'seafood');
  const semiFinishedId = findCategoryId(categories, 'semi-finished');

  return [
    {
      key: 'fresh-fish',
      title: 'Свежая рыба',
      subtitle: 'Охлажденные позиции',
      imageSrc: categoryAssets['fresh-fish'],
      matches: (product) =>
        hasCategory(product, freshId) || /лосос|треск|хек/i.test(`${product.name} ${product.shortDescription}`)
    },
    {
      key: 'conserves',
      title: 'Консервы',
      subtitle: 'Готовые позиции',
      imageSrc: categoryAssets.conserves,
      matches: (product) =>
        /сел[ьъ]д|скумбр|бан|pack|консерв/i.test(`${product.name} ${product.shortDescription} ${product.unit}`)
    },
    {
      key: 'cold-smoked',
      title: 'Холодного копчения',
      subtitle: 'Деликатесы',
      imageSrc: categoryAssets['cold-smoked'],
      matches: (product) =>
        hasCategory(product, smokedId) || /слабосол|сел[ьъ]д|нарезк|копчен/i.test(`${product.name} ${product.shortDescription}`)
    },
    {
      key: 'seafood',
      title: 'Морепродукты',
      subtitle: 'Креветки и миксы',
      imageSrc: categoryAssets.seafood,
      matches: (product) =>
        hasCategory(product, seafoodId) || /кревет|мид|кальмар|морск/i.test(`${product.name} ${product.shortDescription}`)
    },
    {
      key: 'hot-smoked',
      title: 'Горячего копчения',
      subtitle: 'К столу',
      imageSrc: categoryAssets['hot-smoked'],
      matches: (product) =>
        /горяч|скумбр/i.test(`${product.name} ${product.shortDescription}`)
    },
    {
      key: 'salted-fish',
      title: 'Солёная рыба',
      subtitle: 'Слабосол и маринады',
      imageSrc: categoryAssets['salted-fish'],
      matches: (product) =>
        /слабосол|сел[ьъ]д/i.test(`${product.name} ${product.shortDescription}`)
    },
    {
      key: 'semi-finished',
      title: 'Полуфабрикаты',
      subtitle: 'Быстрый ужин',
      imageSrc: categoryAssets['semi-finished'],
      matches: (product) =>
        hasCategory(product, semiFinishedId) || /котлет|пельмен/i.test(`${product.name} ${product.shortDescription}`)
    }
  ];
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
  return productAssets[product.slug] ?? productAssets.default;
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
  if (unit === 'kg') {
    return 'кг';
  }

  if (unit === 'pcs') {
    return 'шт';
  }

  return 'шт';
}
