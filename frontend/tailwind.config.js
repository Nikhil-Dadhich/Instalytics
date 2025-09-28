/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ← This MUST be here!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
