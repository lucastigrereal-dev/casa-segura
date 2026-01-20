/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'pro-primary': '#1a1a2e',
        'pro-secondary': '#16213e',
        'pro-accent': '#0f3460',
        'pro-highlight': '#4ecca3',
        'pro-highlight-hover': '#53d0a3',
        'pro-text': '#f5f5f5',
        'pro-text-secondary': '#b3b3b3',
        'pro-border': '#2a2a40',
      },
    },
  },
  plugins: [],
};
