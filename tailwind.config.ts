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
      },
      colors: {
        theme_dark: {
          L0: '#1A1C1E',
          L1: '#22272D',
          L2: '#212429',
          T0: '#e2e2e6',
          T1: '#a9abae',
          I0: '#95c4f6',
          I1: '#003358',
          I2: '#0d4165'
        },
      }
    }
  },
  plugins: [
    require("tailwindcss-inner-border"),
    require('tailwind-scrollbar'),
  ]
}