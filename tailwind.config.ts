import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FAF8F5",
          100: "#F5F2EB",
          200: "#EBE5D8",
          300: "#DDD4C0",
        },
        sage: {
          50: "#F4F7F4",
          100: "#E3EBE3",
          500: "#6B8E78",
          700: "#3D5A46",
          900: "#223528",
        },
        terracotta: {
          50: "#FDF6F4",
          100: "#F9EAE5",
          500: "#C86D51",
          600: "#B85B3F",
          700: "#9E4A32",
        },
        tokyo: {
          red: "#FF3366",
          neon: "#FF2A6D",
          purple: "#7928CA",
          gold: "#F5A623",
        },
        charcoal: {
          700: "#3F3F46",
          800: "#27272A",
          850: "#1E1E22",
          900: "#141417",
          950: "#09090B",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0, 0, 0, 0.06)",
        card: "0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        glow: "0 0 25px -5px rgba(200, 109, 81, 0.35)",
        tokyoGlow: "0 0 30px -5px rgba(255, 51, 102, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
