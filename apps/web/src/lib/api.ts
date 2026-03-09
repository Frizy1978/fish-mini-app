"use client";

import {
  calculateCartPreview,
  demoUser,
  mockBatch,
  mockCategories,
  mockProducts,
  type BatchSummary,
  type CartItemInput,
  type CartPreview,
  type CreatedRequest,
  type Product,
  type RequestRecord,
  type RequestSubmission,
  type TelegramSession
} from "@fominiapp/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const REQUESTS_STORAGE_KEY = "fominiapp-mock-requests";

interface BootPayload {
  batch: BatchSummary;
  categories: typeof mockCategories;
  products: Product[];
  featured: Product[];
  fresh: Product[];
  session: TelegramSession;
  myRequests: RequestRecord[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ message: "Ошибка сети" }))) as {
      message?: string;
    };
    throw new Error(payload.message ?? "Ошибка сети");
  }

  return (await response.json()) as T;
}

function readMockRequests(): RequestRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(REQUESTS_STORAGE_KEY);
  return stored ? (JSON.parse(stored) as RequestRecord[]) : [];
}

function writeMockRequests(items: RequestRecord[]) {
  window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(items));
}

export async function authenticateTelegram(initData?: string, initDataUnsafe?: unknown) {
  if (USE_MOCK_API) {
    return {
      token: "mock-session-token",
      user: demoUser
    } satisfies TelegramSession;
  }

  return request<TelegramSession>("/api/v1/auth/telegram", {
    method: "POST",
    body: JSON.stringify({
      initData,
      initDataUnsafe
    })
  });
}

export async function loadBootPayload(
  initData?: string,
  initDataUnsafe?: unknown,
  token?: string
): Promise<BootPayload> {
  if (USE_MOCK_API) {
    const session = await authenticateTelegram(initData, initDataUnsafe);
    return {
      batch: mockBatch,
      categories: mockCategories,
      products: mockProducts,
      featured: mockProducts.filter((product) => product.isFeatured),
      fresh: mockProducts.filter((product) => product.isNew),
      session,
      myRequests: readMockRequests()
    };
  }

  const session = token
    ? await request<TelegramSession>("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    : await authenticateTelegram(initData, initDataUnsafe);

  const [batch, categories, products, fresh, featured, myRequests] = await Promise.all([
    request<BatchSummary>("/api/v1/batch/active"),
    request<typeof mockCategories>("/api/v1/catalog/categories"),
    request<Product[]>("/api/v1/catalog/products"),
    request<Product[]>("/api/v1/catalog/new"),
    request<Product[]>("/api/v1/catalog/featured"),
    request<RequestRecord[]>("/api/v1/requests/my", {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    })
  ]);

  return { batch, categories, products, fresh, featured, session, myRequests };
}

export async function previewCart(items: CartItemInput[], token?: string) {
  if (USE_MOCK_API) {
    return calculateCartPreview(items, mockProducts);
  }

  return request<CartPreview>("/api/v1/cart/preview", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify({ items })
  });
}

export async function submitRequest(payload: RequestSubmission, token?: string) {
  if (USE_MOCK_API) {
    const preview = calculateCartPreview(payload.items, mockProducts);
    const created: RequestRecord = {
      id: Date.now(),
      requestId: `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-MOCK`,
      status: "submitted",
      estimatedTotal: preview.estimatedTotal,
      currency: "RUB",
      submittedAt: new Date().toISOString(),
      user: payload.user,
      batch: mockBatch,
      comment: payload.comment,
      items: preview.items
    };

    const current = readMockRequests();
    writeMockRequests([created, ...current]);
    return created;
  }

  return request<RequestRecord>("/api/v1/requests", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload)
  });
}

export type { BootPayload };
