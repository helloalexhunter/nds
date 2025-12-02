// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

export default defineConfig({
  site: 'https://www.nationaldebtservice.co.uk',
  
  integrations: [
    sitemap({
        filter: (page) => {
            if (page.endsWith('/404/')) return false; 
            return true;
        },
    }), 

    robotsTxt({
      sitemap: true, 
      policy: [
        {
          userAgent: '*', 
          allow: '/',
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});