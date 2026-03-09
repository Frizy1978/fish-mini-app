"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

type TelegramThemeParams = Record<string, string>;

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    start_param?: string;
  };
  themeParams?: TelegramThemeParams;
  colorScheme?: "light" | "dark";
  viewportStableHeight?: number;
}

const TELEGRAM_DEV_MODE = process.env.NEXT_PUBLIC_TELEGRAM_DEV_MODE !== "false";

export function useTelegram() {
  const [telegram, setTelegram] = useState<TelegramWebApp>();

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }

    webApp.ready();
    webApp.expand();
    setTelegram(webApp);
  }, []);

  return {
    webApp: telegram,
    isTelegramEnvironment: Boolean(telegram),
    isDevFallback: !telegram && TELEGRAM_DEV_MODE,
    initData: telegram?.initData,
    initDataUnsafe: telegram?.initDataUnsafe,
    themeParams: telegram?.themeParams ?? {},
    colorScheme: telegram?.colorScheme ?? "light",
    viewportStableHeight: telegram?.viewportStableHeight,
    startParam: telegram?.initDataUnsafe?.start_param
  };
}
