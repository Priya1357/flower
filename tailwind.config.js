/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // Botanical palette
        sage: {
          50: '#f6f7f4',
          100: '#e3e7de',
          200: '#c7d0bf',
          300: '#a8b69c',
          400: '#8a9b7e',
          500: '#6b8062',
          600: '#54664c',
          700: '#3d4c38',
          800: '#2a3527',
          900: '#1a2018',
        },
        rose: {
          50: '#fdf7f7',
          100: '#f9eeee',
          200: '#f4ddd9',
          300: '#ebc4be',
          400: '#dda197',
          500: '#c97d72',
          600: '#b35c50',
          700: '#954639',
          800: '#7a3b31',
          900: '#5c2e27',
        },
        cream: {
          50: '#fffdf9',
          100: '#fefcf5',
          200: '#fdf8eb',
          300: '#faf2d8',
          400: '#f5e9c0',
          500: '#efdeaa',
          600: '#d9c590',
          700: '#b8a172',
          800: '#947d58',
          900: '#6d5d40',
        },
        forest: {
          50: '#f4f7f4',
          100: '#e0ebe0',
          200: '#c2d7c2',
          300: '#96b796',
          400: '#6a936a',
          500: '#477447',
          600: '#365e36',
          700: '#2b4a2b',
          800: '#253c25',
          900: '#1e2f1e',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bloom': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bloom': 'bloom 0.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
