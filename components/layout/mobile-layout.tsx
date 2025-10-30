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
  Home,
  LogOut,
  ChevronRight,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { ButtonModern } from "@/components/ui/button-modern";

interface MobileLayoutProps {
  children: React.ReactNode;
  user?: {
    username: string;
    avatarUrl: string;
  } | null;
  hasAdminAccess?: boolean;
  hasPoliceAccess?: boolean;
  hasNewsAccess?: boolean;
  hasSolicitudesAccess?: boolean;
  showAlerts?: boolean;
  alertsCount?: number;
  showBackButton?: boolean;
  backUrl?: string;
  title?: string;
  subtitle?: string;
}

const navigationItems = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  {
    name: "Solicitudes",
    href: "/solicitudes-empresa",
    icon: Building2,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
];

export default function MobileLayout({
  children,
  user,
  hasAdminAccess = false,
  hasPoliceAccess = false,
  hasNewsAccess = false,
  hasSolicitudesAccess = false,
  showAlerts = false,
  alertsCount = 0,
  showBackButton = false,
  backUrl = "/dashboard",
  title,
  subtitle,
}: MobileLayoutProps) {
  console.log("MobileLayout props:", { showBackButton, backUrl, title, subtitle });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("discord_user");
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  const adminItems = [
    {
      name: "Panel Admin",
      href: "/admin",
      icon: Settings,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      show: hasAdminAccess,
    },
    {
      name: "Base Policial",
      href: "/police-database",
      icon: Shield,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      show: hasPoliceAccess,
    },
    {
      name: "Panel Noticias",
      href: "/news-panel",
      icon: Newspaper,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      show: hasNewsAccess,
    },
    {
      name: "Gestionar Solicitudes",
      href: "/admin/solicitudes",
      icon: Users,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      show: hasSolicitudesAccess,
    },
  ].filter(item => item.show);

  const allItems = [...navigationItems, ...adminItems];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/20 lg:hidden">
        <div className="flex items-center justify-between p-4">
          {/* Left side - Logo or Back button */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <ButtonModern
                variant="outline"
                size="sm"
                onClick={() => router.push(backUrl)}
                icon={<ArrowLeft className="h-4 w-4" />}
                className="mr-2"
              />
            ) : null}
            <Image
              src="/images/Icon.png"
              alt="MXRP"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-white">{title || "MXRP"}</h1>
              {subtitle && (
                <p className="text-xs text-white/60">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Alerts indicator */}
            {showAlerts && alertsCount > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-white/60" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {alertsCount}
                </span>
              </div>
            )}

            {/* User avatar */}
            {user && (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={32}
                height={32}
                className="rounded-full border border-white/20"
              />
            )}

            {/* Menu button */}
            <ButtonModern
              variant="ghost"
              size="sm"
              icon={isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80"
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[80vw] bg-black/95 backdrop-blur-xl border-l border-white/20">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="p-4 border-b border-white/20">
                {user && (
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.avatarUrl}
                      alt={user.username}
                      width={40}
                      height={40}
                      className="rounded-full border border-white/20"
                    />
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-white/60 text-sm">Usuario MXRP</p>
                    </div>
                  </div>
                )}
              </div>

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
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? `${item.bgColor} ${item.color} border border-current/30`
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              {user && (
                <div className="p-4 border-t border-white/20">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}