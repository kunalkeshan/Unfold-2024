import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rubik: ["Rubik", "sans-serif"],
      },
      backgroundImage: {
        "gradient-custom":
          "linear-gradient(to right, #575ce5 50%, #f9fbfc 50%)",
      },
      keyframes: {
        "spin-heads": {
          "0%": { transform: "rotateX(0)" },
          "100%": { transform: "rotateX(2160deg)" },
        },
        "spin-tails": {
          "0%": { transform: "rotateX(0)" },
          "100%": { transform: "rotateX(1980deg)" },
        },
      },
      animation: {
        "spin-heads": "spin-heads 3s forwards",
        "spin-tails": "spin-tails 3s forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
