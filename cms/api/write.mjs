// 保存博文：gray-matter stringify + 写文件。沿用 read.mjs 的 isPostIdSafe 校验
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { isPostIdSafe } from './read.mjs';

const CONTENT_DIR = 'src/content/blog';

export async function writePost(projectRoot, payload) {
	const { id, frontmatter, content } = payload || {};
	if (!isPostIdSafe(id)) throw new Error(`不安全或非法的 id: ${id}`);
	if (typeof content !== 'string') throw new Error('content 必须是字符串');
	if (frontmatter == null || typeof frontmatter !== 'object') {
		throw new Error('frontmatter 必须是对象');
	}
	// 清掉空值：避免 frontmatter 里残留 description: '' 这种空字段
	const cleaned = {};
	for (const [k, v] of Object.entries(frontmatter)) {
		if (v === '' || v == null) continue;
		if (Array.isArray(v) && v.length === 0) continue;
		cleaned[k] = v;
	}
	const raw = matter.stringify(content, cleaned);
	const filePath = join(projectRoot, CONTENT_DIR, id);
	await writeFile(filePath, raw, 'utf8');
	return { id, bytes: raw.length, savedAt: new Date().toISOString() };
}
