import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
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
        surface: "hsl(var(--surface))",
        cream: {
          DEFAULT: "#f2f6d0",
          50: "#fafceb",
          100: "#f2f6d0",
          200: "#e6eebd",
          300: "#d6e2a1",
        },
        honeydew: {
          DEFAULT: "#d0e1d4",
          50: "#f4f8f5",
          100: "#d0e1d4",
          200: "#b5d0bc",
          300: "#98bfa2",
        },
        sand: {
          DEFAULT: "#d9d2b6",
          50: "#f7f6f0",
          100: "#d9d2b6",
          200: "#c7bda0",
        },
        desert: {
          DEFAULT: "#e4be9e",
          50: "#faf3ed",
          100: "#e4be9e",
          200: "#d5a37b",
        },
        dimgrey: {
          DEFAULT: "#71697a",
          50: "#f5f4f6",
          100: "#e2e0e4",
          400: "#8a8393",
          500: "#71697a",
          600: "#5a5363",
        },
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
        status: {
          "active-bg": "hsl(var(--status-active-bg))",
          "active-fg": "hsl(var(--status-active-fg))",
          "warning-bg": "hsl(var(--status-warning-bg))",
          "warning-fg": "hsl(var(--status-warning-fg))",
          "danger-bg": "hsl(var(--status-danger-bg))",
          "danger-fg": "hsl(var(--status-danger-fg))",
          "neutral-bg": "hsl(var(--status-neutral-bg))",
          "neutral-fg": "hsl(var(--status-neutral-fg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;

