import type { CartItemInput, CartPreview, CartPreviewItem, Product } from "./types";

const WEIGHTED_DISCLAIMER =
  "Весовые позиции пересчитываются после сборки. Итоговая сумма может немного измениться.";

export function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(value);

  return `${formatted} руб.`;
}

export function calculateCartPreview(items: CartItemInput[], products: Product[]): CartPreview {
  const indexedProducts = new Map(products.map((product) => [product.id, product]));
  const previewItems = items.reduce<CartPreviewItem[]>((accumulator, item) => {
    const product = indexedProducts.get(item.productId);
    if (!product) {
      return accumulator;
    }

    const estimatedSum = Number((product.price * item.qtyRequested).toFixed(2));

    accumulator.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unit: product.unit,
      qtyRequested: item.qtyRequested,
      price: product.price,
      estimatedSum,
      itemComment: item.itemComment,
      isWeighted: product.isWeighted
    });

    return accumulator;
  }, []);

  const estimatedTotal = previewItems.reduce((total, item) => total + item.estimatedSum, 0);

  return {
    items: previewItems,
    estimatedTotal,
    currency: "RUB",
    weightedDisclaimer: WEIGHTED_DISCLAIMER
  };
}

export function getRelatedProducts(productId: number, products: Product[]): Product[] {
  const product = products.find((entry) => entry.id === productId);
  if (!product) {
    return [];
  }

  return product.relatedProductIds
    .map((relatedId) => products.find((entry) => entry.id === relatedId))
    .filter((entry): entry is Product => Boolean(entry));
}
