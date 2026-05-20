// marked v15 自定义块：让预览支持 :::info / :::tip / :::warning / :::danger / :::spoiler / :::fold[title]
// 对应 my-blog 的 plugins/remark-shoka-directives.mjs（remark 端），这里是浏览器内的快速等效实现
// 注意：完整渲染（含 mermaid / figure / shiki 高亮）请走 astro build；预览只覆盖 95% 视觉

const FOLD_RE = /^:::fold(?:\[([^\]]*)\])?\s*\n([\s\S]*?)\n:::/;
const DIRECTIVE_RE = /^:::(info|tip|warning|danger|spoiler)\s*\n([\s\S]*?)\n:::/;

function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, (c) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	})[c]);
}

export const shokaDirectiveExtension = {
	extensions: [
		{
			name: 'shokaDirective',
			level: 'block',
			start(src) {
				const m = src.match(/^:::(info|tip|warning|danger|spoiler|fold)/m);
				return m ? m.index : undefined;
			},
			tokenizer(src) {
				let fold = FOLD_RE.exec(src);
				if (fold) {
					const tokens = [];
					this.lexer.blockTokens(fold[2], tokens);
					return {
						type: 'shokaDirective',
						raw: fold[0],
						directive: 'fold',
						title: fold[1] || '展开',
						tokens,
					};
				}
				const m = DIRECTIVE_RE.exec(src);
				if (m) {
					const tokens = [];
					this.lexer.blockTokens(m[2], tokens);
					return {
						type: 'shokaDirective',
						raw: m[0],
						directive: m[1],
						title: null,
						tokens,
					};
				}
			},
			renderer(token) {
				const body = this.parser.parse(token.tokens);
				if (token.directive === 'fold') {
					return `<details class="fold-block"><summary>${escapeHtml(token.title)}</summary>${body}</details>`;
				}
				if (token.directive === 'spoiler') {
					return `<div class="spoiler-block" tabindex="0">${body}</div>`;
				}
				return `<aside class="callout callout-${token.directive}">${body}</aside>`;
			},
		},
	],
};
