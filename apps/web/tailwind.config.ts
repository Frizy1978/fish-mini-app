import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        app: "0 20px 50px rgba(18, 109, 180, 0.08)",
        card: "0 14px 28px rgba(23, 54, 87, 0.08)",
        soft: "0 8px 20px rgba(28, 73, 110, 0.08)"
      },
      colors: {
        brand: "#126DB4",
        accent: "#0F7C82",
        softblue: "#CCE9FF",
        ink: "#1A1A1A",
        shell: "#FCFDFF",
        mist: "#F4F9FE",
        line: "#D8E7F5"
      },
      borderRadius: {
        panel: "10px",
        cta: "16px",
        "4xl": "2rem"
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        accent: ["var(--font-accent)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
