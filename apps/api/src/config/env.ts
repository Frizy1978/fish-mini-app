import path from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1).default("dev-secret"),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_MINI_APP_URL: z.string().optional(),
  TELEGRAM_DEV_MODE: z.string().default("true"),
  TELEGRAM_AUTH_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  WOOCOMMERCE_BASE_URL: z.string().optional(),
  WOOCOMMERCE_CONSUMER_KEY: z.string().optional(),
  WOOCOMMERCE_CONSUMER_SECRET: z.string().optional(),
  WOOCOMMERCE_MOCK_MODE: z.string().default("true"),
  WOOCOMMERCE_SYNC_INTERVAL_MINUTES: z.coerce.number().int().positive().default(15),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEETS_MOCK_MODE: z.string().default("true"),
  CORS_ALLOWED_ORIGINS: z.string().default(""),
  TRUST_PROXY: z.string().default("false"),
  APP_DEFAULT_CITY: z.string().default("Полярный"),
  APP_DEFAULT_PICKUP_POINT: z.string().default("ул. Советская, 18, павильон у рынка")
});

function parseBoolean(input: string | undefined): boolean {
  return input === "true" || input === "1";
}

function parseOrigins(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const parsed = envSchema.parse(process.env);

function validateProductionEnv() {
  if (parsed.NODE_ENV !== "production") {
    return;
  }

  if (parsed.JWT_SECRET === "dev-secret") {
    throw new Error("JWT_SECRET must be changed for production");
  }

  if (!parsed.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is required in production");
  }

  if (!parsed.TELEGRAM_MINI_APP_URL) {
    throw new Error("TELEGRAM_MINI_APP_URL is required in production");
  }

  if (!/^https:\/\//i.test(parsed.TELEGRAM_MINI_APP_URL)) {
    throw new Error("TELEGRAM_MINI_APP_URL must use https in production");
  }

  if (!parseBoolean(parsed.WOOCOMMERCE_MOCK_MODE)) {
    if (!parsed.WOOCOMMERCE_BASE_URL || !parsed.WOOCOMMERCE_CONSUMER_KEY || !parsed.WOOCOMMERCE_CONSUMER_SECRET) {
      throw new Error("WooCommerce credentials are required when WOOCOMMERCE_MOCK_MODE=false");
    }
  }

  if (!parseBoolean(parsed.GOOGLE_SHEETS_MOCK_MODE)) {
    if (!parsed.GOOGLE_SHEETS_SPREADSHEET_ID || !parsed.GOOGLE_SERVICE_ACCOUNT_EMAIL || !parsed.GOOGLE_PRIVATE_KEY) {
      throw new Error("Google Sheets credentials are required when GOOGLE_SHEETS_MOCK_MODE=false");
    }
  }
}

validateProductionEnv();

export const env = {
  ...parsed,
  TELEGRAM_DEV_MODE: parseBoolean(parsed.TELEGRAM_DEV_MODE),
  WOOCOMMERCE_MOCK_MODE: parseBoolean(parsed.WOOCOMMERCE_MOCK_MODE),
  GOOGLE_SHEETS_MOCK_MODE: parseBoolean(parsed.GOOGLE_SHEETS_MOCK_MODE),
  TRUST_PROXY: parseBoolean(parsed.TRUST_PROXY),
  CORS_ALLOWED_ORIGINS: parseOrigins(parsed.CORS_ALLOWED_ORIGINS)
};
