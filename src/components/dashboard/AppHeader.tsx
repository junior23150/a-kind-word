import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Bell,
  Settings,
  User,
  Users,
  Calendar,
  CalendarPlus,
  CreditCard,
  Building2,
  Target,
  ArrowUpDown,
  Receipt,
  FolderKanban,
  MessageCircle,
  HelpCircle,
  Menu,
  X,
  LogOut,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface MenuSection {
  title: string;
  items: {
    title: string;
    url?: string;
    icon?: React.ComponentType<{ className?: string }>;
    isHeader?: boolean;
  }[];
}

const getMenuSections = (workspace: string): Record<string, MenuSection> => {
  if (workspace === "business") {
    return {
      cadastros: {
        title: "Cadastros",
        items: [
          { title: "Pacientes", url: "/pacientes", icon: Users },
          { title: "Agenda", url: "/agenda", icon: Calendar },
          {
            title: "Marcar Consulta",
            url: "/marcar-consulta",
            icon: CalendarPlus,
          },
        ],
      },
      financeiro: {
        title: "Financeiro",
        items: [
          { title: "Contas", url: "/contas", icon: CreditCard },
          { title: "Transações", url: "/transações", icon: ArrowUpDown },
          {
            title: "Planejamento - Empresa",
            url: "/planejamento-empresa",
            icon: Building2,
          },
          {
            title: "Planejamento - Pessoal",
            url: "/planejamento-pessoal",
            icon: User,
          },
          { title: "Objetivos", url: "/objetivos", icon: Target },
          { title: "Pagamentos", url: "/pagamentos", icon: Receipt },
        ],
      },
      meuEspaco: {
        title: "Meu Espaço",
        items: [
          { title: "Organizador", url: "/organizador", icon: FolderKanban },
          {
            title: "Falar com Consultoria",
            url: "/consultoria",
            icon: MessageCircle,
          },
          { title: "Configurações", url: "/configuracoes", icon: Settings },
        ],
      },
    };
  } else {
    // Personal workspace
    return {
      cadastros: {
        title: "Cadastros",
        items: [
          { title: "Cadastros", isHeader: true },
          { title: "Contas Bancárias", url: "/contas" },
          { title: "Categorias", url: "/categorias" },
        ],
      },
      financeiro: {
        title: "Financeiro",
        items: [
          { title: "Transações", url: "/transações", icon: ArrowUpDown },
          {
            title: "Planejamento - Pessoal",
            url: "/planejamento-pessoal",
            icon: User,
          },
          { title: "Objetivos", url: "/objetivos", icon: Target },
          { title: "Pagamentos", url: "/pagamentos", icon: Receipt },
        ],
      },
      meuEspaco: {
        title: "Meu Espaço",
        items: [
          { title: "Organizador", url: "/organizador", icon: FolderKanban },
          {
            title: "Falar com Consultoria",
            url: "/consultoria",
            icon: MessageCircle,
          },
          { title: "Configurações", url: "/configuracoes", icon: Settings },
        ],
      },
    };
  }
};

export function AppHeader() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { workspace, toggleWorkspace } = useWorkspace();
  const searchRef = useRef<HTMLInputElement>(null);

  // Handle workspace toggle and navigation
  const handleWorkspaceToggle = () => {
    toggleWorkspace();
    // Navigate to appropriate dashboard
    if (workspace === "personal") {
      navigate("/dashboard-business");
    } else {
      navigate("/dashboard");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown &&
        !(event.target as Element).closest("[data-dropdown]")
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !isSearchFocused) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setOpenDropdown(null);
        searchRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchFocused]);

  const isActiveRoute = (url: string) => {
    return location.pathname === url;
  };

  const menuSections = getMenuSections(workspace);

  const isDropdownActive = (sectionKey: string) => {
    return menuSections[sectionKey].items.some(
      (item) => item.url && isActiveRoute(item.url)
    );
  };

  const handleDropdownClick = (sectionKey: string) => {
    setOpenDropdown(openDropdown === sectionKey ? null : sectionKey);
  };

  const renderDropdownMenu = (sectionKey: string) => {
    const section = menuSections[sectionKey];
    return (
        <div
          className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-2"
          data-dropdown
        >
        {section.items.map((item) => {
          if (item.isHeader) {
            return (
              <div
                key={item.title}
                className="px-4 py-2 text-sm font-bold text-popover-foreground"
              >
                {item.title}
              </div>
            );
          }

          return (
            <NavLink
              key={item.title}
              to={item.url!}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-popover-foreground"
                }`
              }
              onClick={() => setOpenDropdown(null)}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.title}
            </NavLink>
          );
        })}
      </div>
    );
  };

  const getRoleInfo = () => {
    switch (profile?.role) {
      case "admin":
        return {
          icon: Crown,
          label: "Admin",
          color: "bg-gradient-to-r from-yellow-500 to-orange-500",
        };
      case "business":
        return {
          icon: Building2,
          label: "Business",
          color: "bg-gradient-to-r from-blue-500 to-indigo-500",
        };
      default:
        return {
          icon: User,
          label: "Personal",
          color: "bg-gradient-to-r from-knumbers-green to-knumbers-purple",
        };
    }
  };

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-50 h-16 w-full bg-background border-b border-border shadow-sm rounded-b-[2.5rem]"
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          {/* Zona Esquerda - Logo + Menu Principal */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-knumbers-green to-knumbers-purple rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">K</span>
              </div>
            </Link>

            {/* Menu Principal - Desktop */}
            <nav
              aria-label="Menu principal"
              className="hidden lg:flex items-center gap-6"
            >
              {Object.entries(menuSections).map(([sectionKey, section]) => (
                <div key={sectionKey} className="relative" data-dropdown>
                  <button
                    onClick={() => handleDropdownClick(sectionKey)}
                    aria-haspopup="menu"
                    aria-expanded={openDropdown === sectionKey}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isDropdownActive(sectionKey) ||
                      openDropdown === sectionKey
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:text-primary hover:bg-muted/50"
                    }`}
                  >
                    {section.title}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        openDropdown === sectionKey ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === sectionKey &&
                    renderDropdownMenu(sectionKey)}
                </div>
              ))}
            </nav>

            {/* Menu Mobile */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 bg-gradient-to-br from-knumbers-green to-knumbers-purple rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">K</span>
                    </div>
                    Knumbers
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-4">
                  {Object.entries(menuSections).map(([sectionKey, section]) => (
                    <div key={sectionKey}>
                      <h3 className="px-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          if (item.isHeader) {
                            return (
                              <div
                                key={item.title}
                                className="px-3 py-2 text-sm font-bold text-foreground"
                              >
                                {item.title}
                              </div>
                            );
                          }

                          return (
                            <NavLink
                              key={item.title}
                              to={item.url!}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                                }`
                              }
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.icon && <item.icon className="h-4 w-4" />}
                              {item.title}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Zona Central - Busca */}
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Pesquisar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                aria-label="Pesquisar"
                className="pl-10 h-10 bg-muted/50 border-0 rounded-full focus:bg-background focus:ring-2 focus:ring-ring"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                /
              </kbd>
            </div>
          </div>

          {/* Zona Direita - Ações + Perfil */}
          <div className="flex items-center gap-2">
            {/* Botão de busca mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>

            {/* Workspace Toggle */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-full">
              <span
                className={`text-xs font-medium transition-colors ${
                  workspace === "personal"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Meu Espaço
              </span>
              <Switch
                checked={workspace === "business"}
                onCheckedChange={handleWorkspaceToggle}
                className="data-[state=checked]:bg-primary"
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  workspace === "business"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Meu Negócio
              </span>
            </div>

            {/* Mobile Workspace Toggle */}
            <div className="lg:hidden flex items-center">
              <Switch
                checked={workspace === "business"}
                onCheckedChange={handleWorkspaceToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Ajuda */}
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Notificações */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-knumbers-danger rounded-full"></span>
            </Button>

            {/* Configurações */}
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>

            {/* Menu do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3"
                >
                  <div className="w-6 h-6 bg-knumbers-danger rounded-sm flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {profile?.full_name || "AVALON–ALUIZIO"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {profile?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.email}
                  </p>
                  {profile &&
                    (() => {
                      const roleInfo = getRoleInfo();
                      return (
                        <Badge
                          className={`${roleInfo.color} text-white border-0 text-xs mt-1`}
                        >
                          <roleInfo.icon className="h-3 w-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                      );
                    })()}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Meu perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="mr-2 h-4 w-4" />
                  Trocar workspace
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}

export default AppHeader;
