/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./templates/**/*.twig', './templates-landing/**/*.twig'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#f5f5fd',
          100: '#edecfb',
          200: '#dddcf8',
          300: '#c4c1f1',
          400: '#a59de8',
          500: '#8878de',
          600: '#7257d0',
          700: '#6144bd',
          800: '#51399e',
          900: '#443082',
          950: '#2a1e57',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio')],
}
