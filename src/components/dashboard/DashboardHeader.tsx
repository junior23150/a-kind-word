import { Bell, Moon, Sun, User, LogOut, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedByRole } from "@/components/ProtectedByRole";

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const { signOut, profile } = useAuth();

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'business':
        return <Building2 className="w-4 h-4" />;
      default:
        return <User className="w-4 w-4" />;
    }
  };

  const getRoleColor = () => {
    switch (profile?.role) {
      case 'admin':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600';
      case 'business':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600';
    }
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'admin':
        return 'Admin';
      case 'business':
        return 'Business';
      default:
        return 'Personal';
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 min-h-[4rem] border-b border-border bg-background flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="h-8 w-8" />
        
        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Olá, {profile.full_name || 'Usuário'}
            </span>
            <Badge className={`${getRoleColor()} text-white border-0 text-xs px-2 py-1`}>
              {getRoleIcon()}
              <span className="ml-1 hidden sm:inline">{getRoleLabel()}</span>
            </Badge>
          </div>
        )}
        
        <ProtectedByRole requiredRole="admin">
          <Badge variant="outline" className="border-red-500 text-red-600 text-xs hidden md:inline-flex">
            🔧 Admin Mode
          </Badge>
        </ProtectedByRole>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-knumbers-danger rounded-full text-xs"></span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
              <Badge className={`${getRoleColor()} text-white border-0 text-xs mt-1`}>
                {getRoleIcon()}
                <span className="ml-1">{getRoleLabel()}</span>
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Ajuda</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}