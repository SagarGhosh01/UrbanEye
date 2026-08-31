/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bel: {
          navy: '#0b192c',
          card: '#1e293b',
          border: '#334155',
          gold: '#f59e0b',
          accent: '#0284c7',
          danger: '#ef4444',
          warning: '#f97316',
          success: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
