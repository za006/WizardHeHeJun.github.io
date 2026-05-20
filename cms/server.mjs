// Hono + Vite middleware 本地 CMS server。端口 4322（避开 4321 Astro dev）。
// 安全：只接受 localhost Host 头（防 DNS rebinding）；只绑定 127.0.0.1。
import { createServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { Hono } from 'hono';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPosts } from './api/list.mjs';
import { readPost } from './api/read.mjs';
import { writePost } from './api/write.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CMS_DIR = __dirname;
const PROJECT_ROOT = resolve(CMS_DIR, '..');
const PORT = 4322;
const SAFE_HOSTS = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

const app = new Hono();

app.get('/api/cms/list', async (c) => {
	try {
		const posts = await listPosts(PROJECT_ROOT);
		return c.json({ posts });
	} catch (e) {
		return c.json({ error: e.message }, 500);
	}
});

app.get('/api/cms/read', async (c) => {
	const id = c.req.query('id');
	if (!id) return c.json({ error: 'missing ?id=' }, 400);
	try {
		const data = await readPost(PROJECT_ROOT, id);
		return c.json(data);
	} catch (e) {
		return c.json({ error: e.message }, 400);
	}
});

app.post('/api/cms/write', async (c) => {
	try {
		const body = await c.req.json();
		const result = await writePost(PROJECT_ROOT, body);
		return c.json(result);
	} catch (e) {
		return c.json({ error: e.message }, 400);
	}
});

app.get('/api/cms/config', (c) =>
	c.json({
		projectRoot: PROJECT_ROOT,
		contentDir: 'src/content/blog',
		editors: [
			{ id: 'vscode', urlTemplate: 'vscode://file/{path}:{line}:{column}' },
			{ id: 'cursor', urlTemplate: 'cursor://file/{path}:{line}:{column}' },
			{ id: 'trae', urlTemplate: 'trae://file/{path}:{line}:{column}' },
			{ id: 'zed', urlTemplate: 'zed://file/{path}:{line}:{column}' },
		],
	})
);

async function main() {
	const vite = await createViteServer({
		root: CMS_DIR,
		server: { middlewareMode: true },
		appType: 'spa',
	});

	const server = createServer(async (req, res) => {
		const host = req.headers.host || '';
		if (!SAFE_HOSTS.test(host)) {
			res.writeHead(403, { 'Content-Type': 'text/plain' });
			res.end('Forbidden: localhost only');
			return;
		}

		if (req.url?.startsWith('/api/')) {
			try {
				const url = `http://${host}${req.url}`;
				const headers = new Headers();
				for (const [k, v] of Object.entries(req.headers)) {
					if (Array.isArray(v)) v.forEach((vi) => headers.append(k, vi));
					else if (v) headers.set(k, String(v));
				}
				let body;
				if (req.method !== 'GET' && req.method !== 'HEAD') {
					const chunks = [];
					for await (const chunk of req) chunks.push(chunk);
					body = Buffer.concat(chunks);
				}
				const response = await app.fetch(new Request(url, { method: req.method, headers, body }));
				const respHeaders = {};
				response.headers.forEach((v, k) => {
					respHeaders[k] = v;
				});
				res.writeHead(response.status, respHeaders);
				const buf = Buffer.from(await response.arrayBuffer());
				res.end(buf);
			} catch (e) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end(String(e));
			}
		} else {
			vite.middlewares(req, res);
		}
	});

	server.listen(PORT, '127.0.0.1', () => {
		console.log(`\n  ❀ my-blog CMS`);
		console.log(`  Local:   http://localhost:${PORT}/`);
		console.log(`  Project: ${PROJECT_ROOT}\n`);
	});
}

main().catch((e) => {
	console.error('Fatal:', e);
	process.exit(1);
});
