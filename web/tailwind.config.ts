import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          main: "#18181B",
          input: "#09090B"
        },
        secondary: {
          border: "#3F3F46"
        }
      },
      backgroundImage: {
        main: "url('/bg-blur.svg')",
      }
    },
  },
  plugins: [],
}
export default config
