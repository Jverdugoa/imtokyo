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
  blanco: "#FFFFFF",
  negro: "#18181B",
  gris: "#71717A",
  azul: "#2563EB",
  marino: "#1E3A8A",
  celeste: "#7DD3FC",
  beige: "#E5DCC5",
  camel: "#C19A6B",
  marron: "#78350F",
  verde: "#16A34A",
  oliva: "#65A30D",
  salvia: "#84A98C",
  rojo: "#DC2626",
  burdeos: "#881337",
  terracota: "#C86D51",
  rosa: "#F472B6",
  mostaza: "#D97706",
  amarillo: "#FBBF24",
  morado: "#7C3AED",
  naranja: "#EA580C",
};

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
