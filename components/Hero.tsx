"use client";

import { Button } from "@/components/ui/button";
import { FileText, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-mxrp-purple/5 via-transparent to-mxrp-teal/5" />

      {/* Efectos de humo animado - Día de Muertos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Humo superior izquierda */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-gray-600/80 rounded-full blur-xl animate-smoke-1" />
        <div className="absolute top-20 left-20 w-20 h-20 bg-gray-500/85 rounded-full blur-lg animate-smoke-2" />
        <div className="absolute top-16 left-32 w-28 h-28 bg-gray-700/75 rounded-full blur-2xl animate-smoke-3" />

        {/* Humo superior derecha */}
        <div className="absolute top-12 right-12 w-22 h-22 bg-gray-600/85 rounded-full blur-xl animate-smoke-2" />
        <div className="absolute top-24 right-24 w-24 h-24 bg-gray-500/80 rounded-full blur-lg animate-smoke-1" />
        <div className="absolute top-20 right-36 w-26 h-26 bg-gray-700/70 rounded-full blur-2xl animate-smoke-3" />

        {/* Humo inferior izquierda */}
        <div className="absolute bottom-20 left-16 w-20 h-20 bg-gray-600/75 rounded-full blur-lg animate-smoke-3" />
        <div className="absolute bottom-32 left-28 w-28 h-28 bg-gray-500/80 rounded-full blur-xl animate-smoke-1" />

        {/* Humo inferior derecha */}
        <div className="absolute bottom-16 right-20 w-22 h-22 bg-gray-600/80 rounded-full blur-lg animate-smoke-2" />
        <div className="absolute bottom-28 right-32 w-24 h-24 bg-gray-500/75 rounded-full blur-xl animate-smoke-3" />

        {/* Velas de Día de Muertos - Más visibles */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-orange-400/90 rounded-full blur-sm animate-candle-flicker shadow-lg shadow-orange-400/50" />
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-orange-300/95 rounded-full blur-sm animate-candle-flicker shadow-lg shadow-orange-300/50" />
        <div className="absolute bottom-1/3 left-1/3 w-18 h-18 bg-orange-500/85 rounded-full blur-sm animate-candle-flicker shadow-lg shadow-orange-500/50" />
        <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-orange-600/90 rounded-full blur-sm animate-candle-flicker shadow-lg shadow-orange-600/50" />

        {/* Velas adicionales para mayor visibilidad */}
        <div className="absolute top-1/2 left-1/6 w-14 h-14 bg-orange-400/80 rounded-full blur-sm animate-candle-flicker shadow-lg shadow-orange-400/40" />
        <div className="absolute top-1/2 right-1/6 w-16 h-16 bg-orange-500/85 rounded-full blur-sm animate-candle-flicker shadow-lg shadow-orange-500/40" />

        {/* Elementos decorativos originales */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-mxrp-purple/20 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-mxrp-teal/20 rounded-full blur-xl animate-pulse-slow" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo central */}
        <div className="mb-8">
          <Image
            src="/images/Icon.png"
            alt="MXRP Logo"
            width={150}
            height={150}
            className="rounded-lg shadow-2xl mx-auto"
            priority
          />
          {/* Texto de bienvenida */}
          <div className="mt-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-white drop-shadow-lg">
              Bienvenido A MXRP ER:LC
            </h2>
          </div>
        </div>

        {/* Subtítulo */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl drop-shadow-lg">
          La mejor experiencia de roleplay en Roblox. Únete a nuestra comunidad
          y vive aventuras únicas.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button
            size="lg"
            variant="secondary"
            className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 border border-white/20 backdrop-blur-sm shadow-lg"
            onClick={() => {
              window.location.href = "/terminos";
            }}
          >
            <FileText className="h-5 w-5" />
            Términos y Condiciones
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 border border-white/20 backdrop-blur-sm shadow-lg"
            onClick={() => {
              window.open(
                "https://discord.gg/mxrp",
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            <MessageCircle className="h-5 w-5" />
            Discord
          </Button>
        </div>
      </div>
    </section>
  );
}
