/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        neu: {
          bg: "#e0e5ec",
          bgDark: "#2a2e35",
          light: "#ffffff",
          dark: "#a3b1c6",
          darkDark: "#1a1d22",
          accent: "#6366f1",
          accentLight: "#818cf8",
          accentDark: "#4f46e5",
          text: "#4a5568",
          textDark: "#e2e8f0",
          textLight: "#718096",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
      },
      boxShadow: {
        "neu-convex":
          "8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff",
        "neu-convex-sm":
          "4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff",
        "neu-convex-lg":
          "12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff",
        "neu-concave":
          "inset 6px 6px 12px #a3b1c6, inset -6px -6px 12px #ffffff",
        "neu-concave-sm":
          "inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff",
        "neu-pressed":
          "inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff",
        "neu-flat":
          "6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff",
        "neu-dark-convex":
          "8px 8px 16px #1a1d22, -8px -8px 16px #3a3f48",
        "neu-dark-concave":
          "inset 6px 6px 12px #1a1d22, inset -6px -6px 12px #3a3f48",
        "neu-dark-pressed":
          "inset 4px 4px 8px #1a1d22, inset -4px -4px 8px #3a3f48",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
