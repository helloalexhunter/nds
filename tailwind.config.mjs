// tailwind.config.mjs
import { defineConfig } from "tailwindcss";

export default defineConfig({
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapped to your Coolors palette
        "trust-blue": "#023047",      // Dark, reliable blue
        "safety-green": "#FB8500",    // Used as primary CTA (warm orange)
        "neutral-soft": "#f9fafb",    // Soft background
        "neutral-border": "#d1d5db",  // Light grey border
        "dark-text": "#111827",       // Main text colour

        // Extra named accents from the palette if you want them later
        "brand-light": "#8ECAE6",
        "brand-blue": "#219EBC",
        "brand-amber": "#FFB703",
      },
    },
  },
  plugins: [],
});
