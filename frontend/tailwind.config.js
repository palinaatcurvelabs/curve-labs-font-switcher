/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-main)', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Florderuina', 'sans-serif'],
        header: ['var(--font-main)', 'sans-serif'],
        'body-text': ['var(--font-main)', 'sans-serif'],
        'stitch-warrior': ['Stitch Warrior', 'sans-serif'],
      },
      colors: {
        background: '#09090b',
        surface: '#18181b',
        border: '#27272a',
      }
    }
  },
  plugins: [],
}
