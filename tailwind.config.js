/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        teal: {
          brand: "#14B8A6",
          deep: "#0D9488",
          light: "#5EEAD4",
        },
        violet: {
          brand: "#6366F1",
          deep: "#4F46E5",
          light: "#A5B4FC",
        },
        ink: {
          DEFAULT: "#1E293B",
          secondary: "#64748B",
          muted: "#94A3B8",
        },
        surface: {
          DEFAULT: "#FAFAF8",
          card: "#FFFFFF",
          border: "#F1F5F9",
        },
        income: "#0D9488",
        expense: "#F87171",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        btn: "16px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 32px rgba(30, 41, 59, 0.06)",
        logo: "0 20px 60px rgba(99, 102, 241, 0.12)",
        btn: "0 12px 28px rgba(13, 148, 136, 0.22)",
      },
      maxWidth: {
        shell: "430px",
        desktop: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "graph-pulse": {
          "0%": { transform: "scale(0.45)", opacity: "0.55" },
          "70%": { transform: "scale(2.4)", opacity: "0" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        float: "float 5s ease-in-out infinite",
        "graph-pulse": "graph-pulse 1.7s ease-out infinite",
      },
    },
  },
  plugins: [],
};
