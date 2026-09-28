import type { Config } from "tailwindcss";

/**
 * Design tokens Raccordement Assistance.
 * Repris de la maquette validée (bleu circuit / ambre énergie / papier plan).
 * Toute couleur ajoutée ailleurs dans le code DOIT passer par ces tokens.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-raised": "var(--bg-raised)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        line: "var(--line)",
        primary: {
          DEFAULT: "var(--primary)",
          ink: "var(--primary-ink)",
          soft: "var(--primary-soft)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          ink: "var(--accent-ink)",
        },
        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
        warn: { DEFAULT: "var(--warn)", soft: "var(--warn-soft)" },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        s: "6px",
        m: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
