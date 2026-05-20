// 列举所有博文：扫 src/content/blog/*.{md,mdx}，gray-matter 解 frontmatter
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = 'src/content/blog';

export async function listPosts(projectRoot) {
	const dir = join(projectRoot, CONTENT_DIR);
	const files = await readdir(dir);
	const mdFiles = files.filter((f) => /\.(md|mdx)$/.test(f));

	const posts = await Promise.all(
		mdFiles.map(async (filename) => {
			const filePath = join(dir, filename);
			const [raw, st] = await Promise.all([readFile(filePath, 'utf8'), stat(filePath)]);
			let data = {};
			try {
				({ data } = matter(raw));
			} catch (e) {
				data = { _parseError: e.message };
			}
			return {
				id: filename,
				title: String(data.title ?? filename),
				description: String(data.description ?? ''),
				category: String(data.category ?? ''),
				tags: Array.isArray(data.tags) ? data.tags : [],
				pubDate: String(data.pubDate ?? ''),
				featured: Boolean(data.featured),
				draft: Boolean(data.draft),
				heroImage: data.heroImage ?? null,
				mtime: st.mtimeMs,
				parseError: data._parseError ?? null,
			};
		})
	);

	// 排序：featured 优先，pubDate 倒序
	posts.sort((a, b) => {
		if (a.featured !== b.featured) return a.featured ? -1 : 1;
		const da = new Date(a.pubDate).getTime() || a.mtime;
		const db = new Date(b.pubDate).getTime() || b.mtime;
		return db - da;
	});

	return posts;
}
