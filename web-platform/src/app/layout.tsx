import type { Metadata } from "next";
import { Manrope, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Signal Trade GPT — AI Trading Signals",
  description:
    "Премиальные AI-сигналы для бинарных опционов Pocket Option. Точность 87%+, работа 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${jetbrains.variable} ${bebas.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#07070d] text-[#e8e8f0]">
        {children}
      </body>
    </html>
  );
}
