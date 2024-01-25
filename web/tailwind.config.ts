import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        indigo: {
          25: "#f0f3ff",
        },
        "primary-shadow": colors.indigo[800],
      },
      boxShadow: {
        button: `0 5px 0 -1px ${colors.indigo[800]}`,
        "button-0": `0 0 0 -1px ${colors.indigo[800]}`,
      },
      maxWidth: {
        wrapper: `768px`,
      },
      animation: {
        slideIn: "slideIn 0.3s forwards ease-in",
        slideInAffected:
          "slideInAffected 0.2s var(--delay, 0.3s) forwards ease-in-out",
      },
      keyframes: {
        slideIn: {
          "0%": {
            opacity: "0",
            transform: "translateX(-50%)",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateX(0%)",
          },
        },
        slideInAffected: {
          "50%": {
            transform: "translateX(var(--affected, 1%))",
          },
          "0%,100%": {
            transform: "translateX(0%)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
