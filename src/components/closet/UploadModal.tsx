"use client";

import React, { useState, useRef } from "react";
import { Garment, GarmentCategory, Season, AIConfig } from "@/types";
import { AIStylistService } from "@/lib/ai-stylist";
import { COLOR_HEX_MAP, POPULAR_FASHION_COLORS } from "@/lib/color-theory";
import { compressImage, samplePixelFromImage } from "@/lib/image-utils";
import { X, UploadCloud, Camera, Sparkles, Loader2, Check, Tag, Image as ImageIcon, Pipette, RefreshCw } from "lucide-react";

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
  const [isScanning, setIsScanning] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [eyedropperActive, setEyedropperActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form Fields (Auto-filled by AI)
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GarmentCategory>("top");
  const [subcategory, setSubcategory] = useState("Playera");
  const [primaryColors, setPrimaryColors] = useState<string[]>(["Negro"]);
  const [colorHexes, setColorHexes] = useState<string[]>(["#18181B"]);
  const [pattern, setPattern] = useState("Liso / Sólido");
  const [silhouette, setSilhouette] = useState("Corte Recto");
  const [formalityLevel, setFormalityLevel] = useState<number>(2);
  const [seasons, setSeasons] = useState<Season[]>(["todas"]);
  const [brandOrNotes, setBrandOrNotes] = useState("");
  const [aiTags, setAiTags] = useState<string[]>(["IMFTOK", "Básico"]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    try {
      setIsScanning(true);
      setAnalysisStep("Optimizando foto del móvil...");
      
      const compressed = await compressImage(file, 900, 1100, 0.82);
      setImagePreview(compressed);
      
      setAnalysisStep("Identificando colorimetría, tejido y silueta...");
      const result = await AIStylistService.analyzeGarmentImage(compressed, aiConfig);

      if (result) {
        setName(result.name || "Prenda Nueva");
        setCategory(result.category || "top");
        setSubcategory(result.subcategory || "Prenda");
        const detectedColors = result.primaryColors?.length ? result.primaryColors : ["Negro"];
        const detectedHexes = result.colorHexes?.length ? result.colorHexes : ["#18181B"];
        setPrimaryColors(detectedColors);
        setColorHexes(detectedHexes);
        setPattern(result.pattern || "Liso / Sólido");
        setSilhouette(result.silhouette || "Corte Recto");
        setFormalityLevel(result.formalityLevel || 2);
        setSeasons(result.seasons?.length ? result.seasons : ["todas"]);
        setAiTags(result.aiTags?.length ? result.aiTags : ["IMFTOK"]);
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
    } finally {
      setIsScanning(false);
      setAnalysisStep("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSelectQuickColor = (colorName: string, hex: string) => {
    if (primaryColors.includes(colorName)) {
      if (primaryColors.length > 1) {
        const idx = primaryColors.indexOf(colorName);
        setPrimaryColors(primaryColors.filter((c) => c !== colorName));
        setColorHexes(colorHexes.filter((_, i) => i !== idx));
      }
    } else {
      setPrimaryColors([colorName, ...primaryColors.slice(0, 1)]);
      setColorHexes([hex, ...colorHexes.slice(0, 1)]);
    }
  };

  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!eyedropperActive || !imagePreview) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    const sampled = await samplePixelFromImage(imagePreview, xRatio, yRatio);
    setPrimaryColors([sampled.colorName]);
    setColorHexes([sampled.hex]);
    setEyedropperActive(false);
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
      alert("Por favor toma o sube una foto primero.");
      return;
    }
    if (!name.trim()) {
      alert("Por favor confirma el nombre de tu prenda.");
      return;
    }

    const newGarment: Garment = {
      id: `garment-${Date.now()}`,
      name: name.trim(),
      imageUrl: imagePreview,
      category,
      subcategory: subcategory.trim() || "Prenda",
      primaryColors,
      colorHexes: colorHexes.length > 0 ? colorHexes : ["#18181B"],
      pattern,
      silhouette,
      seasons,
      formalityLevel,
      material: brandOrNotes.trim() || undefined,
      notes: brandOrNotes.trim() || undefined,
      aiTags: [...aiTags, ...(brandOrNotes ? [brandOrNotes] : [])],
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
    setPrimaryColors(["Negro"]);
    setColorHexes(["#18181B"]);
    setBrandOrNotes("");
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-charcoal-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-charcoal-900 w-full max-w-xl h-[95dvh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-cream-200 dark:border-charcoal-800 overflow-hidden flex flex-col animate-slideUpMobile sm:animate-fadeIn">
        {/* Mobile Grab Bar */}
        <div className="sm:hidden w-12 h-1.5 bg-cream-300 dark:bg-charcoal-700 rounded-full mx-auto mt-2 mb-1" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-cream-200 dark:border-charcoal-800 flex items-center justify-between bg-cream-50/50 dark:bg-charcoal-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terracotta-50 dark:bg-terracotta-900/30 flex items-center justify-center text-terracotta-500">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-sm sm:text-base font-black text-charcoal-900 dark:text-white leading-tight">
                {imagePreview ? "Prenda Analizada" : "Añadir Prenda con IA"}
              </h3>
              <p className="text-[10px] text-charcoal-800/60 dark:text-zinc-400">
                {imagePreview ? "Auto-llenado por IA listo para guardar" : "Toma una foto y la IA extrae color y corte"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream-200 dark:hover:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: If No Image Uploaded Yet */}
          {!imagePreview ? (
            <div className="space-y-4 text-center py-4 sm:py-8">
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

              <div className="w-16 h-16 rounded-3xl bg-terracotta-50 dark:bg-terracotta-950/40 border border-terracotta-200 dark:border-terracotta-900/50 flex items-center justify-center mx-auto text-terracotta-500 shadow-glow">
                <Camera className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-black text-charcoal-900 dark:text-white">
                  Toma una foto a tu prenda
                </h4>
                <p className="text-xs text-charcoal-800/60 dark:text-zinc-400 max-w-xs mx-auto mt-1">
                  La IA detecta automáticamente el color real (incluso con flash), la categoría y el corte.
                </p>
              </div>

              {/* Big Touch Friendly Buttons */}
              <div className="space-y-2.5 max-w-xs mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-bold shadow-md active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span>Tomar Foto con Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-cream-100 dark:bg-charcoal-800 hover:bg-cream-200 text-charcoal-900 dark:text-zinc-200 text-xs font-bold border border-cream-200 dark:border-charcoal-700 active:scale-95 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Elegir de Galería / Archivo</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Photo Uploaded & AI Auto-Filled */
            <div className="space-y-4 animate-fadeIn">
              {/* Image Preview + AI Scanning Badge */}
              <div className="relative bg-cream-50 dark:bg-charcoal-950 rounded-2xl p-3 border border-cream-200 dark:border-charcoal-800 flex gap-3.5 items-center">
                <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-cream-200 dark:bg-charcoal-800 shrink-0 border border-black/10 dark:border-white/10 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Prenda"
                    onClick={handleImageClick}
                    className={`w-full h-full object-cover ${eyedropperActive ? "cursor-crosshair ring-2 ring-terracotta-500" : ""}`}
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-1 text-center">
                      <Loader2 className="w-4 h-4 animate-spin text-terracotta-500 mb-0.5" />
                      <span className="text-[8px] font-bold">Escaneando...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta-500">
                      {isScanning ? "Procesando con IA..." : "✨ Auto-identificado"}
                    </span>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-[11px] text-zinc-500 hover:text-terracotta-500 font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Cambiar</span>
                    </button>
                  </div>

                  {/* Editable Name Field */}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre de la prenda"
                    className="w-full font-sans font-bold text-xs sm:text-sm bg-white dark:bg-charcoal-900 border border-cream-200 dark:border-charcoal-700 rounded-xl px-2.5 py-1.5 text-charcoal-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  />
                  <p className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 truncate">
                    {isScanning ? analysisStep : `${subcategory} • ${silhouette}`}
                  </p>
                </div>
              </div>

              {/* 1-Tap Category Selector Pills */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-400 mb-1.5">
                  Categoría
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { id: "top", label: "Superior" },
                    { id: "bottom", label: "Inferior" },
                    { id: "outerwear", label: "Abrigo" },
                    { id: "footwear", label: "Calzado" },
                    { id: "accessory", label: "Accesorio" },
                    { id: "one_piece", label: "Enterizo" },
                  ].map((cat) => {
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as GarmentCategory)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                          active
                            ? "bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 shadow-xs"
                            : "bg-cream-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300 hover:bg-cream-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-detected Colors + 1-Tap Quick Swatches */}
              <div className="p-3 bg-cream-50/60 dark:bg-charcoal-950/60 rounded-2xl border border-cream-200 dark:border-charcoal-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-300">
                      Color Principal Detectado:
                    </span>
                    <span className="text-xs font-bold text-terracotta-500">
                      {primaryColors.join(" / ")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEyedropperActive(!eyedropperActive)}
                    title="Toca la foto para extraer el color exacto"
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                      eyedropperActive
                        ? "bg-terracotta-500 text-white shadow-xs"
                        : "bg-cream-200 dark:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300"
                    }`}
                  >
                    <Pipette className="w-3 h-3" />
                    <span className="text-[10px]">Gotero</span>
                  </button>
                </div>

                {eyedropperActive && (
                  <p className="text-[10px] text-terracotta-500 font-bold bg-terracotta-50 dark:bg-terracotta-950/50 p-1.5 rounded-lg text-center animate-fadeIn">
                    👈 Toca cualquier punto en la foto de la prenda para capturar su color exacto
                  </p>
                )}

                {/* 1-Tap Color Swatches Palette */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {POPULAR_FASHION_COLORS.map((col) => {
                    const isSelected = primaryColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => handleSelectQuickColor(col.name, col.hex)}
                        title={col.name}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all border ${
                          isSelected
                            ? "bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 border-charcoal-900 shadow-xs"
                            : "bg-white dark:bg-charcoal-900 text-charcoal-800 dark:text-zinc-300 border-cream-200 dark:border-charcoal-700"
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional: Brand / Details */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-400 mb-1">
                    Marca / Notas (Opcional)
                  </label>
                  <input
                    type="text"
                    value={brandOrNotes}
                    onChange={(e) => setBrandOrNotes(e.target.value)}
                    placeholder="ej: Zara, Nike, Uniqlo..."
                    className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-800 dark:text-zinc-400 mb-1">
                    Silueta
                  </label>
                  <select
                    value={silhouette}
                    onChange={(e) => setSilhouette(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-cream-50 dark:bg-charcoal-950 border border-cream-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs focus:outline-none"
                  >
                    <option value="Ajustado / Slim">Slim / Ajustado</option>
                    <option value="Corte Recto">Corte Recto</option>
                    <option value="Holgado / Oversized">Oversized</option>
                    <option value="Tiro Alto">Tiro Alto</option>
                    <option value="Cropped">Cropped</option>
                    <option value="Fluido / Suelto">Fluido</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action */}
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
            disabled={!imagePreview || isScanning}
            onClick={handleSave}
            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white text-xs sm:text-sm font-black px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Guardar en mi Armario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
