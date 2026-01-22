import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSS Next.js AI",
  description: "AI-first Next.js app with Convex real-time backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

