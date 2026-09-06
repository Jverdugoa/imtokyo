"use client";

import React from "react";
import { Garment } from "@/types";
import { Trash2, Plus, Tag } from "lucide-react";

interface GarmentCardProps {
  garment: Garment;
  onDelete: (id: string) => void;
  onIncrementWear: (garment: Garment) => void;
  onSelect?: (garment: Garment) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  top: "Superior",
  bottom: "Inferior",
  footwear: "Calzado",
  outerwear: "Abrigo",
  accessory: "Accesorio",
  one_piece: "Enterizo",
};

export const GarmentCard: React.FC<GarmentCardProps> = ({
  garment,
  onDelete,
  onIncrementWear,
  onSelect,
}) => {
  const formalityLabels: Record<number, string> = {
    1: "Muy Casual",
    2: "Casual",
    3: "Smart Casual",
    4: "Semiformal",
    5: "Formal",
  };

  return (
    <div className="group bg-white dark:bg-charcoal-900 rounded-2xl overflow-hidden border border-cream-200 dark:border-charcoal-800 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between">
      {/* Image Container */}
      <div 
        onClick={() => onSelect?.(garment)}
        className="relative aspect-[4/5] w-full bg-cream-100 dark:bg-charcoal-800 overflow-hidden cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={garment.imageUrl}
          alt={garment.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 bg-charcoal-950/80 dark:bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {CATEGORY_NAMES[garment.category] || garment.category}
        </div>

        {/* Formality Badge */}
        <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md text-charcoal-900 dark:text-zinc-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cream-200 dark:border-charcoal-700">
          {formalityLabels[garment.formalityLevel] || `Nivel ${garment.formalityLevel}`}
        </div>

        {/* Floating Quick Action Overlay */}
        <div className="absolute inset-0 bg-charcoal-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5 sm:p-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIncrementWear(garment);
            }}
            title="Registrar uso de hoy"
            className="bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-terracotta-500" />
            <span>Usado ({garment.wearCount})</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`¿Eliminar "${garment.name}" de tu guardarropa?`)) {
                onDelete(garment.id);
              }
            }}
            title="Eliminar prenda"
            className="p-1.5 bg-white/90 dark:bg-charcoal-800/90 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shadow-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-sans text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white leading-snug line-clamp-1">
            {garment.name}
          </h4>

          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-charcoal-800/60 dark:text-zinc-400">
            <span>{garment.subcategory}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="truncate">{garment.silhouette}</span>
          </div>
        </div>

        {/* Colors & Tags */}
        <div className="pt-2 border-t border-cream-100 dark:border-charcoal-800 flex items-center justify-between gap-1.5">
          {/* Color Dots */}
          <div className="flex items-center gap-1">
            {(garment.colorHexes || []).slice(0, 3).map((hex, i) => (
              <div
                key={i}
                title={garment.primaryColors[i] || hex}
                className="w-3 h-3 rounded-full border border-black/15 dark:border-white/20 shadow-2xs"
                style={{ backgroundColor: hex }}
              />
            ))}
            <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 ml-0.5 truncate max-w-[70px]">
              {garment.primaryColors.join(", ")}
            </span>
          </div>

          {/* Season Tag */}
          <div className="flex items-center gap-1 text-[10px] text-charcoal-800/60 dark:text-zinc-400 bg-cream-100 dark:bg-charcoal-800 px-1.5 py-0.5 rounded-md">
            <Tag className="w-2.5 h-2.5 text-terracotta-500" />
            <span className="capitalize">{garment.seasons[0] || "Todas"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
