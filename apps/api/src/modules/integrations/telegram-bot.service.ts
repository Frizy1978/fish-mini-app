import { Prisma } from "@prisma/client";
import type { CreatedRequest, UserProfile } from "@fominiapp/shared";

import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";

class TelegramBotService {
  buildLaunchButton() {
    return {
      text: "Открыть мини-приложение",
      web_app: {
        url: env.TELEGRAM_MINI_APP_URL ?? "https://example.com"
      }
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
