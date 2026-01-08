/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          game: {
            dark: '#3e2723', 
            brown: '#8d6e63',
            orange: '#bf360c',
            yellow: '#f57c00',
            cream: '#ffe0b2',
          },
        },
        borderRadius: {
          'game': '45px',
        },
      },
    },
    plugins: [],
  }