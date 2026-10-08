/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151e2e',
          900: '#0f172a',
          950: '#020617',
        },
        'dark-bg': '#0b0f19',
        'dark-card': '#151e2e',
        'dark-border': '#26354a',
        'dark-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}