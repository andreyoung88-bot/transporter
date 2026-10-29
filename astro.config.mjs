// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || 'https://wensum-black.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      serialize(item) {
        if (item.url === site + '/' || item.url === site) item.priority = 1;
        else if (item.url.includes('/routes/')) item.priority = 0.8;
        else item.priority = 0.6;
        return item;
      },
    }),
  ],
  build: { inlineStylesheets: 'always', format: 'file' },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: { build: { cssMinify: true } },
});
