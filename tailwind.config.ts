import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // dark: variants based on the .dark class on <html>
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#A0653A', // light coffee brown
          secondary: '#FBF3DA', // cream yellow
          accent: '#5A4230', // deep roast brown (footer, headings)
          light: '#D9B98F', // sand, used for text on dark backgrounds
        },
      },
      fontFamily: {
        serif: [
          '"Iowan Old Style"',
          '"Palatino Linotype"',
          'Palatino',
          'Georgia',
          'serif',
        ],
      },
    },
  },
  plugins: [],
};
export default config;
