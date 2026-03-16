import type { Metadata, Viewport } from "next";
import { Outfit, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { SyncNotification } from "@/components/SyncNotification";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wandra — Your journey, written for you.",
    template: "%s | Wandra",
  },
  description:
    "A travel journal PWA that auto-documents your journey using GPS, weather data, and AI storytelling. Just set your destination and travel — Wandra writes your story.",
  manifest: "/manifest.json",
  keywords: [
    "travel journal",
    "AI journal",
    "travel app",
    "travel diary",
    "GPS journal",
    "automatic journal",
    "travel stories",
    "PWA",
  ],
  authors: [{ name: "Wandra" }],
  creator: "Wandra",
  publisher: "Wandra",
  metadataBase: new URL("https://wandra.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wandra.app",
    siteName: "Wandra",
    title: "Wandra — Your journey, written for you.",
    description:
      "A travel journal PWA that auto-documents your journey. No writing required. Just travel.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wandra — Your journey, written for you.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wandra — Your journey, written for you.",
    description:
      "A travel journal PWA that auto-documents your journey. No writing required. Just travel.",
    images: ["/og-image.png"],
    creator: "@wandraapp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wandra",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFAF5" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1117" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${cormorant.variable} ${jetbrains.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <SyncNotification />
        </Providers>
      </body>
    </html>
  );
}
