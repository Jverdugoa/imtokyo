"use client";

import React, { useState } from "react";
import { Outfit } from "@/types";
import { Sparkles, Bookmark, Check, Star, Lightbulb, ShoppingBag } from "lucide-react";
import confetti from "canvas-confetti";

interface OutfitCardProps {
  outfit: Outfit;
  onToggleFavorite: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onSaveToLookbook?: (outfit: Outfit) => void;
  isSaved?: boolean;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onToggleFavorite,
  onRate,
  onSaveToLookbook,
  isSaved = false,
}) => {
  const [savedLocally, setSavedLocally] = useState(isSaved);

  const handleSave = () => {
    setSavedLocally(true);
    onSaveToLookbook?.(outfit);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#C86D51", "#E5DCC5", "#6B8E78", "#FF3366"],
    });
  };

  return (
    <div className="bg-white dark:bg-charcoal-900 rounded-3xl overflow-hidden border border-cream-200 dark:border-charcoal-800 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between">
      {/* Header Info */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-cream-100 dark:border-charcoal-800 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-terracotta-50 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400 border border-terracotta-100 dark:border-terracotta-900/50">
              {outfit.occasion}
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-cream-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300">
              {outfit.weather}
            </span>
            {outfit.colorHarmonyType && (
              <span className="text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400">
                {outfit.colorHarmonyType}
              </span>
            )}
          </div>
          <h3 className="font-sans text-base sm:text-xl font-black text-charcoal-900 dark:text-white leading-snug">
            {outfit.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(outfit.id)}
          className={`p-2 sm:p-2.5 rounded-full transition-colors ${
            outfit.isFavorite
              ? "bg-terracotta-500 text-white shadow-xs"
              : "bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-zinc-300"
          }`}
          title="Marcar como favorito"
        >
          <Bookmark className="w-4 h-4" fill={outfit.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Visual Collage of Outfit Items */}
      <div className="p-4 sm:p-6 bg-cream-50/50 dark:bg-charcoal-950/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-800/60 dark:text-zinc-400 block mb-2.5">
          Prendas Coordinadas ({outfit.items.length}):
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {outfit.items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-charcoal-900 rounded-2xl overflow-hidden border border-cream-200 dark:border-charcoal-800 shadow-2xs group flex flex-col"
            >
              <div className="aspect-[4/5] bg-cream-100 dark:bg-charcoal-800 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                  {item.category}
                </div>
              </div>
              <div className="p-2 text-center bg-white dark:bg-charcoal-900 flex-1 flex flex-col justify-center">
                <span className="text-xs font-bold text-charcoal-900 dark:text-white line-clamp-1">
                  {item.name}
                </span>
                <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 capitalize truncate">
                  {item.primaryColors.join(", ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stylist Rationale & Advice */}
      <div className="p-4 sm:p-6 space-y-3.5 flex-1">
        {/* Por qué funciona */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-terracotta-600 dark:text-terracotta-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Por qué funciona este look</span>
          </div>
          <p className="text-xs text-charcoal-800/80 dark:text-zinc-300 leading-relaxed">
            {outfit.stylistRationale}
          </p>
        </div>

        {/* Trucos de Estilismo */}
        {outfit.stylingTips && outfit.stylingTips.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-400">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Consejos de Estilista</span>
            </div>
            <ul className="space-y-0.5 pl-1">
              {outfit.stylingTips.map((tip, idx) => (
                <li key={idx} className="text-xs text-charcoal-800/70 dark:text-zinc-400 flex items-start gap-1.5">
                  <span className="text-terracotta-500 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prenda Faltante Opcional */}
        {outfit.missingPieceSuggestion && (
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-900 dark:text-amber-200">
              <span className="font-bold block">
                Complemento Recomendado: {outfit.missingPieceSuggestion.name}
              </span>
              {outfit.missingPieceSuggestion.reason}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions & Rating */}
      <div className="px-4 sm:px-6 py-3.5 border-t border-cream-200 dark:border-charcoal-800 bg-cream-50/40 dark:bg-charcoal-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-charcoal-800/60 dark:text-zinc-400 mr-1 font-medium">Calificar:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRate(outfit.id, star)}
              className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
            >
              <Star
                className="w-3.5 h-3.5"
                fill={(outfit.rating || 5) >= star ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>

        {/* Save to Lookbook */}
        {onSaveToLookbook && (
          <button
            type="button"
            onClick={handleSave}
            disabled={savedLocally}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              savedLocally
                ? "bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 border border-sage-200 dark:border-sage-800"
                : "bg-charcoal-900 dark:bg-white hover:bg-charcoal-800 text-white dark:text-charcoal-950 shadow-xs"
            }`}
          >
            {savedLocally ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{savedLocally ? "Guardado en Lookbook" : "Guardar Look"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
