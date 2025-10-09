"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X, Mail, Calendar, FileText, LogOut } from "lucide-react";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  avatarUrl: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Verificar si hay usuario logueado al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem("discord_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Verificar código de autorización en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      handleDiscordCallback(code);
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleDiscordCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/.netlify/functions/auth-discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("discord_user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Error during Discord auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/.netlify/functions/auth-discord");
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Error getting auth URL:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("discord_user");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-black/20 backdrop-blur-md supports-[backdrop-filter]:bg-black/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <Image
              src="/images/Icon.png"
              alt="MXRP"
              width={40}
              height={40}
              className="rounded-md"
            />
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              MXRP
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Mail className="h-4 w-4" />
              Contacto
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Calendar className="h-4 w-4" />
              Convocatoria
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <FileText className="h-4 w-4" />
              Blog Cartelero
            </Button>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Discord Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-discord/20 border border-discord/30">
                  <Image
                    src={user.avatarUrl}
                    alt={user.username}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-white text-sm font-medium">
                    {user.username}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-4 py-2"
                onClick={handleDiscordLogin}
                disabled={isLoading}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                {isLoading ? "Cargando..." : "Iniciar sesión"}
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/80 hover:text-white hover:bg-white/10"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-black/20 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <Mail className="h-4 w-4" />
                Contacto
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                Convocatoria
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4" />
                Blog Cartelero
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
