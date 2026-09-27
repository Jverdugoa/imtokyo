import { SkinUndertone, Garment } from "@/types";

export interface ColorPaletteInfo {
  name: string;
  recommended: string[];
  neutrals: string[];
  avoid: string[];
  description: string;
}

export const UNDERTONE_PALETTES: Record<SkinUndertone, ColorPaletteInfo> = {
  warm: {
    name: "Paleta Cálida (Otoño / Primavera)",
    recommended: ["#C86D51", "#D97706", "#65A30D", "#B45309", "#059669", "#E11D48"],
    neutrals: ["#F5F2EB", "#DDD4C0", "#78350F", "#451A03", "#713F12"],
    avoid: ["#93C5FD", "#F3E8FF", "#000000"],
    description: "Tonos tierra, camel, verde oliva, terracota, mostaza, dorado y blanco cálido (marfil).",
  },
  cool: {
    name: "Paleta Fría (Invierno / Verano)",
    recommended: ["#2563EB", "#7C3AED", "#BE185D", "#0D9488", "#4338CA", "#0284C7"],
    neutrals: ["#FFFFFF", "#1E293B", "#64748B", "#0F172A", "#334155"],
    avoid: ["#F59E0B", "#EA580C", "#84CC16"],
    description: "Azules profundos, esmeralda, buganvilla, blanco puro, gris grafito, negro y plateados.",
  },
  neutral: {
    name: "Paleta Neutra Equilibrada",
    recommended: ["#0F766E", "#BE123C", "#1D4ED8", "#D97706", "#6B8E78", "#9333EA"],
    neutrals: ["#F8FAFC", "#E2E8F0", "#334155", "#475569", "#E5E5E5"],
    avoid: ["Tonos extremadamente fluorescentes sin equilibrar"],
    description: "Gran versatilidad: verde salvia, azul marino, rosa empolvado, topo, crema y carbón.",
  },
};

export const COLOR_HEX_MAP: Record<string, string> = {
  negro: "#18181B",
  blanco: "#FFFFFF",
  "blanco marfil": "#FAF6EE",
  gris: "#71717A",
  "gris claro": "#D4D4D8",
  "gris carbón": "#27272A",
  "azul marino": "#1E3A8A",
  azul: "#2563EB",
  "azul cielo": "#7DD3FC",
  "azul índigo": "#1E293B",
  "azul rey": "#1D4ED8",
  beige: "#E5DCC5",
  arena: "#DDD4C0",
  crema: "#F5F2EB",
  camel: "#C19A6B",
  marrón: "#78350F",
  café: "#5A3825",
  chocolate: "#3E2723",
  terracota: "#C86D51",
  "verde oliva": "#65A30D",
  "verde militar": "#4D5D43",
  "verde salvia": "#84A98C",
  verde: "#16A34A",
  esmeralda: "#059669",
  rojo: "#DC2626",
  "rojo carmín": "#B91C1C",
  burdeos: "#881337",
  vino: "#721C24",
  mostaza: "#D97706",
  amarillo: "#FBBF24",
  naranja: "#EA580C",
  rosa: "#F472B6",
  "rosa palo": "#E2B6B5",
  lila: "#C084FC",
  morado: "#7C3AED",
  dorado: "#D4AF37",
  plateado: "#CBD5E1",
};

export const POPULAR_FASHION_COLORS = [
  { name: "Negro", hex: "#18181B" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Beige / Crema", hex: "#E5DCC5" },
  { name: "Azul Marino", hex: "#1E3A8A" },
  { name: "Azul Índigo / Mezclilla", hex: "#2563EB" },
  { name: "Gris Carbón", hex: "#3F3F46" },
  { name: "Camel / Tostado", hex: "#C19A6B" },
  { name: "Verde Oliva / Militar", hex: "#65A30D" },
  { name: "Verde Salvia", hex: "#84A98C" },
  { name: "Terracota / Óxido", hex: "#C86D51" },
  { name: "Café / Chocolate", hex: "#5A3825" },
  { name: "Vino / Burdeos", hex: "#881337" },
  { name: "Rojo", hex: "#DC2626" },
  { name: "Rosa Palo / Nude", hex: "#E2B6B5" },
  { name: "Celeste / Azul Cielo", hex: "#7DD3FC" },
  { name: "Mostaza", hex: "#D97706" },
];

export function getProportionTip(topSilhouette: string, bottomSilhouette: string): string {
  const topLoose = topSilhouette.toLowerCase().includes("oversize") || topSilhouette.toLowerCase().includes("holgado");
  const bottomLoose = bottomSilhouette.toLowerCase().includes("oversize") || bottomSilhouette.toLowerCase().includes("ancho") || bottomSilhouette.toLowerCase().includes("wide");
  const topFitted = topSilhouette.toLowerCase().includes("slim") || topSilhouette.toLowerCase().includes("ajustado");
  const bottomFitted = bottomSilhouette.toLowerCase().includes("slim") || bottomSilhouette.toLowerCase().includes("ajustado") || bottomSilhouette.toLowerCase().includes("pitillo");

  if (topLoose && bottomFitted) {
    return "Contraste de siluetas: Top holgado con parte inferior estructurada crea un balance estilizado y moderno.";
  }
  if (topFitted && bottomLoose) {
    return "Regla de tercios: Prenda superior ceñida con pantalón fluido alarga la silueta y define el talle.";
  }
  if (topLoose && bottomLoose) {
    return "Streetwear / Relaxed Chic: Mete un poco de la parte frontal del top (french tuck) para no perder proporción de cintura.";
  }
  return "Equilibrio clásico: Proporción 1:2 visualmente balanceada y pulcra.";
}

export function checkSandwichRule(top: Garment, shoes?: Garment): string | null {
  if (!shoes) return null;
  const topColors = top.primaryColors.map((c) => c.toLowerCase());
  const shoeColors = shoes.primaryColors.map((c) => c.toLowerCase());
  
  const matches = topColors.some((c) => shoeColors.includes(c));
  if (matches) {
    return "Regla del Sándwich lograda: El color del calzado replica el color superior, unificando todo el look con armonía visual.";
  }
  return null;
}
