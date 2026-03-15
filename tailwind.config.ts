import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      fontFamily: {
        display: ["var(--font-outfit)", "Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-outfit)", "Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "journal-xs": ["0.625rem", { lineHeight: "1.2" }],          // 10px
        "journal-sm": ["0.75rem", { lineHeight: "1.4" }],           // 12px
        "journal-base": ["0.875rem", { lineHeight: "1.5" }],        // 14px
        "journal-md": ["1rem", { lineHeight: "1.6" }],              // 16px
        "journal-lg": ["1.125rem", { lineHeight: "1.7" }],          // 18px
        "journal-xl": ["1.375rem", { lineHeight: "1.6" }],          // 22px
        "journal-2xl": ["1.75rem", { lineHeight: "1.3" }],          // 28px
        "display-sm": ["1.5rem", { lineHeight: "1.3" }],            // 24px
        "display-md": ["2.25rem", { lineHeight: "1.15" }],          // 36px
        "display-lg": ["3rem", { lineHeight: "1.1" }],              // 48px
        "display-xl": ["3.75rem", { lineHeight: "1.05" }],          // 60px
        "display-2xl": ["4.5rem", { lineHeight: "1.0" }],           // 72px
        overline: ["0.625rem", { lineHeight: "1.2", letterSpacing: "0.2em" }],
        micro: ["0.5625rem", { lineHeight: "1.2", letterSpacing: "0.15em" }],
      },
      colors: {
        // Primary — Wandra Teal
        teal: {
          50: "#EDFCF8",
          100: "#D2F7ED",
          200: "#A8EEDC",
          300: "#6FE0C6",
          400: "#35CAAB",
          500: "#14B8A6",
          600: "#0A9484",
          700: "#0D766C",
          800: "#0F5D57",
          900: "#114D48",
          950: "#042F2E",
        },
        // Accent — Journey Amber
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Sage — Trailside
        sage: {
          50: "#F2F7F2",
          100: "#E0ECE0",
          500: "#5C8A5C",
          600: "#4A6F4A",
          700: "#3D5C3D",
          900: "#1A2E1A",
        },
        // Sand — Midnight Neutrals
        sand: {
          50: "#0D1117",
          100: "#1A1F2E",
          200: "#252B3B",
          300: "#394150",
          400: "#6B7280",
          500: "#9CA3AF",
          600: "#D1D5DB",
          700: "#E5E7EB",
          800: "#F3F4F6",
          900: "#F9FAFB",
        },
        // Semantic
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        // Brand Aliases
        brand: {
          primary: "#14B8A6",
          accent: "#D97706",
          bg: "#0D1117",
        },
      },
      borderRadius: {
        card: "2rem",
        input: "2rem",
        button: "1.25rem",
        "button-lg": "2rem",
        badge: "9999px",
        journal: "3rem",
        nav: "2rem",
        avatar: "3rem",
        modal: "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.25)",
        "glass-lg": "0 25px 50px -12px rgba(0,0,0,0.5)",
        "glass-nav": "0 -8px 32px 0 rgba(0,0,0,0.35)",
        glow: "0 0 20px rgba(20,184,166,0.3)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.3)",
        "glow-white": "0 0 30px rgba(255,255,255,0.08)",
        "glow-dot": "0 0 8px rgba(20,184,166,0.6)",
        journalCard: "0 8px 32px 0 rgba(0,0,0,0.25), inset 0 1px 0 0 rgba(255,255,255,0.06)",
        "journal-inner": "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
        button: "0 4px 16px 0 rgba(0,0,0,0.3)",
        input: "0 4px 12px 0 rgba(0,0,0,0.15)",
        modal: "0 32px 64px 0 rgba(0,0,0,0.5)",
      },
      backdropBlur: {
        glass: "24px",
        hero: "32px",
        subtle: "10px",
        nav: "40px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "journal-reveal": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(20,184,166,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(20,184,166,0.6)" },
        },
        "tracking-dot": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.6" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "compass-spin": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.1) rotate(8deg)" },
          "50%": { transform: "scale(1) rotate(-8deg)" },
          "100%": { transform: "scale(1) rotate(0deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s cubic-bezier(0.22,1,0.36,1)",
        "journal-reveal": "journal-reveal 0.8s cubic-bezier(0.16,1,0.3,1)",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "tracking-dot": "tracking-dot 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "compass-spin": "compass-spin 5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      transitionTimingFunction: {
        wandra: "cubic-bezier(0.23, 1, 0.32, 1)",
        gentle: "cubic-bezier(0.22, 1, 0.36, 1)",
        dramatic: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
