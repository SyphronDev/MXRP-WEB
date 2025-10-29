"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Settings,
  Users,
  Shield,
  Newspaper,
  Building2,
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { ButtonModern } from "@/components/ui/button-modern";
import { CardModern } from "@/components/ui/card-modern";
import { ResponsiveContainer } from "@/components/ui/responsive-grid";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  user?: {
    username: string;
    avatarUrl: string;
  } | null;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function AdminLayout({
  children,
  title,
  subtitle,
  user,
  showBackButton = true,
  backUrl = "/dashboard",
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const adminNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "text-purple-400",
    },
    {
      name: "Panel Admin",
      href: "/admin",
      icon: Settings,
      color: "text-red-400",
    },
    {
      name: "Gestionar Solicitudes",
      href: "/admin/solicitudes",
      icon: Users,
      color: "text-orange-400",
    },
    {
      name: "Base Policial",
      href: "/police-database",
      icon: Shield,
      color: "text-cyan-400",
    },
    {
      name: "Panel Noticias",
      href: "/news-panel",
      icon: Newspaper,
      color: "text-green-400",
    },
    {
      name: "Solicitudes Empresa",
      href: "/solicitudes-empresa",
      icon: Building2,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/20 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <ButtonModern
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => router.push(backUrl)}
                className="text-white/80"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="text-white/60 text-sm">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={32}
                height={32}
                className="rounded-full border border-white/20"
              />
            )}
            <ButtonModern
              variant="ghost"
              size="sm"
              icon={isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/80"
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[80vw] bg-black/95 backdrop-blur-xl border-l border-white/20">
            <div className="p-4 space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10`}
                  >
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden lg:block relative z-10">
        <ResponsiveContainer className="py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <ButtonModern
                  variant="ghost"
                  size="md"
                  icon={<ArrowLeft className="h-5 w-5" />}
                  onClick={() => router.push(backUrl)}
                  className="text-white/80"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
                {subtitle && (
                  <p className="text-white/60 text-lg">{subtitle}</p>
                )}
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-red-500/50"
                />
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-white/60 text-sm">Administrador</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <ButtonModern
                  key={item.name}
                  variant="outline"
                  size="sm"
                  icon={<Icon className="h-4 w-4" />}
                  onClick={() => router.push(item.href)}
                  className={`${item.color} border-current/30`}
                >
                  {item.name}
                </ButtonModern>
              );
            })}
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <ResponsiveContainer className="pb-8">
          {children}
        </ResponsiveContainer>
      </main>
    </div>
  );
}