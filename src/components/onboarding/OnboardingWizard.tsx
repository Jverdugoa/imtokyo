"use client";

import React, { useState } from "react";
import { UserProfile, SkinUndertone } from "@/types";
import { UNDERTONE_PALETTES } from "@/lib/color-theory";
import { Sparkles, Check, ArrowRight, ArrowLeft, Heart, EyeOff, ShoppingBag, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingWizardProps {
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const bodyTypes = [
    { id: "Reloj de arena / Proporcional", label: "Reloj de Arena", desc: "Hombros y caderas alineados con cintura definida" },
    { id: "Rectangular / Recto", label: "Rectangular", desc: "Silueta atlética y equilibrada con líneas rectas" },
    { id: "Triángulo / Pera", label: "Triángulo (Pera)", desc: "Caderas más amplias que los hombros" },
    { id: "Triángulo Invertido", label: "Triángulo Invertido", desc: "Hombros o espalda más anchos que las caderas" },
    { id: "Ovalado / Manzana", label: "Ovalado (Manzana)", desc: "Volumen concentrado en la zona media y torso" },
    { id: "Atlético / Musculado", label: "Atlético", desc: "Estructura definida y hombros marcados" },
  ];

  const styleOptions = [
    "Minimalista", "Smart Casual", "Old Money / Clásico", "Streetwear Tokyo", 
    "Casual Chic", "Boho / Relajado", "Elegante & Formal", "Vanguardista / Editorial", "Deportivo / Athleisure"
  ];

  const contextOptions = [
    "Oficina & Trabajo", "Universidad & Estudio", "Citas & Salidas con amigos", 
    "Eventos formales / Bodas", "Gimnasio & Deporte", "Viajes & Vacaciones", "Hogar / Home Office"
  ];

  const popularColors = [
    "Negro", "Blanco", "Beige", "Camel", "Azul Marino", "Gris", "Verde Oliva", 
    "Terracota", "Burdeos", "Marrón", "Celeste", "Rosa Empolvado", "Mostaza", "Verde Salvia"
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const updated = { ...profile, completedOnboarding: true };
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C86D51", "#6B8E78", "#E5DCC5", "#FF3366"],
      });
      onComplete(updated);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayItem = (field: "preferredStyles" | "frequentContexts" | "favoriteColors" | "avoidedColors", item: string) => {
    const current = profile[field] || [];
    if (current.includes(item)) {
      setProfile({ ...profile, [field]: current.filter((x) => x !== item) });
    } else {
      setProfile({ ...profile, [field]: [...current, item] });
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-6 pb-20 sm:pb-16">
      {/* Header Card */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-5 sm:p-10 shadow-card border border-cream-200 dark:border-charcoal-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-50 dark:bg-terracotta-900/30 flex items-center justify-center text-terracotta-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-sans font-black text-charcoal-900 dark:text-white">
                Diagnóstico de Estilo IMFTOK
              </h2>
              <p className="text-xs text-charcoal-800/60 dark:text-zinc-400">
                Silueta, colorimetría y preferencias
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-cream-100 dark:bg-charcoal-800 rounded-full text-charcoal-800 dark:text-zinc-300 border border-cream-200 dark:border-charcoal-700">
            Paso {step} de 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-cream-100 dark:bg-charcoal-800 h-2 rounded-full mb-6 sm:mb-8 overflow-hidden">
          <div
            className="bg-terracotta-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: Body Type & Identity */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm sm:text-lg font-sans font-bold text-charcoal-900 dark:text-white mb-1">
                1. ¿Cómo te defines y cuál es tu silueta?
              </h3>
              <p className="text-xs text-charcoal-800/70 dark:text-zinc-400 mb-3">
                El estilismo potencia tus proporciones naturales con cortes y balance armónico.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                  Nombre o cómo te llamamos
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                  Identidad / Género
                </label>
                <select
                  value={profile.genderIdentity}
                  onChange={(e) => setProfile({ ...profile, genderIdentity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                >
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="No binario / Andrógino">No binario / Andrógino</option>
                  <option value="Neutro / Libre">Neutro / Libre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2.5">
                Tipo de cuerpo o silueta aproximada
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {bodyTypes.map((b) => {
                  const isSelected = profile.bodyType === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setProfile({ ...profile, bodyType: b.id })}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/40 shadow-sm"
                          : "border-cream-200 dark:border-charcoal-800 bg-cream-50/40 dark:bg-charcoal-950/40 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white">{b.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-terracotta-500" />}
                      </div>
                      <p className="text-[11px] text-charcoal-800/70 dark:text-zinc-400">{b.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Colorimetry & Skin Undertone */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm sm:text-lg font-sans font-bold text-charcoal-900 dark:text-white mb-1">
                2. Colorimetría & Subtono de Piel
              </h3>
              <p className="text-xs text-charcoal-800/70 dark:text-zinc-400 mb-3">
                Tu subtono define los colores que iluminan tu rostro y los contrastes más favorecedores.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["warm", "cool", "neutral"] as SkinUndertone[]).map((type) => {
                const isSelected = profile.skinUndertone === type;
                const palette = UNDERTONE_PALETTES[type];
                return (
                  <div
                    key={type}
                    onClick={() => setProfile({ ...profile, skinUndertone: type })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-terracotta-500 bg-terracotta-50/40 dark:bg-terracotta-950/40 ring-1 ring-terracotta-500 shadow-sm"
                        : "border-cream-200 dark:border-charcoal-800 bg-cream-50/40 dark:bg-charcoal-950/40 hover:bg-cream-100 dark:hover:bg-charcoal-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs sm:text-sm font-bold capitalize text-charcoal-900 dark:text-white">
                          {type === "warm" ? "Cálido (Tierra)" : type === "cool" ? "Frío (Plata / Azul)" : "Neutro (Equilibrado)"}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-terracotta-500" />}
                      </div>
                      <p className="text-[11px] text-charcoal-800/70 dark:text-zinc-400 mb-2.5">{palette.description}</p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-800/60 dark:text-zinc-400 block mb-1">
                        Muestra de Colores:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {palette.recommended.slice(0, 5).map((hex, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shadow-xs"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-800 text-xs text-charcoal-800/80 dark:text-zinc-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sage-700 dark:text-sage-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-charcoal-900 dark:text-white mb-0.5">¿Cómo identificarlo?</span>
                Si las joyas doradas y la ropa beige te sientan mejor, es <strong>Cálido</strong>. Si el plateado, blanco puro y azul marino te favorecen más, es <strong>Frío</strong>. Si ambos te lucen bien, es <strong>Neutro</strong>.
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Styles & Frequent Contexts */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm sm:text-lg font-sans font-bold text-charcoal-900 dark:text-white mb-1">
                3. Estilos Preferidos & Contextos de Vida
              </h3>
              <p className="text-xs text-charcoal-800/70 dark:text-zinc-400 mb-3">
                Selecciona los estilos con los que más conectas y tus contextos diarios.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2">
                Estilos que te gustan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {styleOptions.map((opt) => {
                  const active = (profile.preferredStyles || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArrayItem("preferredStyles", opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? "bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 shadow-xs"
                          : "bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 text-charcoal-800 dark:text-zinc-300 border border-cream-200 dark:border-charcoal-700"
                      }`}
                    >
                      {opt} {active && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2">
                Contextos frecuentes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {contextOptions.map((ctx) => {
                  const active = (profile.frequentContexts || []).includes(ctx);
                  return (
                    <button
                      key={ctx}
                      type="button"
                      onClick={() => toggleArrayItem("frequentContexts", ctx)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? "bg-terracotta-500 text-white shadow-xs"
                          : "bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 text-charcoal-800 dark:text-zinc-300 border border-cream-200 dark:border-charcoal-700"
                      }`}
                    >
                      {ctx} {active && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Color Preferences */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm sm:text-lg font-sans font-bold text-charcoal-900 dark:text-white mb-1">
                4. Colores & Preferencias
              </h3>
              <p className="text-xs text-charcoal-800/70 dark:text-zinc-400 mb-3">
                Elige tus tonos predilectos y define si deseas sugerencias de compra.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2">
                <Heart className="w-3.5 h-3.5 text-terracotta-500" /> Colores Favoritos
              </label>
              <div className="flex flex-wrap gap-1.5">
                {popularColors.map((col) => {
                  const active = (profile.favoriteColors || []).includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleArrayItem("favoriteColors", col)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        active
                          ? "bg-sage-700 dark:bg-sage-600 text-white shadow-xs"
                          : "bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 text-charcoal-800 dark:text-zinc-300 border border-cream-200 dark:border-charcoal-700"
                      }`}
                    >
                      {col} {active && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2">
                <EyeOff className="w-3.5 h-3.5 text-charcoal-800/60 dark:text-zinc-500" /> Colores a Evitar
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Neón", "Morado eléctrico", "Amarillo brillante", "Naranja chillón", "Rosa fucsia", "Gris claro"].map((col) => {
                  const active = (profile.avoidedColors || []).includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleArrayItem("avoidedColors", col)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        active
                          ? "bg-charcoal-800 dark:bg-zinc-700 text-white line-through"
                          : "bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 text-charcoal-800 dark:text-zinc-300 border border-cream-200 dark:border-charcoal-700"
                      }`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-cream-200 dark:border-charcoal-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-2.5">
                ¿Cuál es tu enfoque de compras?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  onClick={() => setProfile({ ...profile, openToBuying: false })}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    !profile.openToBuying
                      ? "border-charcoal-900 dark:border-white bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950"
                      : "border-cream-200 dark:border-charcoal-800 bg-cream-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-white"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold block mb-0.5">Solo lo que tengo</span>
                  <p className="text-[11px] opacity-80">
                    Maximizar mis prendas actuales sin gastar en ropa nueva.
                  </p>
                </div>

                <div
                  onClick={() => setProfile({ ...profile, openToBuying: true })}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    profile.openToBuying
                      ? "border-terracotta-500 bg-terracotta-50 dark:bg-terracotta-950/40 text-charcoal-900 dark:text-white"
                      : "border-cream-200 dark:border-charcoal-800 bg-cream-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-terracotta-500" />
                    <span className="text-xs sm:text-sm font-bold">Sugerencias de compra</span>
                  </div>
                  <p className="text-[11px] opacity-80">
                    Sugerir prendas clave faltantes para completar mis looks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-cream-200 dark:border-charcoal-800">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 dark:text-zinc-300 hover:text-charcoal-900 px-3 py-2 rounded-full hover:bg-cream-100 dark:hover:bg-charcoal-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
            ) : onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-charcoal-800/60 dark:text-zinc-500 hover:text-charcoal-900 dark:hover:text-white px-3 py-1.5"
              >
                Omitir
              </button>
            ) : <div />}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-charcoal-900 dark:bg-white hover:bg-charcoal-800 text-white dark:text-charcoal-950 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
          >
            <span>{step === 4 ? "Completar Diagnóstico" : "Siguiente"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
