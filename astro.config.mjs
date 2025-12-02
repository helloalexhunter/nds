// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

export default defineConfig({
  site: 'https://www.nationaldebtservice.co.uk',
  integrations: [
    sitemap(), 
    robotsTxt({
      policy: [
        {
          userAgent: '*', 
          allow: '/',
        },
      ],
      sitemap: true, 
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});