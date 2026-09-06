"use client";

import React, { useState } from "react";
import { AIConfig, AIProvider } from "@/types";
import { StorageService } from "@/lib/storage";
import { X, Key, Cpu, Download, Upload, RotateCcw, Check, Cloud, RefreshCw, Smartphone, Database } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSaveConfig: (config: AIConfig) => void;
  onResetData: () => void;
  vaultId: string;
  onVaultRestored: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
  vaultId,
  onVaultRestored,
}) => {
  const [provider, setProvider] = useState<AIProvider>(config.provider || "auto");
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || "");
  const [openaiKey, setOpenaiKey] = useState(config.openaiKey || "");
  const [groqKey, setGroqKey] = useState(config.groqKey || "");
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || "");
  const [supabaseKey, setSupabaseKey] = useState(config.supabaseKey || "");

  // Cloud Sync state
  const [currentVaultId, setCurrentVaultId] = useState(vaultId || StorageService.getVaultId());
  const [restoreVaultId, setRestoreVaultId] = useState("");
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isRestoringCloud, setIsRestoringCloud] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: AIConfig = {
      provider,
      geminiKey: geminiKey.trim() || undefined,
      openaiKey: openaiKey.trim() || undefined,
      groqKey: groqKey.trim() || undefined,
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseKey: supabaseKey.trim() || undefined,
      vaultId: currentVaultId.trim().toUpperCase(),
    };
    StorageService.saveVaultId(currentVaultId);
    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleCloudSync = async () => {
    setIsSyncingCloud(true);
    setSyncStatusMsg("Sincronizando guardarropa y perfil...");
    const res = await StorageService.syncToCloud(currentVaultId);
    setIsSyncingCloud(false);
    setSyncStatusMsg(res.message);
  };

  const handleCloudRestore = async () => {
    if (!restoreVaultId.trim()) {
      alert("Por favor ingresa el Código de Bóveda para recuperar.");
      return;
    }
    setIsRestoringCloud(true);
    setSyncStatusMsg("Buscando y descargando guardarropa...");
    const res = await StorageService.restoreFromCloud(restoreVaultId);
    setIsRestoringCloud(false);
    setSyncStatusMsg(res.message);
    if (res.success) {
      onVaultRestored();
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleExportJSON = () => {
    const data = {
      profile: StorageService.getProfile(),
      garments: StorageService.getGarments(),
      outfits: StorageService.getOutfits(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imftok_guardarropa_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.garments) StorageService.saveGarments(json.garments);
          if (json.profile) StorageService.saveProfile(json.profile);
          if (json.outfits) {
            localStorage.setItem("imftok_outfits", JSON.stringify(json.outfits));
          }
          alert("¡Guardarropa restaurado con éxito!");
          onVaultRestored();
          onClose();
        } catch {
          alert("Error al leer el archivo JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-charcoal-900 w-full max-w-xl rounded-3xl shadow-2xl border border-cream-200 dark:border-charcoal-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-cream-200 dark:border-charcoal-800 flex items-center justify-between bg-cream-50/50 dark:bg-charcoal-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-terracotta-500" />
            </div>
            <div>
              <h3 className="font-sans text-base sm:text-lg font-bold text-charcoal-900 dark:text-white leading-tight">
                Ajustes & Sincronización Multidispositivo
              </h3>
              <p className="text-[11px] text-charcoal-800/60 dark:text-zinc-400">
                Bóveda en la nube, APIs y respaldos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 dark:hover:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Cloud Vault Sync between devices */}
          <div className="p-4 rounded-2xl bg-terracotta-50/50 dark:bg-terracotta-950/30 border border-terracotta-200/80 dark:border-terracotta-900/50 space-y-3.5">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-terracotta-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white">
                Bóveda en la Nube (Usar en varios dispositivos)
              </span>
            </div>

            <p className="text-xs text-charcoal-800/80 dark:text-zinc-300">
              Usa tu <strong>Código de Bóveda</strong> para sincronizar y recuperar tus fotos y prendas en cualquier teléfono, tablet o PC.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-400 mb-1">
                Tu Código de Bóveda Personal:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentVaultId}
                  onChange={(e) => setCurrentVaultId(e.target.value.toUpperCase())}
                  placeholder="IMF-TOK-XXXXXX"
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-xs font-mono font-bold text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                <button
                  type="button"
                  onClick={handleCloudSync}
                  disabled={isSyncingCloud}
                  className="px-3.5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? "animate-spin" : ""}`} />
                  <span>{isSyncingCloud ? "Subiendo..." : "Subir a la Nube"}</span>
                </button>
              </div>
            </div>

            {/* Restore from code on new device */}
            <div className="pt-2 border-t border-terracotta-200/60 dark:border-charcoal-800">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-400 mb-1">
                ¿Abriste la app en otro teléfono? Recupera tu ropa aquí:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={restoreVaultId}
                  onChange={(e) => setRestoreVaultId(e.target.value.toUpperCase())}
                  placeholder="Pega el código de tu otro dispositivo"
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-xs font-mono text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
                <button
                  type="button"
                  onClick={handleCloudRestore}
                  disabled={isRestoringCloud || !restoreVaultId.trim()}
                  className="px-3.5 py-2 rounded-xl bg-charcoal-900 dark:bg-white hover:bg-charcoal-800 text-white dark:text-charcoal-950 text-xs font-bold disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isRestoringCloud ? "Restaurando..." : "Restaurar"}</span>
                </button>
              </div>
            </div>

            {syncStatusMsg && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-charcoal-900 text-[11px] font-medium text-charcoal-900 dark:text-zinc-200 border border-terracotta-200/80 dark:border-charcoal-700 animate-fadeIn">
                {syncStatusMsg}
              </div>
            )}
          </div>

          {/* AI Provider Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2">
              Motor de Visión & Estilismo IA
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "auto", label: "Automático / Híbrido", desc: "Usa API disponible o motor local" },
                { id: "gemini", label: "Google Gemini 2.0", desc: "Visión multimodal de alta velocidad" },
                { id: "openai", label: "OpenAI GPT-4o-mini", desc: "Análisis editorial y estilismo" },
                { id: "groq", label: "Groq (Llama 3.2)", desc: "Inferencia ultrarrápida" },
              ].map((p) => {
                const active = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id as AIProvider)}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      active
                        ? "border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/40 ring-1 ring-terracotta-500"
                        : "border-cream-200 dark:border-charcoal-800 bg-cream-50/50 dark:bg-charcoal-950/50 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                    }`}
                  >
                    <span className="text-xs font-bold text-charcoal-900 dark:text-white block mb-0.5">
                      {p.label}
                    </span>
                    <span className="text-[9px] text-charcoal-800/60 dark:text-zinc-400 leading-tight">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Keys Inputs */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                <Key className="w-3.5 h-3.5 text-terracotta-500" /> Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                <Key className="w-3.5 h-3.5 text-charcoal-800 dark:text-zinc-300" /> OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                <Key className="w-3.5 h-3.5 text-amber-500" /> Groq API Key
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3.5 py-2 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-terracotta-500"
              />
            </div>
          </div>

          {/* Backup & Import */}
          <div className="pt-3 border-t border-cream-200 dark:border-charcoal-800 space-y-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 block">
              Copia Local en Archivo JSON
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-zinc-200 text-xs font-medium border border-cream-200 dark:border-charcoal-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-zinc-200 text-xs font-medium border border-cream-200 dark:border-charcoal-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Reiniciar guardarropa y perfil al inventario de muestra original?")) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-medium ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Todo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-cream-200 dark:border-charcoal-800 flex items-center justify-between bg-cream-50/50 dark:bg-charcoal-950/50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-charcoal-800 dark:text-zinc-400 hover:text-charcoal-900 dark:hover:text-white px-3 py-1.5"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-charcoal-900 dark:bg-white hover:bg-charcoal-800 text-white dark:text-charcoal-950 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : null}
            <span>{savedSuccess ? "Guardado" : "Guardar Ajustes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
