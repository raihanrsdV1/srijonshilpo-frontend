/*********************************************************
 * Tailwind CSS Config for Srijon Shilpo Frontend
 *********************************************************/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5b7cfa',
        secondary: '#0ea5e9',
        accent: '#22d3ee'
      }
    },
  },
  plugins: [],
}
