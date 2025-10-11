import React from "react";
import { AlertTriangle, Calendar, User } from "lucide-react";

interface WarnData {
  Warn: string;
  Aplicador: string;
  Aplicado: string;
}

interface WarnCardProps {
  warns: WarnData[];
}

export default function WarnCard({ warns }: WarnCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-red-500/20 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Warns Administrativos</h3>
        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
          {warns.length}
        </span>
      </div>

      {warns.length > 0 ? (
        <div className="space-y-3">
          {warns.map((warn, index) => (
            <div
              key={index}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">Warn #{index + 1}</h4>
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(warn.Aplicado)}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-2">{warn.Warn}</p>
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <User className="h-3 w-3" />
                <span>Aplicado por: {warn.Aplicador}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">
            No hay warns administrativos registrados
          </p>
        </div>
      )}
    </div>
  );
}

