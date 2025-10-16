import React from "react";
import { FileText, Calendar, User } from "lucide-react";

interface NoteData {
  Nota: string;
  Aplicado: string;
  Aplicador: string;
}

interface NoteCardProps {
  notes: NoteData[];
}

export default function NoteCard({ notes }: NoteCardProps) {
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
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <FileText className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Notas Administrativas</h3>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
          {notes.length}
        </span>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note, index) => (
            <div
              key={index}
              className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">Nota #{index + 1}</h4>
                <div className="flex items-center gap-1 text-blue-400 text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(note.Aplicado)}</span>
                </div>
              </div>
              <p className="text-white/80 text-sm mb-2">{note.Nota}</p>
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <User className="h-3 w-3" />
                <span>Aplicado por: {note.Aplicador}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">
            No hay notas administrativas registradas
          </p>
        </div>
      )}
    </div>
  );
}










