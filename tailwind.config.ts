import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
        mono:  ['DM Mono', 'monospace'],
      },
      colors: {
        bg:      { DEFAULT: '#09090f', 2: '#111118', 3: '#17171f', 4: '#1e1e28' },
        gold:    { DEFAULT: '#c8a45a', 2: '#e2c47e', 3: '#f5e4b8' },
        border:  { DEFAULT: '#2a2830', 2: '#3a3648' },
      },
      keyframes: {
        fadein: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadein: 'fadein .25s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
