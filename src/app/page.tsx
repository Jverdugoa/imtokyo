"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, Garment, Outfit, AIConfig, ThemeMode } from "@/types";
import { StorageService } from "@/lib/storage";
import { Navbar } from "@/components/layout/Navbar";
import { ClosetView } from "@/components/closet/ClosetView";
import { UploadModal } from "@/components/closet/UploadModal";
import { WardrobeStatsModal } from "@/components/closet/WardrobeStatsModal";
import { OutfitGenerator } from "@/components/stylist/OutfitGenerator";
import { StylistChat } from "@/components/chat/StylistChat";
import { LookbookView } from "@/components/lookbook/LookbookView";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { Sparkles, Check } from "lucide-react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("closet");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [vaultId, setVaultId] = useState<string>("IMF-TOK-USER");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App state
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [garments, setGarments] = useState<Garment[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [aiConfig, setAiConfig] = useState<AIConfig>({ provider: "auto" });

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const initialTheme = StorageService.getTheme();
    setTheme(initialTheme);
    StorageService.saveTheme(initialTheme);

    const initialVault = StorageService.getVaultId();
    setVaultId(initialVault);

    setProfile(StorageService.getProfile());
    setGarments(StorageService.getGarments());
    setOutfits(StorageService.getOutfits());
    setAiConfig(StorageService.getAIConfig());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    StorageService.saveTheme(nextTheme);
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    const res = await StorageService.syncToCloud(vaultId);
    setIsSyncing(false);
    showToast(res.message);
  };

  const handleVaultRestored = () => {
    setVaultId(StorageService.getVaultId());
    setProfile(StorageService.getProfile());
    setGarments(StorageService.getGarments());
    setOutfits(StorageService.getOutfits());
    showToast("¡Guardarropa sincronizado y cargado con éxito!");
  };

  // Handlers
  const handleSaveGarment = (newGarment: Garment) => {
    const updated = StorageService.addGarment(newGarment);
    setGarments(updated);
    showToast(`"${newGarment.name}" guardado en tu armario`);
  };

  const handleDeleteGarment = (id: string) => {
    const updated = StorageService.deleteGarment(id);
    setGarments(updated);
    showToast("Prenda eliminada");
  };

  const handleIncrementWear = (garment: Garment) => {
    const updatedGarment = { ...garment, wearCount: (garment.wearCount || 0) + 1, lastWorn: new Date().toISOString() };
    const updated = StorageService.updateGarment(updatedGarment);
    setGarments(updated);
  };

  const handleSaveToLookbook = (outfit: Outfit) => {
    const updated = StorageService.saveOutfit(outfit);
    setOutfits(updated);
    showToast("Look guardado en tu Lookbook");
  };

  const handleToggleFavoriteOutfit = (id: string) => {
    const updated = StorageService.toggleFavoriteOutfit(id);
    setOutfits(updated);
  };

  const handleRateOutfit = (id: string, rating: number) => {
    const updated = StorageService.rateOutfit(id, rating);
    setOutfits(updated);
  };

  const handleCompleteOnboarding = (updatedProfile: UserProfile) => {
    StorageService.saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setActiveTab("closet");
    showToast("Diagnóstico de estilo guardado");
  };

  const handleSaveAIConfig = (newConfig: AIConfig) => {
    StorageService.saveAIConfig(newConfig);
    setAiConfig(newConfig);
    showToast("Ajustes de IA actualizados");
  };

  const handleResetData = () => {
    StorageService.resetToDefaults();
    setProfile(StorageService.getProfile());
    setGarments(StorageService.getGarments());
    setOutfits(StorageService.getOutfits());
    showToast("Valores restablecidos");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-charcoal-900 dark:text-white">
          <Sparkles className="w-6 h-6 text-terracotta-500 animate-spin" />
          <span className="font-sans text-lg font-bold">Iniciando IMFTOK...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-8 z-50 bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn border border-white/10 dark:border-black/10">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        garmentCount={garments.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        vaultId={vaultId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        {activeTab === "closet" && (
          <ClosetView
            garments={garments}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDeleteGarment={handleDeleteGarment}
            onIncrementWear={handleIncrementWear}
            vaultId={vaultId}
            onSyncCloud={handleSyncCloud}
            isSyncing={isSyncing}
            lastSyncTime={StorageService.getLastSyncTime()}
          />
        )}

        {activeTab === "stylist" && (
          <OutfitGenerator
            garments={garments}
            profile={profile}
            aiConfig={aiConfig}
            onSaveToLookbook={handleSaveToLookbook}
            onToggleFavorite={handleToggleFavoriteOutfit}
            onRate={handleRateOutfit}
          />
        )}

        {activeTab === "chat" && (
          <StylistChat
            profile={profile}
            garments={garments}
            aiConfig={aiConfig}
          />
        )}

        {activeTab === "lookbook" && (
          <LookbookView
            outfits={outfits}
            onToggleFavorite={handleToggleFavoriteOutfit}
            onRate={handleRateOutfit}
            onNavigateToStylist={() => setActiveTab("stylist")}
          />
        )}

        {activeTab === "profile" && (
          <OnboardingWizard
            initialProfile={profile}
            onComplete={handleCompleteOnboarding}
            onCancel={() => setActiveTab("closet")}
          />
        )}
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSave={handleSaveGarment}
        aiConfig={aiConfig}
      />

      <WardrobeStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        garments={garments}
        profile={profile}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={aiConfig}
        onSaveConfig={handleSaveAIConfig}
        onResetData={handleResetData}
        vaultId={vaultId}
        onVaultRestored={handleVaultRestored}
      />
    </div>
  );
}
