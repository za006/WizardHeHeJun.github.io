// 实时预览：marked + shokaDirective 扩展。预览覆盖 ~95% 视觉
// 不在此处做 mermaid / shiki / figure remark plugin 等价——那些等 astro build 验证
import { useMemo } from 'preact/hooks';
import { Marked } from 'marked';
import { shokaDirectiveExtension } from '../lib/marked-directives.js';

// 单例 Marked，绑定扩展
const marked = new Marked({ gfm: true, breaks: false });
marked.use(shokaDirectiveExtension);

export function MarkdownPreview({ source }) {
	const html = useMemo(() => {
		try {
			return marked.parse(source || '', { async: false });
		} catch (e) {
			return `<div class="preview-error">渲染错误: ${escapeHtml(e.message)}</div>`;
		}
	}, [source]);

	return (
		<div class="markdown-preview prose-like" dangerouslySetInnerHTML={{ __html: html }} />
	);
}

function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, (c) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	})[c]);
}
