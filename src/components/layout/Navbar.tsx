"use client";

import React, { useState } from "react";
import { Sparkles, Shirt, Wand2, MessageSquare, BookOpen, User, Settings, Plus, BarChart2, Moon, Sun, Camera, Cloud, Menu, X } from "lucide-react";
import { ThemeMode } from "@/types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  garmentCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  vaultId: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenStats,
  onOpenSettings,
  garmentCount,
  theme,
  onToggleTheme,
  vaultId,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { id: "closet", label: "Guardarropa", icon: Shirt, badge: garmentCount },
    { id: "stylist", label: "Estilista IA", icon: Wand2 },
    { id: "chat", label: "Chat Asesor", icon: MessageSquare },
    { id: "lookbook", label: "Lookbook", icon: BookOpen },
    { id: "profile", label: "Mi Perfil", icon: User },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-cream-50/95 dark:bg-charcoal-950/95 backdrop-blur-lg border-b border-cream-200/80 dark:border-charcoal-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo & Brand: IMFTOK */}
            <div 
              onClick={() => setActiveTab("closet")}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <span className="font-sans font-black text-xs sm:text-base text-terracotta-500 dark:text-terracotta-600 tracking-tighter">
                  IMF
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-sans text-base sm:text-2xl font-black tracking-tight text-charcoal-900 dark:text-white block leading-tight">
                    IMFTOK
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.2 bg-terracotta-500/10 dark:bg-terracotta-500/20 text-terracotta-600 dark:text-terracotta-400 rounded-md border border-terracotta-500/20">
                    TOKYO
                  </span>
                </div>
                <span className="text-[10px] text-charcoal-800/60 dark:text-zinc-400 hidden sm:block tracking-wider">
                  Improving My Fashion • Estilismo Personal IA
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-cream-100 dark:bg-charcoal-900 p-1.5 rounded-full border border-cream-200 dark:border-charcoal-800">
              {mainTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-950 shadow-sm"
                        : "text-charcoal-800/70 dark:text-zinc-400 hover:text-charcoal-900 dark:hover:text-white hover:bg-cream-200/60 dark:hover:bg-charcoal-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-terracotta-500 dark:text-terracotta-600" : ""}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive 
                          ? "bg-charcoal-800 dark:bg-zinc-200 text-cream-100 dark:text-charcoal-900" 
                          : "bg-cream-200 dark:bg-charcoal-800 text-charcoal-800 dark:text-zinc-300"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Icons (Fully Visible and Sized for Mobile Touch) */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-charcoal-800 dark:text-zinc-200 hover:bg-cream-200 dark:hover:bg-charcoal-800 transition-colors border border-cream-200/80 dark:border-charcoal-800"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
                ) : (
                  <Moon className="w-4 h-4 text-charcoal-800 animate-fadeIn" />
                )}
              </button>

              {/* Stats / Resumen */}
              <button
                type="button"
                onClick={onOpenStats}
                title="Diagnóstico & Exportar"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-charcoal-800 dark:text-zinc-200 hover:bg-cream-200 dark:hover:bg-charcoal-800 transition-colors border border-cream-200/80 dark:border-charcoal-800"
              >
                <BarChart2 className="w-4 h-4" />
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={onOpenSettings}
                title="Ajustes & Sincronización"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-charcoal-800 dark:text-zinc-200 hover:bg-cream-200 dark:hover:bg-charcoal-800 transition-colors border border-cream-200/80 dark:border-charcoal-800"
              >
                <Settings className="w-4 h-4 text-terracotta-500 dark:text-terracotta-400" />
              </button>

              {/* Desktop Only Add Button */}
              <button
                type="button"
                onClick={onOpenUpload}
                className="hidden md:flex items-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 ml-1"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Prenda</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar with Central Camera Button (Instagram/TikTok style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-charcoal-950/95 backdrop-blur-xl border-t border-cream-200 dark:border-charcoal-800 px-2 py-1.5 mobile-safe-bottom flex justify-around items-center shadow-2xl">
        {/* Guardarropa */}
        <button
          type="button"
          onClick={() => setActiveTab("closet")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "closet" 
              ? "text-terracotta-500 dark:text-terracotta-400 font-bold" 
              : "text-charcoal-800/60 dark:text-zinc-400 font-medium"
          }`}
        >
          <Shirt className={`w-5 h-5 ${activeTab === "closet" ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5">Armario</span>
        </button>

        {/* Estilista IA */}
        <button
          type="button"
          onClick={() => setActiveTab("stylist")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "stylist" 
              ? "text-terracotta-500 dark:text-terracotta-400 font-bold" 
              : "text-charcoal-800/60 dark:text-zinc-400 font-medium"
          }`}
        >
          <Wand2 className={`w-5 h-5 ${activeTab === "stylist" ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5">Estilista</span>
        </button>

        {/* Central Camera Quick Snap Button (Elevated) */}
        <button
          type="button"
          onClick={onOpenUpload}
          className="relative -top-3 w-12 h-12 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white flex items-center justify-center shadow-glow active:scale-95 transition-all border-4 border-cream-50 dark:border-charcoal-950"
          title="Tomar Foto / Subir Prenda"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Chat */}
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "chat" 
              ? "text-terracotta-500 dark:text-terracotta-400 font-bold" 
              : "text-charcoal-800/60 dark:text-zinc-400 font-medium"
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === "chat" ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5">Chat</span>
        </button>

        {/* Perfil & Más */}
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === "profile" 
              ? "text-terracotta-500 dark:text-terracotta-400 font-bold" 
              : "text-charcoal-800/60 dark:text-zinc-400 font-medium"
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === "profile" ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] mt-0.5">Perfil</span>
        </button>
      </nav>
    </>
  );
};
