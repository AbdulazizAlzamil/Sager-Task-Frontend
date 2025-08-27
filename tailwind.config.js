/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "green-drone": "#00ff88",
        "red-drone": "#ff0044",
      },
    },
  },
  plugins: [],
};
