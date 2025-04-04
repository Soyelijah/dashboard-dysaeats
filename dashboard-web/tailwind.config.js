/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E90FF', // Azul cielo
          50: '#EBF5FF',
          100: '#D6EBFF',
          200: '#ADD6FF',
          300: '#84C2FF',
          400: '#55B3FF', // Azul cielo más claro
          500: '#1E90FF', // Azul cielo (principal)
          600: '#0076CE', // Azul cielo más oscuro
          700: '#0056A4',
          800: '#003D75',
          900: '#002A52',
        },
        background: '#F8FAFC', // Blanco con tono muy ligero de azul
        surface: '#FFFFFF', // Blanco puro
        text: {
          primary: '#1A1A1A', // Negro suave
          secondary: '#6B7280', // Gris oscuro
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      backgroundColor: {
        app: '#F8FAFC',
        card: '#FFFFFF',
      },
      textColor: {
        primary: '#1A1A1A',
        secondary: '#6B7280',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}