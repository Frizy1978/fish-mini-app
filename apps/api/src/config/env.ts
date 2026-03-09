import path from "node:path";

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().default("dev-secret"),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_MINI_APP_URL: z.string().optional(),
  TELEGRAM_DEV_MODE: z.string().default("true"),
  WOOCOMMERCE_BASE_URL: z.string().optional(),
  WOOCOMMERCE_CONSUMER_KEY: z.string().optional(),
  WOOCOMMERCE_CONSUMER_SECRET: z.string().optional(),
  WOOCOMMERCE_MOCK_MODE: z.string().default("true"),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEETS_MOCK_MODE: z.string().default("true"),
  APP_DEFAULT_CITY: z.string().default("Полярный"),
  APP_DEFAULT_PICKUP_POINT: z.string().default("ул. Советская, 18, павильон у рынка")
});

function parseBoolean(input: string | undefined): boolean {
  return input === "true" || input === "1";
}

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  TELEGRAM_DEV_MODE: parseBoolean(parsed.TELEGRAM_DEV_MODE),
  WOOCOMMERCE_MOCK_MODE: parseBoolean(parsed.WOOCOMMERCE_MOCK_MODE),
  GOOGLE_SHEETS_MOCK_MODE: parseBoolean(parsed.GOOGLE_SHEETS_MOCK_MODE)
};
