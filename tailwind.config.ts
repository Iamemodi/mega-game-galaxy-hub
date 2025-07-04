import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', "serif"],
        inter: ['Inter', "sans-serif"],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Game specific colors
        game: {
          primary: '#9b87f5',     // Primary purple
          secondary: '#7E69AB',   // Secondary purple
          accent: '#D6BCFA',      // Light purple
          dark: '#1A1F2C',        // Dark purple
          puzzle: '#E5DEFF',      // Soft purple for puzzle games
          arcade: '#FEC6A1',      // Soft orange for arcade games
          idle: '#F2FCE2',        // Soft green for idle games
          word: '#D3E4FD',        // Soft blue for word games
          strategy: '#FFDEE2',    // Soft pink for strategy games
          card: '#FEF7CD',        // Soft yellow for card games 
          runner: '#FDE1D3',      // Soft peach for runner games
          simulation: '#F1F0FB',  // Soft gray for simulation games
          text: '#D6D6D6',        // Light gray for text-based games
          unique: '#C8C8C9',      // Silver gray for unique mechanics games
        }
      },
      backgroundImage: {
        // Visually striking gradients:
        'shiny-purple': 'linear-gradient(135deg, #5b247a 0%, #1bcedf 100%)',
        'mystic-orange': 'linear-gradient(120deg, #FDBB2D 0%, #3A1C71 100%)',
        'retro-violet': 'linear-gradient(135deg, #4338ca 0 30%, #c471f5 100%)',
        'deep-night': 'linear-gradient(120deg, #232526 0%, #243B55 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.9)', opacity: '0.5' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pop': 'pop 0.3s ease-out forwards',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
