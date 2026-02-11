import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sigmaprotocol.dev'),
  title: "Sigma Protocol - AI-Powered PRD Generation & Swarm Orchestration",
  description:
    "13-step AI development workflow. Generate production-ready PRDs with swarm orchestration. Supports Claude Code, Cursor, Codex, OpenCode. Ship features 10x faster.",
  keywords: [
    "AI PRD generation",
    "AI agent swarms",
    "AI product development",
    "swarm orchestration",
    "AI development workflow",
    "Claude Code",
    "Cursor AI",
    "product requirements document",
    "AI-powered development",
  ],
  authors: [{ name: "Sigma Protocol Team" }],
  creator: "Sigma Protocol",
  publisher: "Sigma Protocol",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sigmaprotocol.dev",
    title: "Sigma Protocol - AI-Powered PRD Generation & Swarm Orchestration",
    description:
      "13-step AI development workflow. Generate production-ready PRDs with swarm orchestration. Ship features 10x faster.",
    siteName: "Sigma Protocol",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sigma Protocol - AI-Powered PRD Generation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sigma Protocol - AI-Powered PRD Generation & Swarm Orchestration",
    description:
      "13-step AI development workflow. Generate production-ready PRDs with swarm orchestration. Ship features 10x faster.",
    creator: "@sigmaprotocol",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// Safe JSON-LD structured data (no user input)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Sigma Protocol",
  description:
    "AI-powered PRD generation and swarm orchestration platform with 13-step development workflow",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Sigma Protocol",
  },
  url: "https://sigmaprotocol.dev",
  sameAs: [
    "https://github.com/dallionking/sigma-protocol",
    "https://twitter.com/sigmaprotocol",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        {/* JSON-LD Structured Data - safe static content */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(structuredData)}
        </Script>
      </body>
    </html>
  );
}
