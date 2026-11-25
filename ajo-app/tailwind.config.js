/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mono: {
          950: '#050505',
          900: '#0a0a0a',
          850: '#121212',
          800: '#18181b',
          700: '#27272a',
          600: '#3f3f46',
          500: '#71717a',
          400: '#a1a1aa',
          300: '#d4d4d8',
          200: '#e4e4e7',
          100: '#f4f4f5',
          50: '#fafafa',
        },
      },
      backgroundImage: {
        'mono-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)',
        'card-mono': 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
      },
    },
  },
  plugins: [],
};
