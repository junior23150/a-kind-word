import { AppHeader } from "./AppHeader";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="knumbers-theme">
      <WorkspaceProvider>
        <div className="min-h-screen w-full bg-background flex flex-col">
          <AppHeader />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}