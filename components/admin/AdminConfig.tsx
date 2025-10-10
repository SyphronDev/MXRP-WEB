import React, { useState } from "react";
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react";

interface AdminConfigProps {
  guildId: string;
  onConfigUpdate?: (config: any) => void;
}

export default function AdminConfig({
  guildId,
  onConfigUpdate,
}: AdminConfigProps) {
  const [config, setConfig] = useState({
    guildId: guildId,
    cacheTimeout: 1800, // 30 minutos
    enableRedis: true,
    autoRefresh: true,
    refreshInterval: 300, // 5 minutos
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Aquí harías la llamada a tu API para guardar la configuración
      // const response = await fetch('/.netlify/functions/admin-config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config),
      // });

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: "success",
        text: "Configuración guardada exitosamente",
      });
      onConfigUpdate?.(config);
    } catch (error) {
      setMessage({ type: "error", text: "Error al guardar la configuración" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Settings className="h-6 w-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-white">
          Configuración del Panel
        </h3>
      </div>

      <div className="space-y-4">
        {/* Cache Timeout */}
        <div>
          <label className="block text-white/80 text-sm mb-2">
            Tiempo de Caché (segundos)
          </label>
          <input
            type="number"
            value={config.cacheTimeout}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                cacheTimeout: parseInt(e.target.value),
              }))
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-discord"
            placeholder="1800"
          />
          <p className="text-white/60 text-xs mt-1">
            Tiempo que los datos permanecen en caché Redis (recomendado: 1800
            segundos)
          </p>
        </div>

        {/* Enable Redis */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-white/80 text-sm mb-1">
              Habilitar Redis Cache
            </label>
            <p className="text-white/60 text-xs">
              Usar Redis para mejorar el rendimiento
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableRedis}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  enableRedis: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Auto Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-white/80 text-sm mb-1">
              Auto Refresh
            </label>
            <p className="text-white/60 text-xs">
              Actualizar datos automáticamente
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoRefresh}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  autoRefresh: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Refresh Interval */}
        {config.autoRefresh && (
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Intervalo de Actualización (segundos)
            </label>
            <input
              type="number"
              value={config.refreshInterval}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  refreshInterval: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-discord"
              placeholder="300"
            />
            <p className="text-white/60 text-xs mt-1">
              Cada cuánto tiempo se actualizan los datos automáticamente
            </p>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-500/30"
                : "bg-red-500/20 border border-red-500/30"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span
              className={`text-sm ${
                message.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {message.text}
            </span>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-discord hover:bg-discord/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
