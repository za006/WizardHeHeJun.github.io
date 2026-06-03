// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkFigure from './plugins/remark-figure.mjs';
import remarkLinkCard from './plugins/remark-link-card.mjs';
import remarkMermaid from './plugins/remark-mermaid.mjs';
import remarkShokaDirectives from './plugins/remark-shoka-directives.mjs';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from "@keystatic/astro";

// 注册公共的markdown和mdx插件
const remarkPlugins = [
    remarkDirective,
    remarkShokaDirectives,
    remarkMermaid,
    remarkLinkCard,
    remarkFigure,
];

// https://astro.build
export default defineConfig({
    output: 'static',
    site: 'https://github.io',
    integrations: [
        mdx({ remarkPlugins }),
        sitemap(),
        pagefind(),
        react(),
        markdoc(),
        ...(process.env.NODE_ENV === 'development' ? [keystatic()] : [])
    ],
    markdown: {
        remarkPlugins,
        shikiConfig: {
            theme: 'github-light'
        }
    }
});
