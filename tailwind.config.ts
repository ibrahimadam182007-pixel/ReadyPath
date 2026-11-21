import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ReadyPath Design Tokens (from docs/design.md)
        rp: {
          primary: "var(--color-primary)",
          "primary-on": "var(--color-primary-text-on)",
          "primary-on-muted": "var(--color-primary-text-on-muted)",
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          "surface-met": "var(--color-surface-met)",
          tag: "var(--color-tag-bg)",
          text: "var(--color-text)",
          "text-muted": "var(--color-text-muted)",
          "text-muted-bg": "var(--color-text-muted-on-bg)",
          border: "var(--color-border)",
          danger: "var(--color-danger)",
          "danger-bg": "var(--color-danger-bg)",
          "danger-border": "var(--color-danger-border)",
          success: "var(--color-success)",
        },
        // shadcn/ui semantic compatibility
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        "rp-sm": "var(--radius-sm)",
        "rp-md": "var(--radius-md)",
        "rp-lg": "var(--radius-lg)",
        "rp-xl": "var(--radius-xl)",
        "rp-pill": "var(--radius-pill)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        "rp-flat": "0 1px 2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
