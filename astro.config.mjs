// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs, sitemap, and the RSS pull-in (Phase 3).
  site: 'https://www.ouroboruszak.com',

  adapter: cloudflare(),
});