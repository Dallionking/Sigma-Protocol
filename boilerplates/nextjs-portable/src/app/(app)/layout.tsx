import { Sidebar } from "@/components/navigation/sidebar";

/**
 * App Layout
 * 
 * Layout for authenticated app pages with sidebar navigation.
 * 
 * @module dashboard
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Get user role from auth context
  const userRole = "admin"; // Placeholder

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar userRole={userRole} />
      
      {/* Main content area with sidebar offset */}
      <div className="pl-64 transition-all duration-300">
        <main className="min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

