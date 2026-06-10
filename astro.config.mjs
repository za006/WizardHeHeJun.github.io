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
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs';
import path from 'path';



const isLocal = process.env.NODE_ENV === 'development' || !process.env.CF_PAGES;

if (isLocal) {
    process.env.KEYSTATIC_URL = 'http://192.168.7.105:4321';
}


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

    server: {
         host: '0.0.0.0',
         port: 4321,
    },
    vite: {
        server: isLocal ? {
            https: {
                // 强迫底层 Vite 编译器直接去读取你在 Documents 里测好的真 PFX 证书和密码
                pfx: fs.readFileSync('D:\\55555githhhhh\\okzhengshu\\my-android-cert.pfx'),
                passphrase: '123456'
            }
        } : {}
    },



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
