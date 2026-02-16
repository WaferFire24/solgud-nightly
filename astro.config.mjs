// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare'; // Ganti dari node

export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: cloudflare(), // Gunakan adapter cloudflare
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dapur.solusigudang.id',
        pathname: '/assets/**',
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});