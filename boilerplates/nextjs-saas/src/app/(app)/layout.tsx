import { Sidebar } from "@/components/navigation/sidebar";
import { PageHeader } from "@/components/navigation/page-header";

/**
 * App Layout
 * 
 * Layout for authenticated app pages with sidebar navigation.
 * Uses theme-aware colors and proper content centering.
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
    <div className="min-h-screen bg-background">
      <Sidebar userRole={userRole} />
      
      {/* Main content area with sidebar offset */}
      <div className="pl-64 transition-all duration-300">
        {/* Page Header with breadcrumbs and theme toggle */}
        <PageHeader />
        
        {/* Main content with page transition animation and proper centering */}
        <main className="min-h-[calc(100vh-4rem)]">
          <div className="content-container animate-in fade-in slide-in-from-bottom-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
