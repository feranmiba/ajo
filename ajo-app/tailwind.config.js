/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0B0F14',
          subtle: '#0F151C',
        },
        surface: {
          DEFAULT: '#131922',
          elevated: '#1A2330',
          hover: '#222C3C',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.16)',
        },
        gold: {
          DEFAULT: '#E5A93C',
          light: '#F5BE58',
          dark: '#B87E1F',
          dim: 'rgba(229, 169, 60, 0.12)',
        },
        emerald: {
          DEFAULT: '#10B981',
          dim: 'rgba(16, 185, 129, 0.12)',
        },
      },
    },
  },
  plugins: [],
};
