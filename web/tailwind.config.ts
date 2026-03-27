import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        focus: "0 0 0 2px hsl(var(--accent) / 0.4)"
      }
    }
  },
  plugins: []
};

export default config;
