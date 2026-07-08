// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  adapter: netlify(),
  integrations: [
    react(),
    AstroPWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Meal Guru',
        short_name: 'Meal Guru',
        description: 'Plan meals, build shopping lists, cook step-by-step',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        theme_color: '#CF6A43',
        background_color: '#FBF6EF',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
