/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          cyan: "#06b6d4",
          teal: "#14b8a6",
          purple: "#7c3aed",
          amber: "#f59e0b",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
        "gradient-primary-dark":
          "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
        "gradient-accent": "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
        "gradient-mesh":
          "radial-gradient(at 0% 0%, #6366f1 0px, transparent 50%), radial-gradient(at 100% 0%, #3b82f6 0px, transparent 50%), radial-gradient(at 100% 100%, #06b6d4 0px, transparent 50%), radial-gradient(at 0% 100%, #7c3aed 0px, transparent 50%)",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        gradient: "gradient-shift 15s ease infinite",
        glow: "glow 3s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "glow-sm": "0 0 10px rgba(99, 102, 241, 0.3)",
        glow: "0 0 20px rgba(99, 102, 241, 0.4)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.5)",
      },
    },
  },
  plugins: [],
};
