"use client";

import React, { useState, useRef } from "react";
import { Garment, GarmentCategory, Season, AIConfig } from "@/types";
import { AIStylistService } from "@/lib/ai-stylist";
import { COLOR_HEX_MAP } from "@/lib/color-theory";
import { compressImage } from "@/lib/image-utils";
import { X, UploadCloud, Camera, Sparkles, Loader2, Check, Tag, Image as ImageIcon } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (garment: Garment) => void;
  aiConfig: AIConfig;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  aiConfig,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GarmentCategory>("top");
  const [subcategory, setSubcategory] = useState("Camisa");
  const [primaryColors, setPrimaryColors] = useState<string[]>(["Blanco"]);
  const [colorInput, setColorInput] = useState("");
  const [pattern, setPattern] = useState("Liso / Sólido");
  const [silhouette, setSilhouette] = useState("Corte Recto");
  const [formalityLevel, setFormalityLevel] = useState<number>(3);
  const [seasons, setSeasons] = useState<Season[]>(["todas"]);
  const [aiTags, setAiTags] = useState<string[]>(["IMFTOK", "Básico"]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    try {
      setIsCompressing(true);
      setAnalysisStep("Optimizando imagen para móvil...");
      const compressed = await compressImage(file, 900, 1100, 0.82);
      setImagePreview(compressed);
      setIsCompressing(false);
      triggerAIAnalysis(compressed);
    } catch (err) {
      console.error("Error compressing image:", err);
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const triggerAIAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisStep("Analizando prenda, silueta y colorimetría...");

    try {
      const result = await AIStylistService.analyzeGarmentImage(imageDataUrl, aiConfig);

      if (result) {
        setName(result.name || "Prenda Nueva");
        setCategory(result.category || "top");
        setSubcategory(result.subcategory || "Prenda");
        setPrimaryColors(result.primaryColors?.length ? result.primaryColors : ["Neutro"]);
        setPattern(result.pattern || "Liso / Sólido");
        setSilhouette(result.silhouette || "Corte Recto");
        setFormalityLevel(result.formalityLevel || 3);
        setSeasons(result.seasons?.length ? result.seasons : ["todas"]);
        setAiTags(result.aiTags?.length ? result.aiTags : ["IMFTOK"]);
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !primaryColors.includes(colorInput.trim())) {
      setPrimaryColors([...primaryColors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const handleRemoveColor = (col: string) => {
    if (primaryColors.length > 1) {
      setPrimaryColors(primaryColors.filter((c) => c !== col));
    }
  };

  const toggleSeason = (season: Season) => {
    if (seasons.includes(season)) {
      if (seasons.length > 1) setSeasons(seasons.filter((s) => s !== season));
    } else {
      setSeasons([...seasons, season]);
    }
  };

  const handleSave = () => {
    if (!imagePreview) {
      alert("Por favor toma una foto o selecciona una imagen.");
      return;
    }
    if (!name.trim()) {
      alert("Por favor escribe un nombre para tu prenda.");
      return;
    }

    const hexes = primaryColors.map((c) => {
      const lower = c.toLowerCase().trim();
      return COLOR_HEX_MAP[lower] || "#71717A";
    });

    const newGarment: Garment = {
      id: `garment-${Date.now()}`,
      name: name.trim(),
      imageUrl: imagePreview,
      category,
      subcategory: subcategory.trim() || "Prenda",
      primaryColors,
      colorHexes: hexes,
      pattern,
      silhouette,
      seasons,
      formalityLevel,
      aiTags,
      createdAt: new Date().toISOString(),
      wearCount: 0,
    };

    onSave(newGarment);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setImagePreview(null);
    setName("");
    setPrimaryColors(["Blanco"]);
    setAiTags(["IMFTOK"]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-charcoal-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-charcoal-900 w-full max-w-2xl h-[95dvh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-cream-200 dark:border-charcoal-800 overflow-hidden flex flex-col animate-slideUpMobile sm:animate-fadeIn">
        {/* Mobile Grab Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-cream-300 dark:bg-charcoal-700 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-cream-200 dark:border-charcoal-800 flex items-center justify-between bg-cream-50/50 dark:bg-charcoal-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terracotta-50 dark:bg-terracotta-900/30 flex items-center justify-center text-terracotta-500">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-sm sm:text-base font-black text-charcoal-900 dark:text-white leading-tight">
                Registrar Prenda
              </h3>
              <p className="text-[10px] sm:text-xs text-charcoal-800/60 dark:text-zinc-400">
                IMFTOK Escáner IA de Ropa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 dark:hover:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Image Upload / Camera Box */}
          {!imagePreview ? (
            <div className="border-2 border-dashed border-cream-300 dark:border-charcoal-700 rounded-3xl p-5 sm:p-8 text-center bg-cream-50/40 dark:bg-charcoal-950/40">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="w-12 h-12 rounded-2xl bg-cream-100 dark:bg-charcoal-800 flex items-center justify-center mx-auto mb-2 text-terracotta-500">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white mb-1">
                Añade una foto de tu prenda
              </h4>
              <p className="text-[11px] text-charcoal-800/60 dark:text-zinc-400 max-w-sm mx-auto mb-3.5">
                Las fotos se comprimen automáticamente para no ocupar memoria.
              </p>

              {/* Action Buttons for Mobile Touch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tomar Foto con Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-charcoal-900 dark:bg-zinc-800 hover:bg-charcoal-800 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Elegir de Galería</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3.5 items-start bg-cream-50/60 dark:bg-charcoal-950/60 p-3.5 rounded-2xl border border-cream-200 dark:border-charcoal-800">
              <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-cream-200 dark:bg-charcoal-800 shrink-0 border border-black/10 dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Prenda"
                  className="w-full h-full object-cover"
                />
                {(isCompressing || isAnalyzing) && (
                  <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-terracotta-500 mb-1" />
                    <span className="text-[9px] font-bold">
                      {isCompressing ? "Optimizando..." : "Escaneando..."}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900 dark:text-zinc-200">
                    Foto Cargada
                  </span>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="text-xs text-terracotta-500 font-bold hover:underline"
                  >
                    Repetir foto
                  </button>
                </div>
                <p className="text-[11px] text-charcoal-800/70 dark:text-zinc-400 leading-tight">
                  {isAnalyzing
                    ? analysisStep
                    : "✨ Atributos extraídos automáticamente. Puedes editarlos abajo."}
                </p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                Nombre de la prenda
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Camisa blanca lino"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                >
                  <option value="top">Superior</option>
                  <option value="bottom">Inferior</option>
                  <option value="outerwear">Abrigo</option>
                  <option value="footwear">Calzado</option>
                  <option value="accessory">Accesorio</option>
                  <option value="one_piece">Enterizo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                  Corte / Tipo
                </label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="ej: Blazer, Jeans..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500"
                />
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                Colores
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {primaryColors.map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cream-100 dark:bg-charcoal-800 text-[11px] font-semibold text-charcoal-900 dark:text-white border border-cream-200 dark:border-charcoal-700"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20"
                      style={{ backgroundColor: COLOR_HEX_MAP[col.toLowerCase()] || "#888" }}
                    />
                    <span>{col}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(col)}
                      className="text-zinc-400 hover:text-red-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddColor())}
                  placeholder="Añadir color (ej: Beige, Azul)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-xs text-charcoal-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 rounded-xl bg-cream-200 dark:bg-charcoal-800 text-xs font-bold text-charcoal-900 dark:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Silhouette & Formality */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                  Silueta
                </label>
                <select
                  value={silhouette}
                  onChange={(e) => setSilhouette(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs focus:outline-none"
                >
                  <option value="Ajustado / Slim">Slim / Ajustado</option>
                  <option value="Corte Recto">Corte Recto</option>
                  <option value="Holgado / Oversized">Oversized</option>
                  <option value="Tiro Alto">Tiro Alto</option>
                  <option value="Cropped">Cropped</option>
                  <option value="Fluido / Suelto">Fluido</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1">
                  Formalidad: {formalityLevel}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formalityLevel}
                  onChange={(e) => setFormalityLevel(Number(e.target.value))}
                  className="w-full accent-terracotta-500 mt-1.5"
                />
              </div>
            </div>

            {/* Seasons */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300 mb-1.5">
                Temporada
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["primavera", "verano", "otono", "invierno", "todas"] as Season[]).map((s) => {
                  const active = seasons.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSeason(s)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                        active
                          ? "bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 font-bold"
                          : "bg-cream-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300"
                      }`}
                    >
                      {s} {active && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions (Always visible above mobile nav) */}
        <div className="px-4 sm:px-6 py-3 border-t border-cream-200 dark:border-charcoal-800 flex items-center justify-between bg-cream-50/90 dark:bg-charcoal-950/90 shrink-0 mobile-safe-bottom">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-charcoal-800 dark:text-zinc-400 px-3 py-2"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!imagePreview || isAnalyzing || isCompressing}
            onClick={handleSave}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Prenda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
