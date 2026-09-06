import { Garment, UserProfile, Outfit, ChatMessage, AIConfig, ThemeMode } from "@/types";
import { DEFAULT_PROFILE, INITIAL_GARMENTS, INITIAL_OUTFITS } from "./default-data";
import { IDBService } from "./indexed-db";

const KEYS = {
  PROFILE: "imftok_profile",
  GARMENTS: "imftok_garments",
  OUTFITS: "imftok_outfits",
  CHAT: "imftok_chat",
  AI_CONFIG: "imftok_ai_config",
  THEME: "imftok_theme",
  VAULT_ID: "imftok_vault_id",
  LAST_SYNC: "imftok_last_sync",
};

function generateDefaultVaultId(): string {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `IMF-TOK-${rand}`;
}

export const StorageService = {
  getTheme(): ThemeMode {
    if (typeof window === "undefined") return "dark";
    const theme = localStorage.getItem(KEYS.THEME) as ThemeMode;
    return theme || "dark";
  },

  saveTheme(theme: ThemeMode): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.THEME, theme);
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  getVaultId(): string {
    if (typeof window === "undefined") return "IMF-TOK-USER";
    let id = localStorage.getItem(KEYS.VAULT_ID);
    if (!id) {
      id = generateDefaultVaultId();
      localStorage.setItem(KEYS.VAULT_ID, id);
    }
    return id;
  },

  saveVaultId(vaultId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.VAULT_ID, vaultId.trim().toUpperCase());
  },

  getLastSyncTime(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(KEYS.LAST_SYNC);
  },

  getProfile(): UserProfile {
    if (typeof window === "undefined") return DEFAULT_PROFILE;
    const data = localStorage.getItem(KEYS.PROFILE);
    if (!data) {
      const defaultProf = { ...DEFAULT_PROFILE, vaultId: this.getVaultId() };
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(defaultProf));
      return defaultProf;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed.vaultId) parsed.vaultId = this.getVaultId();
      return parsed;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn("LocalStorage profile save failed:", e);
    }
    IDBService.set(KEYS.PROFILE, profile);
  },

  getGarments(): Garment[] {
    if (typeof window === "undefined") return INITIAL_GARMENTS;
    const data = localStorage.getItem(KEYS.GARMENTS);
    if (!data) {
      localStorage.setItem(KEYS.GARMENTS, JSON.stringify(INITIAL_GARMENTS));
      IDBService.set(KEYS.GARMENTS, INITIAL_GARMENTS);
      return INITIAL_GARMENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_GARMENTS;
    }
  },

  saveGarments(garments: Garment[]): void {
    if (typeof window === "undefined") return;
    // Always persist in IndexedDB (handles gigabytes with zero quota limit)
    IDBService.set(KEYS.GARMENTS, garments);

    // Also attempt localStorage with safe try/catch for instant synchronous read
    try {
      localStorage.setItem(KEYS.GARMENTS, JSON.stringify(garments));
    } catch (e) {
      console.warn("LocalStorage quota reached. IndexedDB is safely retaining your garments.", e);
    }
  },

  addGarment(garment: Garment): Garment[] {
    const list = this.getGarments();
    const updated = [garment, ...list];
    this.saveGarments(updated);
    return updated;
  },

  updateGarment(garment: Garment): Garment[] {
    const list = this.getGarments();
    const updated = list.map((g) => (g.id === garment.id ? garment : g));
    this.saveGarments(updated);
    return updated;
  },

  deleteGarment(id: string): Garment[] {
    const list = this.getGarments();
    const updated = list.filter((g) => g.id !== id);
    this.saveGarments(updated);
    return updated;
  },

  getOutfits(): Outfit[] {
    if (typeof window === "undefined") return INITIAL_OUTFITS;
    const data = localStorage.getItem(KEYS.OUTFITS);
    if (!data) {
      localStorage.setItem(KEYS.OUTFITS, JSON.stringify(INITIAL_OUTFITS));
      IDBService.set(KEYS.OUTFITS, INITIAL_OUTFITS);
      return INITIAL_OUTFITS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_OUTFITS;
    }
  },

  saveOutfit(outfit: Outfit): Outfit[] {
    const list = this.getOutfits();
    const existing = list.find((o) => o.id === outfit.id);
    let updated: Outfit[];
    if (existing) {
      updated = list.map((o) => (o.id === outfit.id ? outfit : o));
    } else {
      updated = [outfit, ...list];
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(KEYS.OUTFITS, JSON.stringify(updated));
      } catch (e) {
        console.warn("LocalStorage outfits quota warning:", e);
      }
      IDBService.set(KEYS.OUTFITS, updated);
    }
    return updated;
  },

  toggleFavoriteOutfit(id: string): Outfit[] {
    const list = this.getOutfits();
    const updated = list.map((o) =>
      o.id === id ? { ...o, isFavorite: !o.isFavorite } : o
    );
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(KEYS.OUTFITS, JSON.stringify(updated));
      } catch (e) {
        console.warn("LocalStorage save error:", e);
      }
      IDBService.set(KEYS.OUTFITS, updated);
    }
    return updated;
  },

  rateOutfit(id: string, rating: number): Outfit[] {
    const list = this.getOutfits();
    const updated = list.map((o) => (o.id === id ? { ...o, rating } : o));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(KEYS.OUTFITS, JSON.stringify(updated));
      } catch (e) {
        console.warn("LocalStorage save error:", e);
      }
      IDBService.set(KEYS.OUTFITS, updated);
    }
    return updated;
  },

  getChatMessages(): ChatMessage[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(KEYS.CHAT);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveChatMessages(messages: ChatMessage[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
    } catch {
      // ignore
    }
  },

  clearChat(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEYS.CHAT);
  },

  getAIConfig(): AIConfig {
    if (typeof window === "undefined") return { provider: "auto" };
    const data = localStorage.getItem(KEYS.AI_CONFIG);
    if (!data) return { provider: "auto", vaultId: this.getVaultId() };
    try {
      const parsed = JSON.parse(data);
      if (!parsed.vaultId) parsed.vaultId = this.getVaultId();
      return parsed;
    } catch {
      return { provider: "auto", vaultId: this.getVaultId() };
    }
  },

  saveAIConfig(config: AIConfig): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.AI_CONFIG, JSON.stringify(config));
  },

  // CLOUD SYNC & RECOVERY
  async syncToCloud(customVaultId?: string): Promise<{ success: boolean; message: string; updatedAt?: string }> {
    const vaultId = (customVaultId || this.getVaultId()).trim().toUpperCase();
    const profile = this.getProfile();
    const garments = this.getGarments();
    const outfits = this.getOutfits();
    const config = this.getAIConfig();

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaultId,
          profile,
          garments,
          outfits,
          supabaseConfig: config.supabaseUrl && config.supabaseKey ? {
            url: config.supabaseUrl,
            key: config.supabaseKey,
          } : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        localStorage.setItem(KEYS.LAST_SYNC, time);
        return { success: true, message: `Bóveda sincronizada exitosamente con código: ${vaultId}`, updatedAt: time };
      }
      return { success: false, message: data.error || "No se pudo sincronizar con la nube." };
    } catch (e: any) {
      return { success: false, message: e.message || "Error de conexión con el servidor de sincronización." };
    }
  },

  async restoreFromCloud(vaultId: string): Promise<{ success: boolean; message: string; count?: number }> {
    const cleanId = vaultId.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, message: "Por favor ingresa un Código de Bóveda válido." };
    }

    try {
      const response = await fetch(`/api/sync?vaultId=${encodeURIComponent(cleanId)}`);
      const data = await response.json();

      if (response.ok && data.success && data.found && data.data) {
        const { profile, garments, outfits } = data.data;

        if (profile) this.saveProfile(profile);
        if (garments && Array.isArray(garments)) this.saveGarments(garments);
        if (outfits && Array.isArray(outfits)) {
          localStorage.setItem(KEYS.OUTFITS, JSON.stringify(outfits));
          IDBService.set(KEYS.OUTFITS, outfits);
        }

        this.saveVaultId(cleanId);
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        localStorage.setItem(KEYS.LAST_SYNC, time);

        return {
          success: true,
          message: `¡Guardarropa y perfil restaurados exitosamente! (${garments?.length || 0} prendas recuperadas)`,
          count: garments?.length || 0,
        };
      } else {
        return {
          success: false,
          message: data.message || `No se encontró guardarropa para el código ${cleanId}.`,
        };
      }
    } catch (e: any) {
      return { success: false, message: e.message || "Error al conectar con la nube para restaurar." };
    }
  },

  exportWardrobeAsText(): string {
    const garments = this.getGarments();
    const profile = this.getProfile();

    const categoryMap: Record<string, string> = {
      top: "Prendas Superiores",
      bottom: "Prendas Inferiores",
      footwear: "Calzado",
      outerwear: "Abrigos y Chaquetas",
      accessory: "Accesorios",
      one_piece: "Vestidos / Enterizos",
    };

    const grouped: Record<string, Garment[]> = {};
    garments.forEach((g) => {
      if (!grouped[g.category]) grouped[g.category] = [];
      grouped[g.category].push(g);
    });

    let text = `=== IMFTOK (Improving My Fashion Tokyo) - MI GUARDARROPA ===\n\n`;
    text += `🔑 CÓDIGO DE BÓVEDA EN LA NUBE: ${this.getVaultId()}\n\n`;
    text += `👤 PERFIL DE ESTILO:\n`;
    text += `- Nombre: ${profile.name}\n`;
    text += `- Género/Identidad: ${profile.genderIdentity}\n`;
    text += `- Complexión/Silueta: ${profile.bodyType}\n`;
    text += `- Subtono de Piel: ${profile.skinUndertone.toUpperCase()} (${profile.skinUndertone === "warm" ? "Cálido" : profile.skinUndertone === "cool" ? "Frío" : "Neutro"})\n`;
    text += `- Estilos: ${profile.preferredStyles.join(", ")}\n`;
    text += `- Colores Favoritos: ${profile.favoriteColors.join(", ")}\n`;
    text += `- Colores que Evito: ${profile.avoidedColors.join(", ")}\n\n`;

    text += `👗 INVENTARIO DE PRENDAS (${garments.length} registradas):\n\n`;

    for (const [catKey, label] of Object.entries(categoryMap)) {
      const items = grouped[catKey] || [];
      if (items.length > 0) {
        text += `📁 ${label} (${items.length}):\n`;
        items.forEach((item, index) => {
          text += `  ${index + 1}. [${item.name}] | Colores: ${item.primaryColors.join("/")} | Silueta: ${item.silhouette} | Formalidad: ${item.formalityLevel}/5 | Estaciones: ${item.seasons.join(", ")}\n`;
        });
        text += `\n`;
      }
    }

    text += `=== Fin de IMFTOK Wardrobe ===\n`;
    return text;
  },

  resetToDefaults(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(KEYS.GARMENTS, JSON.stringify(INITIAL_GARMENTS));
    localStorage.setItem(KEYS.OUTFITS, JSON.stringify(INITIAL_OUTFITS));
    IDBService.set(KEYS.GARMENTS, INITIAL_GARMENTS);
    IDBService.set(KEYS.OUTFITS, INITIAL_OUTFITS);
    IDBService.set(KEYS.PROFILE, DEFAULT_PROFILE);
    localStorage.removeItem(KEYS.CHAT);
  }
};
