// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkShokaDirectives from './plugins/remark-shoka-directives.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://wizardhehejun.github.io',
	integrations: [mdx(), sitemap(), pagefind()],
	markdown: {
		remarkPlugins: [remarkDirective, remarkShokaDirectives],
	},
});
