import { Inter, Montserrat, Open_Sans } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["600", "700", "800"]
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-accent",
  weight: ["500", "600", "700"]
});

const openSans = Open_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Fish Olha",
  description: "Telegram Mini App для предзаказа рыбы и морепродуктов",
  icons: {
    icon: "/ui/logo.png",
    shortcut: "/ui/logo.png",
    apple: "/ui/logo.png"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} ${inter.variable} ${openSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
