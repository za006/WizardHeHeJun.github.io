import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// CMS Vite 配置：跑在 middleware 模式，被 server.mjs 包裹
export default defineConfig({
	plugins: [preact()],
});
