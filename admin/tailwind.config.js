/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pazzi-yellow': '#FABE08',
        'pazzi-dark': '#0D0700',
      },
    },
  },
  plugins: [],
}
