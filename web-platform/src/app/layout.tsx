import type { Metadata } from "next";
import { Manrope, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { Preloader } from "@/components/effects/Preloader";
import { ScrollProgress } from "@/components/effects/ScrollProgress";

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
    "Сигналы для PocketOption. Открывай аккаунт по нашей ссылке — получи доступ к боту в Telegram. Чем выше депозит, тем сильнее перки.",
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
      <body className="min-h-full flex flex-col">
        <AnimatedBackground />
        <ScrollProgress />
        <CustomCursor />
        <Preloader />
        {children}
      </body>
    </html>
  );
}
