import crypto from "node:crypto";

import { demoUser, type TelegramAuthPayload, type TelegramSession, type UserProfile } from "@fominiapp/shared";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { ApiError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";

class AuthService {
  async authenticateTelegram(payload: TelegramAuthPayload): Promise<TelegramSession> {
    const user = await this.resolveTelegramUser(payload);
    const persisted = await prisma.user.upsert({
      where: { telegramUserId: user.telegramUserId },
      update: {
        telegramUsername: user.telegramUsername,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        city: user.city,
        pickupPoint: user.pickupPoint
      },
      create: {
        telegramUserId: user.telegramUserId,
        telegramUsername: user.telegramUsername,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        city: user.city,
        pickupPoint: user.pickupPoint
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
      { telegramUserId: normalizedUser.telegramUserId },
      env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return {
      token,
      user: normalizedUser
    };
  }

  async getCurrentUser(authHeader?: string) {
    if (!authHeader && env.TELEGRAM_DEV_MODE) {
      return this.authenticateTelegram({});
    }

    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Не передан токен сессии");
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as { telegramUserId: string };
    const user = await prisma.user.findUnique({
      where: { telegramUserId: payload.telegramUserId }
    });

    if (!user) {
      throw new ApiError(401, "Пользователь не найден");
    }

    return {
      token,
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

  private async resolveTelegramUser(payload: TelegramAuthPayload): Promise<UserProfile> {
    if (env.TELEGRAM_DEV_MODE && !payload.initData) {
      return demoUser;
    }

    if (!payload.initData) {
      throw new ApiError(400, "initData обязателен");
    }

    if (!this.validateInitData(payload.initData)) {
      throw new ApiError(401, "Некорректные данные Telegram Mini App");
    }

    const unsafeUser = payload.initDataUnsafe?.user;
    if (!unsafeUser) {
      throw new ApiError(400, "Не удалось определить пользователя Telegram");
    }

    return {
      telegramUserId: String(unsafeUser.id),
      telegramUsername: unsafeUser.username,
      firstName: unsafeUser.first_name ?? "Покупатель",
      lastName: unsafeUser.last_name,
      phone: demoUser.phone,
      city: env.APP_DEFAULT_CITY,
      pickupPoint: env.APP_DEFAULT_PICKUP_POINT
    };
  }

  private validateInitData(initData: string) {
    if (!env.TELEGRAM_BOT_TOKEN) {
      return env.TELEGRAM_DEV_MODE;
    }

    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      return false;
    }

    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(env.TELEGRAM_BOT_TOKEN).digest();
    const signature = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

    return signature === hash;
  }
}

export const authService = new AuthService();
