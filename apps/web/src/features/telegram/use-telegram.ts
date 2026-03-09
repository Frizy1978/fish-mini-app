"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

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
  };
  colorScheme?: "light" | "dark";
}

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
    initData: telegram?.initData,
    initDataUnsafe: telegram?.initDataUnsafe,
    colorScheme: telegram?.colorScheme ?? "light"
  };
}
