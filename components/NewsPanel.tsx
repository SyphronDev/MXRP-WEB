"use client";

import { useState } from "react";
import {
  Newspaper,
  Plus,
  X,
  Image as ImageIcon,
  Palette,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Code,
} from "lucide-react";

interface NewsField {
  name: string;
  value: string;
  inline: boolean;
}

interface NewsPanelProps {
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  guildId: string;
}

const COLORS = [
  { name: "Discord Azul", value: "#5865F2" },
  { name: "Verde", value: "#57F287" },
  { name: "Amarillo", value: "#FEE75C" },
  { name: "Rojo", value: "#ED4245" },
  { name: "Morado", value: "#9C84EF" },
  { name: "Naranja", value: "#F47B67" },
  { name: "Cian", value: "#5CE1E6" },
  { name: "Rosa", value: "#F47FFF" },
];

export default function NewsPanel({ user, guildId }: NewsPanelProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [color, setColor] = useState("#5865F2");
  const [fields, setFields] = useState<NewsField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    value: "",
    inline: false,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Función para convertir Markdown básico a HTML
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold**
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // *italic*
      .replace(/__(.*?)__/g, "<strong>$1</strong>") // __bold__
      .replace(/_(.*?)_/g, "<em>$1</em>") // _italic_
      .replace(/~~(.*?)~~/g, "<del>$1</del>") // ~~strikethrough~~
      .replace(/`(.*?)`/g, "<code>$1</code>") // `code`
      .replace(/\n/g, "<br>"); // line breaks
  };

  // Función para crear el preview del embed
  const createEmbedPreview = () => {
    const embedColor = color ? parseInt(color.replace("#", ""), 16) : 0x5865f2;
    const embedColorHex = `#${embedColor.toString(16).padStart(6, "0")}`;

    return {
      title: titulo || "Título de la noticia",
      description: descripcion || "Descripción de la noticia",
      color: embedColorHex,
      thumbnail: user.avatarUrl,
      image: imagenUrl || null,
      fields: fields,
      footer: `Publicado por ${user.username} • MXRP Noticias`,
      timestamp: new Date().toISOString(),
    };
  };

  const addField = () => {
    if (newField.name.trim() && newField.value.trim()) {
      setFields([...fields, { ...newField }]);
      setNewField({ name: "", value: "", inline: false });
      setShowAddField(false);
    }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const publishNews = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      setMessage({
        type: "error",
        text: "El título y la descripción son obligatorios",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/.netlify/functions/publish-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discordId: user.id,
          guildId: guildId,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          imagenUrl: imagenUrl.trim() || null,
          fields: fields.length > 0 ? fields : null,
          color: color,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "¡Noticia publicada exitosamente!",
        });
        // Limpiar formulario
        setTitulo("");
        setDescripcion("");
        setImagenUrl("");
        setColor("#5865F2");
        setFields([]);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Error al publicar la noticia",
        });
      }
    } catch (error) {
      console.error("Error publishing news:", error);
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Newspaper className="h-6 w-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-semibold text-xl">
            Panel de Noticias
          </h2>
          <p className="text-white/60 text-sm">
            Crea y publica noticias para MXRP - Vista previa en tiempo real
          </p>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30"
              : "bg-red-500/10 border border-red-500/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Layout lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Edición */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-medium">Editor</h3>
          </div>

          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ingresa el título de la noticia"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={256}
              />
              <p className="text-white/60 text-xs mt-1">
                {titulo.length}/256 caracteres
              </p>
            </div>

            {/* Descripción */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/80 text-sm font-medium">
                  Descripción *
                </label>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Code className="h-3 w-3" />
                  <span>Soporta Markdown</span>
                </div>
              </div>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el contenido de la noticia

Ejemplos de Markdown:
**Texto en negrita**
*Texto en cursiva*
~~Texto tachado~~
`código`
__Texto en negrita__
_Texto en cursiva_"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                rows={6}
                maxLength={4096}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-white/60 text-xs">
                  {descripcion.length}/4096 caracteres
                </p>
                <div className="text-xs text-white/50">
                  **negrita** *cursiva* ~~tachado~~ `código`
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <ImageIcon className="h-4 w-4 inline mr-2" />
                URL de Imagen
              </label>
              <input
                type="url"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                <Palette className="h-4 w-4 inline mr-2" />
                Color del Embed
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    onClick={() => setColor(colorOption.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      color === colorOption.value
                        ? "border-white scale-105"
                        : "border-white/20 hover:border-white/40"
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Fields */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-white/80 text-sm font-medium">
                  Campos Adicionales
                </label>
                <button
                  onClick={() => setShowAddField(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Campo
                </button>
              </div>

              {/* Lista de campos existentes */}
              {fields.length > 0 && (
                <div className="space-y-2 mb-4">
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {field.name}
                          </p>
                          <p className="text-white/60 text-xs">{field.value}</p>
                          {field.inline && (
                            <span className="text-blue-400 text-xs">
                              Inline
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeField(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar campo */}
              {showAddField && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                  <div>
                    <label className="block text-white/80 text-xs mb-1">
                      Nombre del Campo
                    </label>
                    <input
                      type="text"
                      value={newField.name}
                      onChange={(e) =>
                        setNewField({ ...newField, name: e.target.value })
                      }
                      placeholder="Ej: Ubicación"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                      maxLength={256}
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs mb-1">
                      Valor del Campo
                      <span className="text-white/50 ml-1">
                        (Soporta Markdown)
                      </span>
                    </label>
                    <textarea
                      value={newField.value}
                      onChange={(e) =>
                        setNewField({ ...newField, value: e.target.value })
                      }
                      placeholder="Ej: Ciudad de México
O con Markdown: **Ciudad de México** - *Capital*"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-blue-500 resize-none"
                      rows={2}
                      maxLength={1024}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-white/80 text-xs">
                      <input
                        type="checkbox"
                        checked={newField.inline}
                        onChange={(e) =>
                          setNewField({ ...newField, inline: e.target.checked })
                        }
                        className="rounded"
                      />
                      Campo inline
                    </label>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => setShowAddField(false)}
                        className="px-3 py-1 text-white/60 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={addField}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de publicar */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={publishNews}
                disabled={isSubmitting || !titulo.trim() || !descripcion.trim()}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium transition-all ${
                  isSubmitting || !titulo.trim() || !descripcion.trim()
                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:scale-[1.02]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Publicar Noticia
                  </>
                )}
              </button>
            </div>

            {/* Panel de Preview */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-green-400" />
                <h3 className="text-white font-medium">
                  Vista Previa en Tiempo Real
                </h3>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 sticky top-4">
                <div
                  className="rounded-lg border-l-4 p-4 bg-gray-800/50"
                  style={{ borderLeftColor: color }}
                >
                  {/* Título */}
                  {titulo ? (
                    <h2 className="text-white font-semibold text-lg mb-2">
                      {titulo}
                    </h2>
                  ) : (
                    <h2 className="text-gray-500 font-semibold text-lg mb-2 italic">
                      Título de la noticia
                    </h2>
                  )}

                  {/* Descripción */}
                  {descripcion ? (
                    <div
                      className="text-gray-300 text-sm mb-3"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(descripcion),
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-sm mb-3 italic">
                      Descripción de la noticia
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      {/* Fields */}
                      {fields.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {fields.map((field, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-white font-medium">
                                {field.name}
                              </span>
                              <div
                                className="text-gray-300"
                                dangerouslySetInnerHTML={{
                                  __html: renderMarkdown(field.value),
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="text-xs text-gray-400 border-t border-gray-700 pt-2 mt-3">
                        Publicado por {user.username}
                      </div>
                    </div>
                  </div>

                  {/* Imagen */}
                  {imagenUrl && (
                    <div className="mt-3">
                      <img
                        src={imagenUrl}
                        alt="Embed image"
                        className="max-w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
