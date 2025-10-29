"use client";

import { useState, useEffect } from "react";
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
  FileText,
  Settings,
  Globe,
  MessageSquare,
  Users,
  Calendar,
  Hash,
  Type,
  EyeOff,
} from "lucide-react";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { ResponsiveGrid, ResponsiveContainer } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingModern } from "@/components/ui/loading-modern";
import { ToastContainer, useToast } from "@/components/ui/notification-toast";
import { NavigationTabs } from "@/components/ui/navigation-tabs";
import { MobileTabs } from "@/components/ui/mobile-tabs";

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
  { name: "Negro", value: "#000000" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "MXRP Morado", value: "#8A2BE2" },
  { name: "MXRP Cian", value: "#00CED1" },
];

export default function NewsPanel({ user, guildId }: NewsPanelProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [color, setColor] = useState("#5865F2");
  const [customColor, setCustomColor] = useState("#5865F2");
  const [footerText, setFooterText] = useState("Noticias MXRP");
  const [webhookIconUrl, setWebhookIconUrl] = useState("");
  const [webhookUsername, setWebhookUsername] = useState("MXRP Noticias");
  const [botAvatarUrl, setBotAvatarUrl] = useState("");
  const [fields, setFields] = useState<NewsField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    value: "",
    inline: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "preview" | "settings">("create");
  const toast = useToast();

  // Obtener avatar del bot usando CLIENT_ID
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (clientId) {
      const botAvatar = `https://cdn.discordapp.com/app-icons/${clientId}/icon.png`;
      setBotAvatarUrl(botAvatar);
    }
  }, []);

  // Función para convertir Markdown de Discord a HTML
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^(.*)$/, "<p>$1</p>");
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
      toast.addToast({
        type: "error",
        title: "Campos requeridos",
        message: "El título y la descripción son obligatorios",
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
      toast.addToast({
        type: "error",
        title: "Error de autenticación",
        message: "No se encontró token de autenticación. Por favor, inicia sesión nuevamente.",
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/publish-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          guildId: guildId,
          titulo: titulo.trim(),
          descripcion: descripcion.trim().replace(/\\n/g, "\n"),
          imagenUrl: imagenUrl.trim() || null,
          fields: fields.length > 0 ? fields : null,
          color: customColor || color,
          footerText: footerText.trim() || "Noticias MXRP",
          webhookIconUrl: webhookIconUrl.trim() || botAvatarUrl,
          webhookUsername: webhookUsername.trim() || "MXRP Noticias",
          thumbnailUrl: botAvatarUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.addToast({
          type: "success",
          title: "Noticia publicada",
          message: "¡Noticia publicada exitosamente!",
          duration: 4000,
        });
        // Limpiar formulario
        setTitulo("");
        setDescripcion("");
        setImagenUrl("");
        setColor("#5865F2");
        setFields([]);
      } else {
        toast.addToast({
          type: "error",
          title: "Error al publicar",
          message: data.message || "Error al publicar la noticia",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error publishing news:", error);
      toast.addToast({
        type: "error",
        title: "Error de conexión",
        message: "Error de conexión al publicar la noticia",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      
      {/* News Panel Stats */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={6}>
        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Newspaper className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Panel Activo</h3>
              <p className="text-2xl font-bold text-green-400">Periodista</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Audiencia</h3>
              <p className="text-2xl font-bold text-blue-400">Discord</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Globe className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Canal</h3>
              <p className="text-2xl font-bold text-purple-400">Noticias</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <MessageSquare className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Estado</h3>
              <StatusBadge status="success" text="Conectado" size="sm" />
            </div>
          </div>
        </CardModern>
      </ResponsiveGrid>

      {/* Navigation Tabs */}
      <div>
        <div className="lg:hidden">
          <MobileTabs
            tabs={[
              {
                id: "create",
                label: "Crear",
                icon: <FileText className="h-4 w-4" />,
                badge: "Nuevo",
              },
              {
                id: "preview",
                label: "Vista Previa",
                icon: <Eye className="h-4 w-4" />,
              },
              {
                id: "settings",
                label: "Configuración",
                icon: <Settings className="h-4 w-4" />,
              },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          />
        </div>

        <div className="hidden lg:block">
          <NavigationTabs
            tabs={[
              {
                id: "create",
                label: "Crear Noticia",
                icon: <FileText className="h-4 w-4" />,
                badge: "Editor",
              },
              {
                id: "preview",
                label: "Vista Previa",
                icon: <Eye className="h-4 w-4" />,
                badge: showPreview ? "Visible" : "Oculta",
              },
              {
                id: "settings",
                label: "Configuración",
                icon: <Settings className="h-4 w-4" />,
                badge: "Avanzado",
              },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
            variant="default"
          />
        </div>
      </div>     
 {/* Tab Content */}
      {activeTab === "create" && (
        <div className="space-y-6">
          <CardModern variant="glass" className="p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Newspaper className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Crear Nueva Noticia
                </h2>
                <p className="text-white/60 text-sm">
                  Redacta y publica noticias para la comunidad MXRP
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Título de la Noticia *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="Ej: Nueva actualización del servidor"
                  maxLength={256}
                />
                <p className="text-white/60 text-xs">
                  {titulo.length}/256 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción *
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                  placeholder="Describe la noticia de manera detallada...

Puedes usar formato Discord:
**Texto en negrita**
*Texto en cursiva*
~~Texto tachado~~
`código en línea`"
                  maxLength={4096}
                />
                <div className="flex justify-between items-center">
                  <p className="text-white/60 text-xs">
                    {descripcion.length}/4096 caracteres
                  </p>
                  <div className="text-xs text-white/50">
                    **negrita** *cursiva* ~~tachado~~ `código`
                  </div>
                </div>
              </div>

              {/* Grid de campos adicionales */}
              <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
                {/* Imagen */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    URL de la Imagen
                  </label>
                  <input
                    type="url"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {imagenUrl && (
                    <div className="mt-2">
                      <img
                        src={imagenUrl}
                        alt="Preview"
                        className="w-full max-w-xs h-32 object-cover rounded-lg border border-white/20"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Text */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Texto del Footer
                  </label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                    placeholder="Ej: Noticias MXRP"
                    maxLength={100}
                  />
                </div>
              </ResponsiveGrid>

              {/* Color */}
              <div className="space-y-4">
                <label className="text-white font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color del Embed
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {COLORS.map((colorOption) => (
                    <ButtonModern
                      key={colorOption.value}
                      variant={color === colorOption.value ? "primary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setColor(colorOption.value);
                        setCustomColor(colorOption.value);
                      }}
                      className="w-full"
                      style={{
                        backgroundColor: color === colorOption.value ? colorOption.value + "40" : "transparent",
                        borderColor: colorOption.value + "60",
                      }}
                    >
                      {colorOption.name}
                    </ButtonModern>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-white/70 text-sm">Color Personalizado:</label>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setColor(e.target.value);
                    }}
                    className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                  />
                  <span className="text-white/60 text-sm font-mono">
                    {customColor.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Campos adicionales */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Campos Adicionales
                  </label>
                  <ButtonModern
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddField(!showAddField)}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Agregar Campo
                  </ButtonModern>
                </div>

                {showAddField && (
                  <CardModern variant="glass" className="p-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        placeholder="Nombre del campo"
                        className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-all"
                      />
                      <textarea
                        value={newField.value}
                        onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                        placeholder="Valor del campo"
                        rows={2}
                        className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-all resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-white/70 text-sm">
                          <input
                            type="checkbox"
                            checked={newField.inline}
                            onChange={(e) => setNewField({ ...newField, inline: e.target.checked })}
                            className="rounded"
                          />
                          Campo en línea
                        </label>
                        <div className="flex gap-2">
                          <ButtonModern
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddField(false)}
                          >
                            Cancelar
                          </ButtonModern>
                          <ButtonModern
                            variant="success"
                            size="sm"
                            onClick={addField}
                          >
                            Agregar
                          </ButtonModern>
                        </div>
                      </div>
                    </div>
                  </CardModern>
                )}

                {fields.length > 0 && (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <CardModern key={index} variant="glass" className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{field.name}</h4>
                            <p className="text-white/70 text-sm">{field.value}</p>
                            {field.inline && (
                              <span className="text-xs text-blue-400">En línea</span>
                            )}
                          </div>
                          <ButtonModern
                            variant="outline"
                            size="sm"
                            onClick={() => removeField(index)}
                            icon={<X className="h-3 w-3" />}
                            className="ml-2"
                          />
                        </div>
                      </CardModern>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                <ButtonModern
                  type="button"
                  variant="outline"
                  size="md"
                  icon={showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  onClick={() => {
                    setShowPreview(!showPreview);
                    setActiveTab(showPreview ? "create" : "preview");
                  }}
                  className="flex-1 sm:flex-none"
                >
                  {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
                </ButtonModern>
                
                <ButtonModern
                  type="button"
                  variant="success"
                  size="md"
                  icon={<Send className="h-4 w-4" />}
                  loading={isSubmitting}
                  onClick={publishNews}
                  className="flex-1"
                  gradient={true}
                  glow={true}
                >
                  {isSubmitting ? "Publicando..." : "Publicar Noticia"}
                </ButtonModern>
              </div>
            </div>
          </CardModern>
        </div>
      )}     
 {activeTab === "preview" && (
        <div className="space-y-6">
          <CardModern variant="glass" className="p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Vista Previa del Embed
                </h2>
                <p className="text-white/60 text-sm">
                  Así se verá tu noticia en Discord
                </p>
              </div>
            </div>

            {titulo || descripcion ? (
              <div className="max-w-md">
                <div
                  className="border-l-4 rounded-lg p-4 bg-black/40"
                  style={{
                    borderColor: color || "#5865F2",
                  }}
                >
                  {titulo && (
                    <h3 className="text-white font-bold text-lg mb-2">
                      {titulo}
                    </h3>
                  )}
                  {descripcion && (
                    <div
                      className="text-white/80 text-sm mb-3 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(descripcion),
                      }}
                    />
                  )}
                  
                  {fields.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {fields.map((field, index) => (
                        <div key={index} className="border-t border-white/10 pt-2">
                          <span className="text-white font-semibold text-sm block">
                            {field.name}
                          </span>
                          <div
                            className="text-white/70 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(field.value),
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-white/40 border-t border-white/10 pt-2 mt-3 flex items-center gap-2">
                    {botAvatarUrl && (
                      <img
                        src={botAvatarUrl}
                        alt="Bot Icon"
                        className="w-4 h-4 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span>{footerText || "Noticias MXRP"} • {new Date().toLocaleDateString("es-MX")}</span>
                  </div>
                </div>

                {imagenUrl && (
                  <div className="mt-3">
                    <img
                      src={imagenUrl}
                      alt="Imagen de la noticia"
                      className="max-w-full h-auto rounded-lg border border-white/20"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">
                  Vista Previa Vacía
                </h3>
                <p className="text-white/60 mb-6">
                  Completa el formulario para ver la vista previa
                </p>
                <ButtonModern
                  variant="outline"
                  size="md"
                  onClick={() => setActiveTab("create")}
                >
                  Ir al Editor
                </ButtonModern>
              </div>
            )}
          </CardModern>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <CardModern variant="glass" className="p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Settings className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Configuración Avanzada
                </h2>
                <p className="text-white/60 text-sm">
                  Opciones adicionales para la publicación
                </p>
              </div>
            </div>

            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
              <CardModern variant="glass" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Canal de Destino</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Las noticias se publican automáticamente en el canal de noticias configurado
                </p>
                <StatusBadge status="info" text="Canal: #noticias" size="sm" />
              </CardModern>

              <CardModern variant="glass" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-green-400" />
                  <h3 className="text-white font-semibold">Permisos</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Tienes permisos de periodista para publicar noticias
                </p>
                <StatusBadge status="success" text="Periodista Activo" size="sm" />
              </CardModern>

              <CardModern variant="glass" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <h3 className="text-white font-semibold">Programación</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Las noticias se publican inmediatamente
                </p>
                <StatusBadge status="warning" text="Publicación Inmediata" size="sm" />
              </CardModern>

              <CardModern variant="glass" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Hash className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Formato</h3>
                </div>
                <p className="text-white/60 text-sm mb-4">
                  Las noticias se publican como embeds de Discord
                </p>
                <StatusBadge status="info" text="Formato Embed" size="sm" />
              </CardModern>

              <CardModern variant="glass" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-white font-semibold">Webhook</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/70 text-sm">Nombre del Webhook:</label>
                    <input
                      type="text"
                      value={webhookUsername}
                      onChange={(e) => setWebhookUsername(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-all"
                      placeholder="MXRP Noticias"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">URL del Avatar:</label>
                    <input
                      type="url"
                      value={webhookIconUrl}
                      onChange={(e) => setWebhookIconUrl(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-all"
                      placeholder="URL del avatar del webhook"
                    />
                  </div>
                </div>
              </CardModern>

              <CardModern variant="glass" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Formato de Texto</h3>
                </div>
                <div className="space-y-2 text-sm text-white/70">
                  <p><code className="bg-white/10 px-1 rounded">**texto**</code> - Negrita</p>
                  <p><code className="bg-white/10 px-1 rounded">*texto*</code> - Cursiva</p>
                  <p><code className="bg-white/10 px-1 rounded">~~texto~~</code> - Tachado</p>
                  <p><code className="bg-white/10 px-1 rounded">`texto`</code> - Código</p>
                </div>
              </CardModern>
            </ResponsiveGrid>
          </CardModern>
        </div>
      )}
    </div>
  );
}