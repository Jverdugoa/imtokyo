"use client";

import React, { useState, useMemo } from "react";
import { Garment, Season } from "@/types";
import { GarmentCard } from "./GarmentCard";
import { Plus, Search, Cloud, RefreshCw, Sparkles, Shirt, Check } from "lucide-react";

interface ClosetViewProps {
  garments: Garment[];
  onOpenUpload: () => void;
  onDeleteGarment: (id: string) => void;
  onIncrementWear: (garment: Garment) => void;
  vaultId: string;
  onSyncCloud: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime?: string | null;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "top", label: "Superiores" },
  { id: "bottom", label: "Inferiores" },
  { id: "outerwear", label: "Abrigos" },
  { id: "footwear", label: "Calzado" },
  { id: "accessory", label: "Accesorios" },
  { id: "one_piece", label: "Enterizos" },
];

export const ClosetView: React.FC<ClosetViewProps> = ({
  garments,
  onOpenUpload,
  onDeleteGarment,
  onIncrementWear,
  vaultId,
  onSyncCloud,
  isSyncing,
  lastSyncTime,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredGarments = useMemo(() => {
    return garments.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Season filter
      if (selectedSeason !== "all" && !item.seasons.includes(selectedSeason as Season) && !item.seasons.includes("todas")) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSub = item.subcategory.toLowerCase().includes(q);
        const matchesColor = item.primaryColors.some((c) => c.toLowerCase().includes(q));
        const matchesTag = item.aiTags?.some((t) => t.toLowerCase().includes(q));
        return matchesName || matchesSub || matchesColor || matchesTag;
      }
      return true;
    });
  }, [garments, selectedCategory, selectedSeason, searchQuery]);

  return (
    <div className="space-y-6 pb-20 sm:pb-16">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-charcoal-900 p-5 sm:p-7 rounded-3xl border border-cream-200 dark:border-charcoal-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-terracotta-500">
              IMFTOK • Tokyo Digital Wardrobe
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300 font-mono">
              Bóveda: {vaultId}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-sans font-black text-charcoal-900 dark:text-white leading-tight">
            Guardarropa ({garments.length} piezas)
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-800/60 dark:text-zinc-400 mt-1">
            Organiza tus fotos, consulta combinaciones y sincroniza entre tu móvil y ordenador.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSyncCloud}
            disabled={isSyncing}
            title="Sincronizar todo a la nube para restaurarlo en otro dispositivo"
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-full bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 text-charcoal-900 dark:text-zinc-200 text-xs font-semibold border border-cream-200 dark:border-charcoal-700 transition-all active:scale-95"
          >
            <Cloud className={`w-3.5 h-3.5 text-terracotta-500 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Sincronizando..." : "Sincronizar Nube"}</span>
            <span className="sm:hidden">{isSyncing ? "..." : "Sincronizar"}</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center justify-center gap-2 bg-charcoal-900 dark:bg-white hover:bg-charcoal-800 dark:hover:bg-zinc-200 text-white dark:text-charcoal-950 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-terracotta-500 dark:text-terracotta-600" />
            <span>Subir Prenda</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3.5">
        {/* Category Pills (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = cat.id === "all" ? garments.length : garments.filter((g) => g.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 shadow-sm"
                    : "bg-white dark:bg-charcoal-900 text-charcoal-800/80 dark:text-zinc-300 hover:bg-cream-100 dark:hover:bg-charcoal-800 border border-cream-200 dark:border-charcoal-800"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected 
                    ? "bg-charcoal-800 dark:bg-zinc-200 text-cream-100 dark:text-charcoal-900" 
                    : "bg-cream-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-zinc-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Season Dropdown */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-800/40 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar prenda por nombre, color o corte (ej: beige, lino, slim)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-800 text-xs sm:text-sm text-charcoal-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-white dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-800 text-xs sm:text-sm text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
            >
              <option value="all">Todas las Temporadas</option>
              <option value="primavera">Primavera</option>
              <option value="verano">Verano</option>
              <option value="otono">Otoño</option>
              <option value="invierno">Invierno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Garments Grid */}
      {filteredGarments.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-6">
          {/* Quick Add Card */}
          <div
            onClick={onOpenUpload}
            className="aspect-[4/5] rounded-2xl border-2 border-dashed border-cream-300 dark:border-charcoal-700 hover:border-terracotta-500 bg-cream-50/40 dark:bg-charcoal-950/40 hover:bg-terracotta-50/20 dark:hover:bg-terracotta-950/20 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-cream-200 dark:bg-charcoal-800 group-hover:bg-terracotta-100 dark:group-hover:bg-terracotta-900/40 flex items-center justify-center text-charcoal-800 dark:text-zinc-300 group-hover:text-terracotta-500 transition-colors mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-charcoal-900 dark:text-white group-hover:text-terracotta-500 transition-colors">
              Añadir Prenda
            </span>
            <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 mt-0.5">
              Cámara o galería
            </span>
          </div>

          {filteredGarments.map((garment) => (
            <GarmentCard
              key={garment.id}
              garment={garment}
              onDelete={onDeleteGarment}
              onIncrementWear={onIncrementWear}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-10 text-center border border-cream-200 dark:border-charcoal-800 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-cream-100 dark:bg-charcoal-800 flex items-center justify-center mx-auto text-charcoal-800/40 dark:text-zinc-500">
            <Shirt className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-charcoal-900 dark:text-white">
              No se encontraron prendas
            </h3>
            <p className="text-xs text-charcoal-800/60 dark:text-zinc-400 mt-1">
              Prueba ajustando los filtros o sube tu primera foto de ropa.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold px-5 py-2.5 rounded-full"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Prenda Ahora</span>
          </button>
        </div>
      )}
    </div>
  );
};
