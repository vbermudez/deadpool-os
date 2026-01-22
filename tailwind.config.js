/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deadpool: {
          red: '#FF0000',
          black: '#000000',
          gray: '#1a1a1a',
        },
      },
      fontFamily: {
        comic: ['Comic Sans MS', 'cursive'],
      },
    },
  },
  plugins: [],
}
