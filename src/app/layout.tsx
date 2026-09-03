import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6d28d9" },
    { media: "(prefers-color-scheme: dark)", color: "#8b5cf6" },
  ],
};

export const metadata: Metadata = {
  title: "DigiStore — Productos Digitales al Instante",
  description: "Tu tienda de productos digitales. Gaming, streaming, software, gift cards y mas con entrega instantanea a todo el mundo.",
  keywords: ["productos digitales", "gaming", "streaming", "gift cards", "software", "skins", "v-bucks", "robux", "fortnite", "roblox"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "DigiStore — Productos Digitales al Instante",
    description: "Gaming, streaming, software y gift cards con entrega instantanea. Precios desde $1.",
    type: "website",
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
        className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
