module.exports = {
  darkMode: 'class',
  content: ['./src/lib/**/*.{js,ts,jsx,tsx}', './src/pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        '2xs': '0.6rem',
      },
      blur: {
        xs: '1px',
      }
    }
  },
  plugins: [
    require("tailwindcss-inner-border"),
    require('tailwind-scrollbar'),
  ]
}