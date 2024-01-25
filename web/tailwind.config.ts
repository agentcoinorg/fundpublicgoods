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
        "primary-shadow": colors.indigo[800],
      },
      boxShadow: {
        button: `0 5px 0 -2px ${colors.indigo[200]}`,
        "button-0": `0 0 0 -2px ${colors.indigo[200]}`,
      },
      maxWidth: {
        wrapper: `768px`,
      },
    },
  },
  plugins: [],
};
export default config;
