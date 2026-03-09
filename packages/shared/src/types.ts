export type BatchStatus = "draft" | "open" | "closed" | "archived";

export type RequestStatus =
  | "draft"
  | "submitted"
  | "cancelled"
  | "confirmed"
  | "adjustment_requested"
  | "packed"
  | "ready_for_pickup"
  | "completed";

export type ProductUnit = string;

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  accent: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  wooProductId: number;
  sku: string;
  slug: string;
  name: string;
  categoryIds: number[];
  categoryNames: string[];
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  accent: string;
  price: number;
  currency: "RUB";
  unit: ProductUnit;
  isWeighted: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  relatedProductIds: number[];
}

export interface BatchSummary {
  id: number;
  batchId: string;
  title: string;
  city: string;
  pickupPoint: string;
  status: BatchStatus;
  startAt: string;
  endAt: string;
  pickupWindow: string;
  isActive: boolean;
}

export interface UserProfile {
  telegramUserId: string;
  telegramUsername?: string;
  firstName: string;
  lastName?: string;
  phone: string;
  city: string;
  pickupPoint: string;
}

export interface CartItemInput {
  productId: number;
  qtyRequested: number;
  itemComment?: string;
}

export interface CartPreviewItem {
  productId: number;
  productName: string;
  sku: string;
  unit: ProductUnit;
  qtyRequested: number;
  price: number;
  estimatedSum: number;
  itemComment?: string;
  isWeighted: boolean;
}

export interface CartPreview {
  items: CartPreviewItem[];
  estimatedTotal: number;
  currency: "RUB";
  weightedDisclaimer: string;
}

export interface RequestSubmission {
  user: UserProfile;
  batchId: string;
  items: CartItemInput[];
  comment?: string;
}

export interface CreatedRequest {
  requestId: string;
  status: RequestStatus;
  estimatedTotal: number;
  currency: "RUB";
  submittedAt: string;
}

export interface RequestRecord extends CreatedRequest {
  id: number;
  user: UserProfile;
  batch: BatchSummary;
  comment?: string;
  items: CartPreviewItem[];
}

export interface CatalogFilters {
  categoryId?: number;
  search?: string;
}

export interface CatalogResponse {
  categories: Category[];
  featured: Product[];
  fresh: Product[];
  products: Product[];
}

export interface TelegramAuthPayload {
  initData?: string;
}

export interface TelegramSession {
  token: string;
  telegramUserId: string;
  isTelegramAuth: boolean;
  authMode: "telegram" | "dev";
  user: UserProfile;
}

export interface CustomerRequestsSheetRow {
  request_id: string;
  created_at: string;
  batch_id: string;
  telegram_user_id: string;
  telegram_username: string;
  customer_name: string;
  phone: string;
  city: string;
  pickup_point: string;
  order_comment: string;
  items_text: string;
  items_json: string;
  estimated_total: number;
  currency: string;
  status: RequestStatus;
}

export interface ConsolidatedProductsSheetRow {
  batch_id: string;
  product_id: number;
  sku: string;
  product_name: string;
  unit: ProductUnit;
  ordered_qty_total: number;
  buyers_count: number;
  buyers_list: string;
  estimated_total_sum: number;
  store_available_qty: number;
  need_to_buy: number;
  notes: string;
}
