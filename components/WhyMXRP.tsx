"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Calendar, Headphones } from "lucide-react";

export default function WhyMXRP() {
  const features = [
    {
      icon: Users,
      title: "Comunidad Activa",
      description:
        "Únete a una comunidad vibrante y amigable de jugadores apasionados por el roleplay.",
    },
    {
      icon: Calendar,
      title: "Eventos Especiales",
      description:
        "Participa en eventos únicos y emocionantes organizados regularmente por nuestro equipo.",
    },
    {
      icon: Headphones,
      title: "Soporte 24/7",
      description:
        "Nuestro equipo de moderadores está siempre disponible para ayudarte.",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            ¿Por qué elegir MXRP?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Descubre las características que hacen de MXRP la mejor opción para
            tu experiencia de roleplay
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="bg-black/80 backdrop-blur-md border-white/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-white/90 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
