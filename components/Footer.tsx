"use client";

import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Twitter,
  Youtube,
  Instagram,
  Music,
} from "lucide-react";

export default function Footer() {
  const socialLinks = [
    {
      name: "Discord",
      icon: MessageCircle,
      url: "https://discord.gg/mxrp",
      color: "hover:text-[#5865F2]",
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      url: "https://x.com/mxrp_erlc",
      color: "hover:text-[#1DA1F2]",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@blueelephantstudios",
      color: "hover:text-[#FF0000]",
    },
    {
      name: "TikTok",
      icon: Music,
      url: "https://www.tiktok.com/@mxrpoficial",
      color: "hover:text-[#000000]",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/mxrperlc_oficial/",
      color: "hover:text-[#E4405F]",
    },
  ];

  return (
    <footer className="border-t border-white/20 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-white/80">
              © 2025 MXRP. Todos los derechos reservados.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className={`text-white/80 ${social.color} transition-colors duration-300 hover:bg-white/10`}
                  onClick={() => window.open(social.url, "_blank")}
                  title={social.name}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              );
            })}
          </div>

          {/* Privacy policy link */}
          <div className="text-center md:text-right">
            <Button
              variant="link"
              className="text-sm text-white/80 hover:text-white p-0 h-auto"
              onClick={() => {
                window.location.href = "/privacidad";
              }}
            >
              Política de Privacidad
            </Button>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-xs text-white/60">
            MXRP ER:LC - Servidor de roleplay de Roblox Liberty County
          </p>
        </div>
      </div>
    </footer>
  );
}
