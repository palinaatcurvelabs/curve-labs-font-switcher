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
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Florderuina', 'sans-serif'],
        header: ['Inter-Medium', 'sans-serif'],
        'body-text': ['Inter', 'sans-serif'],
        nav: ['IBM Plex Mono', 'monospace'],
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
