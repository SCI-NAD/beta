import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import lit from "@astrojs/lit";

export default defineConfig({
  site: 'https://www.sci-nad.com',
  sitemap: true,
  integrations: [sitemap(), mdx(), lit(), icon()],
  output: 'static',

  // Ignore API routes in static builds
  build: {
    exclude: ["src/pages/api/**"], // Prevents serverless API routes from breaking build
  },
});