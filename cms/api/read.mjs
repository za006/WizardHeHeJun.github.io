// 读单篇博文：返回 raw / frontmatter / content
import { readFile } from 'node:fs/promises';
import { join, isAbsolute } from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = 'src/content/blog';

// 安全：拒绝 .. / 绝对路径 / null byte / 非 md|mdx 后缀 / 非法字符
export function isPostIdSafe(id) {
	if (!id || typeof id !== 'string') return false;
	if (id.includes('..') || isAbsolute(id) || id.includes('\0')) return false;
	if (!/^[\w一-龥\- ]+\.(md|mdx)$/.test(id)) return false;
	return true;
}

export async function readPost(projectRoot, id) {
	if (!isPostIdSafe(id)) throw new Error(`不安全或非法的 id: ${id}`);
	const filePath = join(projectRoot, CONTENT_DIR, id);
	const raw = await readFile(filePath, 'utf8');
	const parsed = matter(raw);
	return {
		id,
		raw,
		content: parsed.content,
		frontmatter: parsed.data,
	};
}
