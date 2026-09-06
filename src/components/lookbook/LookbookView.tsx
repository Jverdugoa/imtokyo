"use client";

import React, { useState } from "react";
import { Outfit } from "@/types";
import { OutfitCard } from "../stylist/OutfitCard";
import { BookOpen, Bookmark, Sparkles, Wand2 } from "lucide-react";

interface LookbookViewProps {
  outfits: Outfit[];
  onToggleFavorite: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onNavigateToStylist: () => void;
}

export const LookbookView: React.FC<LookbookViewProps> = ({
  outfits,
  onToggleFavorite,
  onRate,
  onNavigateToStylist,
}) => {
  const [filterFavorites, setFilterFavorites] = useState(false);

  const displayedOutfits = filterFavorites
    ? outfits.filter((o) => o.isFavorite)
    : outfits;

  return (
    <div className="space-y-6 pb-20 sm:pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-charcoal-900 p-5 sm:p-8 rounded-3xl border border-cream-200 dark:border-charcoal-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-terracotta-500 block mb-1">
            IMFTOK Colección & Archivo
          </span>
          <h1 className="text-xl sm:text-3xl font-sans font-black text-charcoal-900 dark:text-white leading-tight">
            Lookbook Personal ({outfits.length} looks)
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-800/60 dark:text-zinc-400 mt-1">
            Revisa tus combinaciones guardadas, califícalas y planifica tus atuendos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
              filterFavorites
                ? "bg-terracotta-500 text-white shadow-xs"
                : "bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-zinc-300 border border-cream-200 dark:border-charcoal-700"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={filterFavorites ? "currentColor" : "none"} />
            <span>Favoritos</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToStylist}
            className="flex items-center gap-1.5 bg-charcoal-900 dark:bg-white hover:bg-charcoal-800 text-white dark:text-charcoal-950 px-4 py-2.5 rounded-full text-xs font-bold shadow-xs"
          >
            <Wand2 className="w-3.5 h-3.5 text-terracotta-500 dark:text-terracotta-600" />
            <span>Crear Look</span>
          </button>
        </div>
      </div>

      {/* Outfits Grid */}
      {displayedOutfits.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          {displayedOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              onToggleFavorite={onToggleFavorite}
              onRate={onRate}
              isSaved={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-10 text-center border border-cream-200 dark:border-charcoal-800 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-cream-100 dark:bg-charcoal-800 flex items-center justify-center mx-auto text-charcoal-800/40 dark:text-zinc-500">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-charcoal-900 dark:text-white">
              {filterFavorites ? "No tienes looks marcados como favoritos" : "Tu Lookbook está vacío"}
            </h3>
            <p className="text-xs text-charcoal-800/60 dark:text-zinc-400 mt-1">
              Genera nuevas combinaciones con el Estilista IA y guárdalas aquí.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToStylist}
            className="inline-flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold px-5 py-2.5 rounded-full"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar un Look</span>
          </button>
        </div>
      )}
    </div>
  );
};
