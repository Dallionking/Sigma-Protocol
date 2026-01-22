import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSS Next.js Portable",
  description: "Self-hostable Next.js SaaS with Drizzle ORM",
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

