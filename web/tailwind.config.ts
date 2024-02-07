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
      typography: (theme: (path: string) => any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.indigo.800"),
            strong: {
              color: theme("colors.indigo.800"),
            },
            a: {
              color: theme("colors.indigo.600"),
            },
            "ol > li::marker": {
              color: theme("colors.indigo.500"),
            },
            "ul > li::marker": {
              color: theme("colors.indigo.500"),
            },
            li: {
              color: theme("colors.indigo.800"),
            },
            h1: {
              color: theme("colors.indigo.800"),
            },
            h2: {
              color: theme("colors.indigo.800"),
            },
            h3: {
              color: theme("colors.indigo.800"),
            },
            h4: {
              color: theme("colors.indigo.800"),
            },
            h5: {
              color: theme("colors.indigo.800"),
            },
            h6: {
              color: theme("colors.indigo.800"),
            },
          },
        },
        xs: {
          css: {
            fontSize: "10px",
            lineHeight: "150%",
            p: {
              fontSize: "10px",
              lineHeight: "150%",
            },
            h1: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "1rem",
              lineHeight: "120%",
            },
            h2: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "0.75rem",
              lineHeight: "120%",
            },
            h3: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "0.75rem",
              lineHeight: "120%",
            },
            h4: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "0.75rem",
              lineHeight: "120%",
            },
            h5: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "0.75rem",
              lineHeight: "120%",
            },
            h6: {
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
              fontSize: "0.75rem",
              lineHeight: "120%",
            },
            hr: {
              display: "none",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
