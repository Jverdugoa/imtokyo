export type GarmentCategory = "top" | "bottom" | "footwear" | "outerwear" | "accessory" | "one_piece";

export type SkinUndertone = "warm" | "cool" | "neutral";

export type Season = "primavera" | "verano" | "otono" | "invierno" | "todas";

export type ThemeMode = "light" | "dark" | "system";

export interface UserProfile {
  name: string;
  genderIdentity: string;
  bodyType: string;
  height?: string;
  skinUndertone: SkinUndertone;
  preferredStyles: string[];
  frequentContexts: string[];
  favoriteColors: string[];
  avoidedColors: string[];
  openToBuying: boolean;
  completedOnboarding: boolean;
  vaultId?: string;
}

export interface Garment {
  id: string;
  name: string;
  imageUrl: string;
  category: GarmentCategory;
  subcategory: string;
  primaryColors: string[];
  colorHexes: string[];
  pattern: string;
  silhouette: string;
  seasons: Season[];
  formalityLevel: number; // 1 to 5
  material?: string;
  notes?: string;
  aiTags: string[];
  createdAt: string;
  wearCount: number;
  lastWorn?: string;
}

export interface MissingPiece {
  name: string;
  category: string;
  reason: string;
}

export interface Outfit {
  id: string;
  title: string;
  occasion: string;
  weather: string;
  vibe: string;
  garmentIds: string[];
  items: Garment[];
  stylistRationale: string;
  stylingTips: string[];
  colorHarmonyType: string;
  missingPieceSuggestion?: MissingPiece;
  rating?: number;
  isFavorite?: boolean;
  wornDates?: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedOutfits?: Outfit[];
}

export type AIProvider = "auto" | "gemini" | "openai" | "groq" | "demo";

export interface AIConfig {
  provider: AIProvider;
  geminiKey?: string;
  openaiKey?: string;
  groqKey?: string;
  vaultId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  autoSync?: boolean;
}
