/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      scrollbar: {
        width: '4px', // Adjust as needed
      },
    },
  },
  plugins: [
    require('tailwindcss-scrollbar'),
  ],
}