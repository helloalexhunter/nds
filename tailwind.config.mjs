// tailwind.config.mjs
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}'],
  theme: {
    extend: {
      colors: {
        'trust-blue': '#023047',
        'safety-green': '#FB8500',
        'neutral-soft': '#f9fafb',
        'neutral-border': '#d1d5db',
        'dark-text': '#111827',

        // Mapped Primary Scale
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        },
        'brand-light': '#8ECAE6',
        'brand-blue': '#219EBC',
        'brand-amber': '#FFB703',
      },
      // FIX: Globally override font sizes to force AAA compliant line-height (1.625)
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.625' }],
        sm: ['0.875rem', { lineHeight: '1.625' }],
        base: ['1rem', { lineHeight: '1.625' }],
        lg: ['1.125rem', { lineHeight: '1.625' }],
        xl: ['1.25rem', { lineHeight: '1.625' }],
        // CRITICAL FIX: Change heading line-height to 1.5 (from 1.3/1.2)
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.5' }],
        '4xl': ['2.25rem', { lineHeight: '1.5' }],
        '5xl': ['3rem', { lineHeight: '1.5' }],
        '6xl': ['3.75rem', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
});
