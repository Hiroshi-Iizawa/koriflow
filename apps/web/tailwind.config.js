/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        kori: {
          50:  '#f5fbff',
          100: '#e8f4ff',
          200: '#cde6ff',
          300: '#9fd1ff',
          400: '#6ab8ff',
          500: '#379eff',
          600: '#1f7fe6',
          700: '#1564b8',
          800: '#0e4a8a',
          900: '#083259',
        },
        form: {
          bg: '#f5fbff',      // kori-50
          border: '#9fd1ff',  // kori-300
          label: '#1564b8',   // kori-700
          required: '#1f7fe6', // kori-600
          section: '#e8f4ff', // kori-100
        },
        'kori-select-bg': 'rgba(255,255,255,0.9)',
        'kori-select-hover': '#e8f4ff',  // kori-100
        'kori-select-active': '#cde6ff', // kori-200
        expiry: {
          soon: '#F59E0B', // amber-500
          over: '#EF4444', // red-500
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-cream": {
          "0%": { transform: "rotate(0deg)", borderTopColor: "#6ab8ff" },
          "50%": { borderTopColor: "#379eff" },
          "100%": { transform: "rotate(360deg)", borderTopColor: "#6ab8ff" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "spin-cream": "spin-cream 1s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}