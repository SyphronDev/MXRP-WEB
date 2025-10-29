"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Settings,
  Shield,
  Newspaper,
  Users,
  Menu,
  X,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  user?: {
    username: string;
    avatarUrl: string;
  } | null;
  hasAdminAccess?: boolean;
  hasPoliceAccess?: boolean;
  hasNewsAccess?: boolean;
  hasSolicitudesAccess?: boolean;
}

const navigationItems = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    hoverColor: "hover:bg-blue-500/30",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    hoverColor: "hover:bg-purple-500/30",
  },
  {
    name: "Solicitudes Empresa",
    href: "/solicitudes-empresa",
    icon: Building2,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    hoverColor: "hover:bg-orange-500/30",
  },
];

const adminItems = [
  {
    name: "Panel Admin",
    href: "/admin",
    icon: Settings,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    hoverColor: "hover:bg-red-500/30",
    requiresAdmin: true,
  },
  {
    name: "Base de Datos Policial",
    href: "/police-database",
    icon: Shield,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    hoverColor: "hover:bg-cyan-500/30",
    requiresPolice: true,
  },
  {
    name: "Panel Noticias",
    href: "/news-panel",
    icon: Newspaper,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    hoverColor: "hover:bg-green-500/30",
    requiresNews: true,
  },
  {
    name: "Gestionar Solicitudes",
    href: "/admin/solicitudes",
    icon: Users,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    hoverColor: "hover:bg-yellow-500/30",
    requiresSolicitudes: true,
  },
];

export default function Sidebar({
  user,
  hasAdminAccess = false,
  hasPoliceAccess = false,
  hasNewsAccess = false,
  hasSolicitudesAccess = false,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("discord_user");
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  const filteredAdminItems = adminItems.filter((item) => {
    if (item.requiresAdmin && !hasAdminAccess) return false;
    if (item.requiresPolice && !hasPoliceAccess) return false;
    if (item.requiresNews && !hasNewsAccess) return false;
    if (item.requiresSolicitudes && !hasSolicitudesAccess) return false;
    return true;
  });

  const allItems = [...navigationItems, ...filteredAdminItems];

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-black/90 transition-all duration-200 md:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-black/90 backdrop-blur-xl border-r border-white/20 z-50 transition-all duration-300 ${
          isOpen ? "w-64" : isMobile ? "w-0" : "w-16"
        } ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Image
                src="/images/Icon.png"
                alt="MXRP"
                width={40}
                height={40}
                className="rounded-lg"
              />
              {(isOpen || !isMobile) && (
                <div className="overflow-hidden">
                  <h1 className="text-xl font-bold text-white truncate">MXRP</h1>
                  <p className="text-xs text-white/60 truncate">ER:LC Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          {user && (isOpen || !isMobile) && (
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="rounded-full border border-white/20"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-white/60">Usuario MXRP</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {allItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    if (isMobile) setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? `${item.bgColor} ${item.color} border border-current/30`
                      : `text-white/70 hover:text-white ${item.hoverColor} hover:border-white/20 border border-transparent`
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isActive ? item.bgColor : "bg-white/5 group-hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {(isOpen || !isMobile) && (
                    <>
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 ml-auto transition-transform ${
                          isActive ? "rotate-90" : "group-hover:translate-x-1"
                        }`}
                      />
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          {user && (
            <div className="p-4 border-t border-white/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30">
                  <LogOut className="h-4 w-4" />
                </div>
                {(isOpen || !isMobile) && (
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for content */}
      <div
        className={`transition-all duration-300 ${
          isOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16"
        }`}
      />
    </>
  );
}