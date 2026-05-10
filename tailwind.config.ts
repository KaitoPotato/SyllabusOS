import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f8f8fb",
          100: "#eeeef4",
          200: "#d9d9e3",
          300: "#b8b8c8",
          400: "#8a8aa0",
          500: "#5a5a72",
          600: "#3d3d52",
          700: "#2a2a3a",
          800: "#1c1c2a",
          900: "#0f0f1a",
        },
        accent: {
          50: "#f3eefe",
          100: "#e4d8fd",
          200: "#c8b1fb",
          300: "#a888f7",
          400: "#8b65f0",
          500: "#7044e5",
          600: "#5a30c7",
          700: "#4823a0",
          800: "#371a78",
          900: "#251052",
        },
        load: {
          0: "#f4f4f7",
          1: "#dcefe3",
          2: "#fff4cf",
          3: "#ffd9a8",
          4: "#ffb088",
          5: "#ff7676",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Inter", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(20, 20, 40, 0.06)",
        pop: "0 8px 32px rgba(20, 20, 40, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
