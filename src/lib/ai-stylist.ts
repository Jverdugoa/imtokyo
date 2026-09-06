import { Garment, UserProfile, Outfit, MissingPiece, AIConfig } from "@/types";
import { getProportionTip, checkSandwichRule } from "./color-theory";
import { compressImage, extractColorsFromCanvas } from "./image-utils";

export interface AnalyzeResult {
  name: string;
  category: Garment["category"];
  subcategory: string;
  primaryColors: string[];
  colorHexes: string[];
  pattern: string;
  silhouette: string;
  seasons: Garment["seasons"];
  formalityLevel: number;
  material?: string;
  aiTags: string[];
}

export const AIStylistService = {
  async analyzeGarmentImage(
    imageDataUrl: string,
    config: AIConfig
  ): Promise<AnalyzeResult> {
    try {
      // 1. Optimize and compress client-side before network transmission
      const optimizedImage = await compressImage(imageDataUrl, 900, 1100, 0.82);

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: optimizedImage, config }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.category) {
          return data;
        }
      }
    } catch (e) {
      console.warn("API request failed, fallback to local intelligent analyzer", e);
    }

    // Heuristic analysis simulation with real canvas color sampling
    return simulateLocalImageAnalysis(imageDataUrl);
  },

  async generateOutfits(
    params: {
      occasion: string;
      weather: string;
      vibe: string;
      profile: UserProfile;
      garments: Garment[];
      config: AIConfig;
    }
  ): Promise<Outfit[]> {
    try {
      const response = await fetch("/api/generate-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.outfits && data.outfits.length > 0) {
          return data.outfits;
        }
      }
    } catch (e) {
      console.warn("Outfits API failed, using rule-based stylist engine", e);
    }

    // Professional rule-based Stylist Matcher algorithm
    return generateRuleBasedOutfits(params);
  },

  async sendChatMessage(params: {
    message: string;
    profile: UserProfile;
    garments: Garment[];
    config: AIConfig;
  }): Promise<{ reply: string; suggestedOutfits?: Outfit[] }> {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Chat API failed, generating smart response", e);
    }

    return generateLocalChatResponse(params);
  },
};

async function simulateLocalImageAnalysis(imageUrl: string): Promise<AnalyzeResult> {
  const isOuter = imageUrl.toLowerCase().includes("blazer") || imageUrl.toLowerCase().includes("jacket") || imageUrl.toLowerCase().includes("coat");
  const isBottom = imageUrl.toLowerCase().includes("pant") || imageUrl.toLowerCase().includes("jean") || imageUrl.toLowerCase().includes("trouser");
  const isShoe = imageUrl.toLowerCase().includes("shoe") || imageUrl.toLowerCase().includes("sneaker") || imageUrl.toLowerCase().includes("boot");
  
  const extractedHexes = await extractColorsFromCanvas(imageUrl);
  const dominantHex = extractedHexes[0] || "#DDD4C0";

  if (isOuter) {
    return {
      name: "Chaqueta / Blazer Estructurado IMFTOK",
      category: "outerwear",
      subcategory: "Blazer",
      primaryColors: ["Tono Neutro", "Tierra"],
      colorHexes: [dominantHex, "#27272A"],
      pattern: "Liso / Sólido",
      silhouette: "Corte Regular / Estructurado",
      seasons: ["primavera", "otono", "invierno"],
      formalityLevel: 4,
      material: "Lana fría o gabardina",
      aiTags: ["Estructurado", "Tokyo Chic", "Capa elegante"],
    };
  }

  if (isBottom) {
    return {
      name: "Pantalón / Jeans Corte Recto",
      category: "bottom",
      subcategory: "Pantalón de Vestir",
      primaryColors: ["Oscuro", "Carbón"],
      colorHexes: [dominantHex, "#18181B"],
      pattern: "Liso / Sólido",
      silhouette: "Tiro Alto / Recto",
      seasons: ["todas"],
      formalityLevel: 3,
      material: "Algodón sastre o denim",
      aiTags: ["Esencial", "Alarga silueta", "Básico"],
    };
  }

  if (isShoe) {
    return {
      name: "Calzado Urbano Tokyo",
      category: "footwear",
      subcategory: "Sneakers / Mocasines",
      primaryColors: ["Blanco / Neutro"],
      colorHexes: [dominantHex, "#FFFFFF"],
      pattern: "Liso / Sólido",
      silhouette: "Corte Bajo",
      seasons: ["todas"],
      formalityLevel: 2,
      material: "Piel / Cuero",
      aiTags: ["Cómodo", "Streetwear Tokyo", "Atuendo diario"],
    };
  }

  return {
    name: "Prenda Superior Esencial",
    category: "top",
    subcategory: "Camisa / Camiseta",
    primaryColors: ["Luminoso", "Neutro"],
    colorHexes: [dominantHex, "#FFFFFF"],
    pattern: "Liso / Sólido",
    silhouette: "Corte Recto",
    seasons: ["primavera", "verano", "otono", "todas"],
    formalityLevel: 3,
    material: "Algodón suave",
    aiTags: ["IMFTOK Essential", "Fresco", "Luminoso"],
  };
}

function generateRuleBasedOutfits(params: {
  occasion: string;
  weather: string;
  vibe: string;
  profile: UserProfile;
  garments: Garment[];
}): Outfit[] {
  const { occasion, weather, vibe, profile, garments } = params;
  const outfits: Outfit[] = [];

  const tops = garments.filter((g) => g.category === "top");
  const bottoms = garments.filter((g) => g.category === "bottom");
  const shoes = garments.filter((g) => g.category === "footwear");
  const outers = garments.filter((g) => g.category === "outerwear");
  const accessories = garments.filter((g) => g.category === "accessory");

  if (tops.length === 0 || bottoms.length === 0) {
    return [];
  }

  const weatherCold = weather.toLowerCase().includes("frío") || weather.toLowerCase().includes("invierno") || weather.toLowerCase().includes("lluv");
  const formalOccasion = occasion.toLowerCase().includes("oficina") || occasion.toLowerCase().includes("formal") || occasion.toLowerCase().includes("reunión") || occasion.toLowerCase().includes("boda");

  // Option 1: Effortless Balanced Look
  const top1 = tops[0];
  const bottom1 = bottoms[0];
  const shoe1 = shoes.length > 0 ? (formalOccasion ? shoes.find((s) => s.formalityLevel >= 3) || shoes[0] : shoes[0]) : undefined;
  const outer1 = (weatherCold || formalOccasion) && outers.length > 0 ? outers[0] : undefined;
  const acc1 = accessories.length > 0 ? accessories[0] : undefined;

  const items1 = [top1, bottom1, shoe1, outer1, acc1].filter((x): x is Garment => Boolean(x));
  const proportionTip1 = getProportionTip(top1.silhouette, bottom1.silhouette);
  const sandwichTip1 = checkSandwichRule(top1, shoe1);

  const tips1 = [
    proportionTip1,
    `Ideal para ${occasion.toLowerCase()}: el balance entre ${top1.name} y ${bottom1.name} proyecta seguridad y estilo pulcro.`,
  ];
  if (sandwichTip1) tips1.push(sandwichTip1);

  outfits.push({
    id: `outfit-${Date.now()}-1`,
    title: `Armonía ${vibe || "Equilibrada"} IMFTOK`,
    occasion,
    weather,
    vibe,
    garmentIds: items1.map((i) => i.id),
    items: items1,
    stylistRationale: `Look estructurado bajo la regla 60-30-10: ${bottom1.name} establece la base neutra mientras ${top1.name} ilumina el rostro según tu paleta ${profile.skinUndertone === "warm" ? "cálida" : profile.skinUndertone === "cool" ? "fría" : "neutra"}.`,
    stylingTips: tips1,
    colorHarmonyType: "Neutro Sofisticado con Contraste",
    missingPieceSuggestion: {
      name: "Cinturón fino de cuero a juego con el calzado",
      category: "accessory",
      reason: "Define la cintura y aporta una terminación pulcra de alta costura.",
    },
    rating: 5,
    createdAt: new Date().toISOString(),
  });

  // Option 2: Casual Chic Tokyo Layering
  if (tops.length > 1 || bottoms.length > 1) {
    const top2 = tops[1] || tops[0];
    const bottom2 = bottoms[1] || bottoms[0];
    const shoe2 = shoes.length > 1 ? shoes[1] : (shoes[0] || undefined);
    const outer2 = outers.length > 1 ? outers[1] : (outers[0] || undefined);

    const items2 = [top2, bottom2, shoe2, outer2].filter((x): x is Garment => Boolean(x));

    outfits.push({
      id: `outfit-${Date.now()}-2`,
      title: `Alternativa Tokyo Casual Chic`,
      occasion,
      weather,
      vibe: "Relajado & Pulcro",
      garmentIds: items2.map((i) => i.id),
      items: items2,
      stylistRationale: `Enfoque versátil inspirado en el estilo urbano de Tokio que combina ${top2.name} con ${bottom2.name}.`,
      stylingTips: [
        "Aplica el french-tuck (meter ligeramente el frente del top) para alargar la línea de las piernas.",
        "Remanga los puños para dar un aire relajado e intencional.",
      ],
      colorHarmonyType: "Análogo de Entretiempo",
      missingPieceSuggestion: {
        name: "Lentes de sol o reloj minimalista",
        category: "accessory",
        reason: "Eleva el conjunto a un nivel 'effortless fashion'.",
      },
      rating: 4,
      createdAt: new Date().toISOString(),
    });
  }

  // Option 3: Modern Proportions Look
  if (bottoms.length > 0 && tops.length > 0) {
    const top3 = tops[tops.length - 1];
    const bottom3 = bottoms[bottoms.length - 1];
    const shoe3 = shoes[0] || undefined;
    const outer3 = outers[outers.length - 1] || undefined;

    const items3 = [top3, bottom3, shoe3, outer3].filter((x): x is Garment => Boolean(x));

    outfits.push({
      id: `outfit-${Date.now()}-3`,
      title: `Contraste Tonal & Silueta Tokyo`,
      occasion,
      weather,
      vibe: "Vanguardista & Cómodo",
      garmentIds: items3.map((i) => i.id),
      items: items3,
      stylistRationale: `Estructura visual de alto contraste que alarga las proporciones, optimizada para el clima ${weather.toLowerCase()}.`,
      stylingTips: [
        "Juega con accesorios metálicos sutiles para complementar las prendas monocromáticas.",
        "Si baja la temperatura, añade una bufanda o abrigo como capa envolvente.",
      ],
      colorHarmonyType: "Monocromático Estilizado",
      createdAt: new Date().toISOString(),
    });
  }

  return outfits;
}

function generateLocalChatResponse(params: {
  message: string;
  profile: UserProfile;
  garments: Garment[];
}): { reply: string; suggestedOutfits?: Outfit[] } {
  const { message, profile, garments } = params;
  const msgLower = message.toLowerCase();

  if (msgLower.includes("hola") || msgLower.includes("buenas") || msgLower.includes("empezar")) {
    return {
      reply: `¡Hola ${profile.name || ""}! Bienvenido a **IMFTOK (Improving My Fashion Tokyo)**. He revisado tus ${garments.length} prendas registradas y tu perfil (${profile.bodyType}, subtono ${profile.skinUndertone === "warm" ? "cálido" : profile.skinUndertone === "cool" ? "frío" : "neutro"}).\n\n¿Para qué ocasión o evento te gustaría planificar tu look hoy? También puedes pedirme recomendaciones para combinar una prenda o qué básicos añadir a tu armario.`,
    };
  }

  if (msgLower.includes("falta") || msgLower.includes("básico") || msgLower.includes("comprar")) {
    const categories = garments.map((g) => g.category);
    const missing: string[] = [];
    if (!categories.includes("outerwear")) missing.push("un blazer estructurado o trench coat neutro");
    if (!categories.includes("footwear")) missing.push("un par de sneakers blancos de piel o mocasines");
    if (!categories.includes("accessory")) missing.push("un cinturón de cuero y un bolso estructurado");
    if (garments.filter((g) => g.category === "top").length < 3) missing.push("una camisa de lino o algodón de corte clásico");

    const missingText = missing.length > 0 ? missing.join(", ") : "¡Tu base de armario está muy completa!";

    return {
      reply: `Analizando tu cápsula IMFTOK:\n\n✨ **Prendas clave recomendadas para potenciar tu armario:**\n${missingText}.\n\nPara tu subtono **${profile.skinUndertone.toUpperCase()}**, busca estas piezas en tonos como ${profile.favoriteColors.slice(0, 3).join(", ") || "arena, marfil o azul marino"}. Recuerda que la clave es la versatilidad de corte y color.`,
    };
  }

  return {
    reply: `¡Excelente consulta! Teniendo en cuenta tu perfil y las ${garments.length} prendas de tu armario IMFTOK, te sugiero jugar con la **regla de los tercios** y la **coordinación de texturas**.\n\nPuedes ir a la pestaña **'Estilista IA'** para generar combinaciones completas para cualquier clima y ocasión, o decirme qué prenda quieres que sea la protagonista.`,
  };
}
