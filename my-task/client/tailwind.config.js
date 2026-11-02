/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C4DE6',
          hover: '#5839D6',
          light: '#ECE8FF',
          dark: '#4F35B3',
        },
        sidebar: {
          DEFAULT: '#161E2E',
          active: '#1E293B',
          hover: '#243047',
          text: '#94A3B8',
          textActive: '#FFFFFF',
        },
        main: {
          bg: '#F8F9FC',
          darkBg: '#0F172A',
        },
        card: {
          bg: '#FFFFFF',
          darkBg: '#1E293B',
          border: '#E2E8F0',
          darkBorder: '#334155',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          darkPrimary: '#F9FAFB',
          darkSecondary: '#9CA3AF',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
