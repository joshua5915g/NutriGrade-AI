/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nutriscore: {
          A: '#008B4C',
          B: '#80BB2D',
          C: '#FECB02',
          D: '#EE8100',
          E: '#E63312',
        },
      },
    },
  },
  plugins: [],
};
