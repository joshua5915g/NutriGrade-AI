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
        brand: {
          lime: '#e4fb79',      // Vivid primary accent & glow
          forest: '#356310',    // Success green & deep nature tone
          cream: '#e5ecb1',     // Soft muted sage/cream for borders & chips
          rust: '#d33a0f',      // High-risk alerts, warnings & Grade D/E
          burgundy: '#5a0b10',  // Critical toxicity & severe alert base
          darkBg: '#090f04',    // Deep organic dark-mode canvas
          darkCard: '#111a09',  // Elevated dark glassmorphism card
        },
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
