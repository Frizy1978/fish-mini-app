import crypto from "node:crypto";

import { demoUser, type TelegramAuthPayload, type TelegramSession, type UserProfile } from "@fominiapp/shared";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { ApiError } from "../../lib/http.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";

type ResolvedAuth = {
  mode: "telegram" | "dev";
  user: UserProfile;
};

type VerifiedTelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

class AuthService {
  async authenticateTelegram(payload: TelegramAuthPayload): Promise<TelegramSession> {
    const resolved = await this.resolveTelegramUser(payload);
    const persisted = await prisma.user.upsert({
      where: { telegramUserId: resolved.user.telegramUserId },
      update: {
        telegramUsername: resolved.user.telegramUsername,
        firstName: resolved.user.firstName,
        lastName: resolved.user.lastName
      },
      create: {
        telegramUserId: resolved.user.telegramUserId,
        telegramUsername: resolved.user.telegramUsername,
        firstName: resolved.user.firstName,
        lastName: resolved.user.lastName,
        phone: resolved.user.phone,
        city: resolved.user.city,
        pickupPoint: resolved.user.pickupPoint
      }
    });

    const normalizedUser: UserProfile = {
      telegramUserId: persisted.telegramUserId,
      telegramUsername: persisted.telegramUsername ?? undefined,
      firstName: persisted.firstName,
      lastName: persisted.lastName ?? undefined,
      phone: persisted.phone ?? demoUser.phone,
      city: persisted.city,
      pickupPoint: persisted.pickupPoint
    };

    const token = jwt.sign(
      {
        telegramUserId: normalizedUser.telegramUserId,
        authMode: resolved.mode
      },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return {
      token,
      telegramUserId: normalizedUser.telegramUserId,
      isTelegramAuth: resolved.mode === "telegram",
      authMode: resolved.mode,
      user: normalizedUser
    };
  }

  async getCurrentUser(authHeader?: string): Promise<TelegramSession> {
    if (!authHeader && this.isDevBypassEnabled()) {
      return this.authenticateTelegram({});
    }

    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Не передан токен сессии");
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as {
      telegramUserId: string;
      authMode?: "telegram" | "dev";
    };
    const user = await prisma.user.findUnique({
      where: { telegramUserId: payload.telegramUserId }
    });

    if (!user) {
      throw new ApiError(401, "Пользователь не найден");
    }

    return {
      token,
      telegramUserId: user.telegramUserId,
      isTelegramAuth: payload.authMode !== "dev",
      authMode: payload.authMode === "dev" ? "dev" : "telegram",
      user: {
        telegramUserId: user.telegramUserId,
        telegramUsername: user.telegramUsername ?? undefined,
        firstName: user.firstName,
        lastName: user.lastName ?? undefined,
        phone: user.phone ?? demoUser.phone,
        city: user.city,
        pickupPoint: user.pickupPoint
      }
    };
  }

  private async resolveTelegramUser(payload: TelegramAuthPayload): Promise<ResolvedAuth> {
    if (this.isDevBypassEnabled() && !payload.initData) {
      return {
        mode: "dev",
        user: demoUser
      };
    }

    if (!payload.initData) {
      throw new ApiError(400, "initData обязателен");
    }

    const telegramUser = this.validateAndParseInitData(payload.initData);

    return {
      mode: "telegram",
      user: {
        telegramUserId: String(telegramUser.id),
        telegramUsername: telegramUser.username,
        firstName: telegramUser.first_name ?? "Покупатель",
        lastName: telegramUser.last_name,
        phone: demoUser.phone,
        city: env.APP_DEFAULT_CITY,
        pickupPoint: env.APP_DEFAULT_PICKUP_POINT
      }
    };
  }

  private validateAndParseInitData(initData: string): VerifiedTelegramUser {
    if (!env.TELEGRAM_BOT_TOKEN) {
      throw new ApiError(500, "TELEGRAM_BOT_TOKEN не настроен");
    }

    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const authDate = params.get("auth_date");
    const userPayload = params.get("user");

    if (!hash || !authDate || !userPayload) {
      logger.error("Telegram auth failed: missing required initData fields", {
        hasHash: Boolean(hash),
        hasAuthDate: Boolean(authDate),
        hasUser: Boolean(userPayload)
      });
      throw new ApiError(401, "Некорректные данные Telegram Mini App");
    }

    const sortedEntries = [...params.entries()]
      .filter(([key]) => key !== "hash")
      .sort(([left], [right]) => left.localeCompare(right));
    const dataCheckString = sortedEntries.map(([key, value]) => `${key}=${value}`).join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(env.TELEGRAM_BOT_TOKEN).digest();
    const signature = crypto.createHmac("sha256", secret).update(dataCheckString).digest();
    const hashBuffer = Buffer.from(hash, "hex");

    if (hashBuffer.length !== signature.length || !crypto.timingSafeEqual(signature, hashBuffer)) {
      logger.error("Telegram auth failed: invalid initData signature");
      throw new ApiError(401, "Некорректные данные Telegram Mini App");
    }

    const authTimestamp = Number(authDate);
    if (!Number.isFinite(authTimestamp)) {
      throw new ApiError(401, "Некорректная дата авторизации Telegram");
    }

    const ageSeconds = Math.floor(Date.now() / 1000) - authTimestamp;
    if (ageSeconds > env.TELEGRAM_AUTH_TTL_SECONDS) {
      logger.error("Telegram auth failed: initData expired", {
        ageSeconds,
        ttlSeconds: env.TELEGRAM_AUTH_TTL_SECONDS
      });
      throw new ApiError(401, "Данные авторизации Telegram устарели");
    }

    try {
      return JSON.parse(userPayload) as VerifiedTelegramUser;
    } catch {
      throw new ApiError(401, "Не удалось прочитать пользователя Telegram");
    }
  }

  private isDevBypassEnabled() {
    return env.NODE_ENV !== "production" && env.TELEGRAM_DEV_MODE;
  }
}

export const authService = new AuthService();
