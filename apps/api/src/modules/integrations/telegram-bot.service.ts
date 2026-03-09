import { Prisma } from "@prisma/client";
import type { CreatedRequest, UserProfile } from "@fominiapp/shared";

import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";

class TelegramBotService {
  getLaunchUrl() {
    return env.TELEGRAM_MINI_APP_URL ?? "https://example.com";
  }

  buildLaunchButton() {
    return {
      text: "Открыть мини-приложение",
      web_app: {
        url: this.getLaunchUrl()
      }
    };
  }

  buildMenuButtonPayload() {
    return {
      type: "web_app",
      text: "Открыть магазин",
      web_app: {
        url: this.getLaunchUrl()
      }
    };
  }

  async configureMenuButton() {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_MINI_APP_URL) {
      return {
        mode: "mock",
        ready: false,
        reason: "missing_bot_token_or_mini_app_url",
        launchUrl: this.getLaunchUrl()
      };
    }

    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setChatMenuButton`;
    const menuButton = this.buildMenuButtonPayload();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        menu_button: menuButton
      })
    });

    if (!response.ok) {
      const payload = await response.text();
      logger.error("Telegram menu button setup failed", payload);
      throw new Error("Не удалось настроить menu button Telegram");
    }

    return {
      mode: "live",
      ready: true,
      launchUrl: this.getLaunchUrl(),
      menuButton
    };
  }

  async sendOrderSubmittedMessage(user: UserProfile, request: CreatedRequest) {
    await prisma.integrationJob.create({
      data: {
        type: "TELEGRAM_ORDER_SUBMITTED",
        status: env.TELEGRAM_BOT_TOKEN ? "queued" : "mocked",
        entityId: request.requestId,
        payloadJson: {
          user,
          request
        } as unknown as Prisma.InputJsonValue
      }
    });

    if (!env.TELEGRAM_BOT_TOKEN) {
      logger.info("Mock Telegram confirmation", {
        telegramUserId: user.telegramUserId,
        requestId: request.requestId
      });
      return { mode: "mock" };
    }

    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const text = `Заявка ${request.requestId} принята. Итоговую сумму уточним после сборки. Оплата наличными при выдаче.`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: user.telegramUserId,
        text,
        reply_markup: {
          inline_keyboard: [[this.buildLaunchButton()]]
        }
      })
    });

    return { mode: "live" };
  }
}

export const telegramBotService = new TelegramBotService();
