"use client";

import React, { useState } from "react";
import { Garment, UserProfile } from "@/types";
import { StorageService } from "@/lib/storage";
import { X, Copy, Check, BarChart2, Sparkles, Key } from "lucide-react";

interface WardrobeStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  garments: Garment[];
  profile: UserProfile;
}

export const WardrobeStatsModal: React.FC<WardrobeStatsModalProps> = ({
  isOpen,
  onClose,
  garments,
  profile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const categories = {
    top: garments.filter((g) => g.category === "top"),
    bottom: garments.filter((g) => g.category === "bottom"),
    footwear: garments.filter((g) => g.category === "footwear"),
    outerwear: garments.filter((g) => g.category === "outerwear"),
    accessory: garments.filter((g) => g.category === "accessory"),
    one_piece: garments.filter((g) => g.category === "one_piece"),
  };

  const total = garments.length;
  const summaryText = StorageService.exportWardrobeAsText();

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-charcoal-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-cream-200 dark:border-charcoal-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-cream-200 dark:border-charcoal-800 flex items-center justify-between bg-cream-50/50 dark:bg-charcoal-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900/40 flex items-center justify-center text-sage-700 dark:text-sage-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-base sm:text-lg font-bold text-charcoal-900 dark:text-white leading-tight">
                Diagnóstico IMFTOK & Resumen
              </h3>
              <p className="text-[11px] text-charcoal-800/60 dark:text-zinc-400">
                Inventario cápsula & exportación de texto
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800 text-center">
              <span className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white block">
                {total}
              </span>
              <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Total Prendas
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800 text-center">
              <span className="text-xl sm:text-2xl font-black text-terracotta-500 block">
                {categories.top.length}
              </span>
              <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Superiores
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800 text-center">
              <span className="text-xl sm:text-2xl font-black text-sage-700 dark:text-sage-400 block">
                {categories.bottom.length}
              </span>
              <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Inferiores
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800 text-center">
              <span className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white block">
                {categories.footwear.length + categories.outerwear.length}
              </span>
              <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Calzado & Capas
              </span>
            </div>
          </div>

          {/* Capsule Balance Advice */}
          <div className="p-4 rounded-2xl bg-terracotta-50/50 dark:bg-terracotta-950/30 border border-terracotta-100 dark:border-terracotta-900/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-terracotta-500 shrink-0 mt-0.5" />
            <div className="text-xs text-charcoal-800/80 dark:text-zinc-300">
              <span className="font-bold text-charcoal-900 dark:text-white block mb-0.5">
                Proporción de Armario Cápsula
              </span>
              Tu código de bóveda para sincronizar en otros teléfonos es: <strong className="font-mono text-terracotta-500">{StorageService.getVaultId()}</strong>.
            </div>
          </div>

          {/* Export Text Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300">
                Lista Resumen Formateada (Para ChatGPT o Respaldo)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 text-xs font-bold transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "¡Copiado!" : "Copiar"}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={summaryText}
              rows={8}
              className="w-full p-3.5 rounded-2xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800 text-xs font-mono text-charcoal-800 dark:text-zinc-300 focus:outline-none select-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-cream-200 dark:border-charcoal-800 flex justify-end bg-cream-50/50 dark:bg-charcoal-950/50">
          <button
            type="button"
            onClick={onClose}
            className="bg-cream-200 dark:bg-charcoal-800 hover:bg-cream-300 text-charcoal-900 dark:text-white text-xs font-bold px-5 py-2 rounded-full"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
