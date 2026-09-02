import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DigiStore — Productos Digitales al Instante",
  description: "Tu tienda de productos digitales. Gaming, streaming, software, gift cards y mas con entrega instantanea a todo el mundo.",
  keywords: ["productos digitales", "gaming", "streaming", "gift cards", "software", "skins", "v-bucks", "robux", "fortnite", "roblox"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.akamai.steamstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.akamai.steamstatic.com" />
        <link rel="preconnect" href="https://z-cdn.chatglm.cn" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
