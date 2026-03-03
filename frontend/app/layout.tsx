import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ойлаудың алты қалпағы | Шесть шляп мышления",
  description: "Интерактивная образовательная платформа для критического мышления",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <SessionProvider>
            <LanguageToggle />
            {children}
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
