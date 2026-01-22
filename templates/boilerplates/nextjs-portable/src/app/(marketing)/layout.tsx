import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";

/**
 * Marketing Layout
 * 
 * Layout for public-facing marketing pages.
 * Includes header and footer navigation.
 * 
 * @module (marketing)/layout
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

