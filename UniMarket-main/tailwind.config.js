/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1A365D',
        accent: '#F97316',
        surface: '#F7FAFC',
      },
    },
  },
  plugins: [],
};
