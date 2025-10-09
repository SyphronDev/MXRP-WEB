"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X, Mail, Calendar, FileText, ArrowRight } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>

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
