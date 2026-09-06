"use client";

import React, { useState } from "react";
import { Garment, UserProfile, Outfit, AIConfig } from "@/types";
import { AIStylistService } from "@/lib/ai-stylist";
import { OutfitCard } from "./OutfitCard";
import { Wand2, Sparkles, Sun, CloudRain, Snowflake, CloudSun, Briefcase, Heart, PartyPopper, Coffee, Dumbbell, Plane, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface OutfitGeneratorProps {
  garments: Garment[];
  profile: UserProfile;
  aiConfig: AIConfig;
  onSaveToLookbook: (outfit: Outfit) => void;
  onToggleFavorite: (id: string) => void;
  onRate: (id: string, rating: number) => void;
}

export const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({
  garments,
  profile,
  aiConfig,
  onSaveToLookbook,
  onToggleFavorite,
  onRate,
}) => {
  const [occasion, setOccasion] = useState<string>("Oficina / Trabajo Smart Casual");
  const [weather, setWeather] = useState<string>("Templado (Primavera / Otoño)");
  const [vibe, setVibe] = useState<string>("Elegante & Sofisticado");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [loadingPhase, setLoadingPhase] = useState<string>("");

  const occasions = [
    { id: "Oficina / Trabajo Smart Casual", label: "Oficina / Trabajo", icon: Briefcase },
    { id: "Cita Romántica / Cena Especial", label: "Cita / Cena", icon: Heart },
    { id: "Salida Nocturna / Fiesta", label: "Fiesta / Noche", icon: PartyPopper },
    { id: "Fin de Semana Casual / Brunch", label: "Casual / Brunch", icon: Coffee },
    { id: "Gimnasio / Actividad Física", label: "Deporte / Gym", icon: Dumbbell },
    { id: "Viaje / Aeropuerto Cómodo", label: "Viaje / Aeropuerto", icon: Plane },
  ];

  const weatherOptions = [
    { id: "Cálido / Verano (24°C - 32°C)", label: "Cálido ☀️", icon: Sun },
    { id: "Templado (Primavera / Otoño)", label: "Templado ⛅", icon: CloudSun },
    { id: "Frío / Invierno (5°C - 15°C)", label: "Frío ❄️", icon: Snowflake },
    { id: "Lluvioso / Clima Inestable", label: "Lluvia 🌧️", icon: CloudRain },
  ];

  const vibeOptions = [
    "Elegante & Sofisticado",
    "Casual Chic Tokyo",
    "Minimalista Pulcro",
    "Old Money / Clásico",
    "Streetwear Vanguardista",
  ];

  const handleGenerate = async () => {
    if (garments.length < 2) {
      alert("Por favor registra al menos 2 prendas (un top y un bottom) para poder combinarlas.");
      return;
    }

    setIsGenerating(true);
    setLoadingPhase("Consultando prendas registradas y perfil IMFTOK...");

    try {
      setTimeout(() => setLoadingPhase("Aplicando reglas de colorimetría y regla 60-30-10..."), 600);
      setTimeout(() => setLoadingPhase("Balanceando proporciones de silueta y calzado..."), 1200);

      const outfits = await AIStylistService.generateOutfits({
        occasion,
        weather,
        vibe,
        profile,
        garments,
        config: aiConfig,
      });

      setGeneratedOutfits(outfits);

      if (outfits.length > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ["#C86D51", "#6B8E78", "#FAF8F5", "#FF3366"],
        });
      }
    } catch (err) {
      console.error("Outfit generation failed:", err);
    } finally {
      setIsGenerating(false);
      setLoadingPhase("");
    }
  };

  return (
    <div className="space-y-8 pb-20 sm:pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-charcoal-900 p-5 sm:p-8 rounded-3xl border border-cream-200 dark:border-charcoal-800 shadow-soft">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-terracotta-50 dark:bg-terracotta-900/30 flex items-center justify-center text-terracotta-500">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-sans font-black text-charcoal-900 dark:text-white leading-tight">
              Generador de Outfits & Estilista IA
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-800/60 dark:text-zinc-400">
              Combinaciones inteligentes basadas en tu guardarropa real, clima y ocasión
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="mt-6 sm:mt-8 space-y-6">
          {/* Occasion */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2.5">
              1. ¿Para qué ocasión necesitas vestir?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
              {occasions.map((occ) => {
                const Icon = occ.icon;
                const active = occasion === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setOccasion(occ.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      active
                        ? "border-terracotta-500 bg-terracotta-50/60 dark:bg-terracotta-950/40 ring-1 ring-terracotta-500 shadow-xs"
                        : "border-cream-200 dark:border-charcoal-800 bg-cream-50/50 dark:bg-charcoal-950/50 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${active ? "text-terracotta-500" : "text-charcoal-800/60 dark:text-zinc-400"}`} />
                    <span className="text-xs font-bold text-charcoal-900 dark:text-white leading-tight">
                      {occ.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weather & Vibe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Weather */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2.5">
                2. ¿Cómo estará el clima o temperatura?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {weatherOptions.map((w) => {
                  const active = weather === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWeather(w.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                        active
                          ? "border-charcoal-900 dark:border-white bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950"
                          : "border-cream-200 dark:border-charcoal-800 bg-cream-50 dark:bg-charcoal-950 hover:bg-cream-100 dark:hover:bg-charcoal-800 text-charcoal-900 dark:text-white"
                      }`}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vibe / Mood */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2.5">
                3. Intención de Estilo o Mood
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800 text-charcoal-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
              >
                {vibeOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-charcoal-800/60 dark:text-zinc-400 mt-2">
                🎨 Tu colorimetría activa: <strong>{profile.skinUndertone === "warm" ? "Cálida" : profile.skinUndertone === "cool" ? "Fría" : "Neutra"}</strong> ({profile.bodyType}).
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{loadingPhase || "Generando outfits..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-cream-100" />
                  <span>Generar 2-3 Combinaciones de Estilista</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Outfits Showcase */}
      {generatedOutfits.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-sans font-black text-charcoal-900 dark:text-white">
              Propuestas Creadas Para Ti ({generatedOutfits.length})
            </h2>
            <span className="text-xs text-charcoal-800/60 dark:text-zinc-400 font-medium">
              Basadas en tu armario real
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
            {generatedOutfits.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onToggleFavorite={onToggleFavorite}
                onRate={onRate}
                onSaveToLookbook={onSaveToLookbook}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
