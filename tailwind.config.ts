import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        canvas: '#000000',
        surface: '#111111',
        elevated: '#1A1A1A',
        'border-subtle': '#333333',
        'border-grid': '#444444',
      },
      textColor: {
        primary: '#FFFFFF',
        body: '#EAEAEA',
        secondary: '#888888',
        muted: '#666666',
      },
    },
  },
  plugins: [],
}
export default config
