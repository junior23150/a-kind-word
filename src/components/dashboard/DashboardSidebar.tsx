import {
  BarChart3,
  Users,
  Calendar,
  CalendarPlus,
  CreditCard,
  Building2,
  User,
  Target,
  ArrowUpDown,
  Receipt,
  FolderKanban,
  MessageCircle,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuSections = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "GERENCIAMENTO",
    isCategory: true,
    items: [
      {
        title: "Pacientes",
        url: "/pacientes",
        icon: Users,
      },
      {
        title: "Agenda",
        url: "/agenda",
        icon: Calendar,
      },
      {
        title: "Marcar Consulta",
        url: "/marcar-consulta",
        icon: CalendarPlus,
      },
    ],
  },
  {
    title: "FINANCEIRO",
    isCategory: true,
    items: [
      {
        title: "Contas",
        url: "/contas",
        icon: CreditCard,
      },
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
      {
        title: "Objetivos",
        url: "/objetivos",
        icon: Target,
      },
      {
        title: "Transações",
        url: "/transações",
        icon: ArrowUpDown,
      },
      {
        title: "Pagamentos",
        url: "/pagamentos",
        icon: Receipt,
      },
    ],
  },
  {
    title: "ORGANIZAÇÃO",
    isCategory: true,
    items: [
      {
        title: "Organizador",
        url: "/organizador",
        icon: FolderKanban,
      },
      {
        title: "Falar com Consultoria",
        url: "/consultoria",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Configurações",
        url: "/configuracoes",
        icon: Settings,
      },
    ],
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <TooltipProvider>
      <Sidebar className={isCollapsed ? "w-20" : "w-64"} collapsible="icon">
        <SidebarContent className="p-0 flex flex-col h-full overflow-hidden">
          {/* Logo/Brand */}
          <div className="h-16 px-3 py-3 border-b border-sidebar-border flex items-center min-h-[4rem]">
            <div className="flex items-center gap-2 w-full">
              <div
                className={`${
                  isCollapsed ? "w-10 h-10 mx-auto" : "w-7 h-7"
                } bg-gradient-to-br from-knumbers-green to-knumbers-purple rounded-lg flex items-center justify-center shadow-md`}
              >
                <span
                  className={`text-white font-bold ${
                    isCollapsed ? "text-lg" : "text-xs"
                  }`}
                >
                  K
                </span>
              </div>
              {!isCollapsed && (
                <span className="font-bold text-base bg-gradient-to-r from-knumbers-green to-knumbers-purple bg-clip-text text-transparent">
                  Knumbers
                </span>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div
            className={`${
              isCollapsed ? "px-2 py-3" : "px-3 py-3"
            } flex-1 overflow-y-auto`}
          >
            {menuSections.slice(0, -1).map((section, sectionIndex) => (
              <SidebarGroup
                key={section.title}
                className={`mb-0 mr-2 ${isCollapsed ? "mb-4" : ""}`}
              >
                {/* Category Label */}
                {section.isCategory && !isCollapsed && (
                  <>
                    <SidebarGroupLabel className="text-knumbers-green font-semibold text-xs uppercase tracking-wider mb-1 px-0 group-data-[collapsible=icon]:mb-0">
                      {section.title}
                    </SidebarGroupLabel>
                    <div className="w-full h-px bg-border/30 mb-2"></div>
                  </>
                )}

                {/* Section Items */}
                <SidebarGroupContent>
                  <SidebarMenu
                    className={isCollapsed ? "space-y-2" : "space-y-0"}
                  >
                    {section.items.map((item) => (
                      <SidebarMenuItem
                        key={item.title}
                        className={isCollapsed ? "mb-1" : "mb-0.5"}
                      >
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <NavLink to={item.url}>
                                {({ isActive }) => (
                                  <SidebarMenuButton
                                    isActive={isActive}
                                    className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200 ${
                                      isActive
                                        ? "bg-gradient-to-r from-knumbers-green to-knumbers-purple"
                                        : "bg-transparent hover:bg-sidebar-accent"
                                    }`}
                                  >
                                    <item.icon
                                      className={`h-4 w-4 ${
                                        isActive
                                          ? "text-white"
                                          : "text-knumbers-purple"
                                      }`}
                                    />
                                  </SidebarMenuButton>
                                )}
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white border-none"
                            >
                              <p>{item.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <NavLink to={item.url}>
                            {({ isActive }) => (
                              <SidebarMenuButton
                                isActive={isActive}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full h-10 ${
                                  isActive
                                    ? "bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white shadow-lg"
                                    : "bg-transparent hover:bg-sidebar-accent text-sidebar-foreground"
                                }`}
                              >
                                <item.icon
                                  className={`h-4 w-4 flex-shrink-0 ${
                                    isActive
                                      ? "text-white"
                                      : "text-knumbers-purple"
                                  }`}
                                />
                                <span
                                  className={`font-medium text-xs ${
                                    isActive
                                      ? "text-white"
                                      : "text-sidebar-foreground"
                                  }`}
                                >
                                  {item.title}
                                </span>
                              </SidebarMenuButton>
                            )}
                          </NavLink>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>

          {/* Configurações no final */}
          <div
            className={`${
              isCollapsed ? "px-2 py-2" : "px-3 py-3"
            } border-t border-sidebar-border/30 mt-auto`}
          >
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu
                  className={isCollapsed ? "space-y-2" : "space-y-0"}
                >
                  {menuSections[menuSections.length - 1].items.map((item) => (
                    <SidebarMenuItem
                      key={item.title}
                      className={isCollapsed ? "mb-1" : ""}
                    >
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <NavLink to={item.url}>
                              {({ isActive }) => (
                                <SidebarMenuButton
                                  isActive={isActive}
                                  className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? "bg-gradient-to-r from-knumbers-green to-knumbers-purple"
                                      : "bg-transparent hover:bg-sidebar-accent"
                                  }`}
                                >
                                  <item.icon
                                    className={`h-4 w-4 ${
                                      isActive
                                        ? "text-white"
                                        : "text-knumbers-purple"
                                    }`}
                                  />
                                </SidebarMenuButton>
                              )}
                            </NavLink>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white border-none"
                          >
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <NavLink to={item.url}>
                          {({ isActive }) => (
                            <SidebarMenuButton
                              isActive={isActive}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full h-10 ${
                                isActive
                                  ? "bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white"
                                  : "bg-transparent hover:bg-sidebar-accent text-sidebar-foreground"
                              }`}
                            >
                              <item.icon
                                className={`h-4 w-4 flex-shrink-0 ${
                                  isActive
                                    ? "text-white"
                                    : "text-knumbers-purple"
                                }`}
                              />
                              <span
                                className={`font-medium text-xs ${
                                  isActive
                                    ? "text-white"
                                    : "text-sidebar-foreground"
                                }`}
                              >
                                {item.title}
                              </span>
                            </SidebarMenuButton>
                          )}
                        </NavLink>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
