// 把 remark-directive 解析出的 containerDirective（:::name）转成对应 HTML：
// :::info / :::tip / :::warning / :::danger → <aside class="callout callout-{name}">
// :::spoiler                                 → <div class="spoiler" tabindex="0">
// :::fold[标题]                              → <details class="fold"><summary>标题</summary>...
import { visit } from 'unist-util-visit';

const CALLOUTS = new Set(['info', 'tip', 'warning', 'danger']);

export default function remarkShokaDirectives() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type !== 'containerDirective') return;
			const name = node.name;
			const data = node.data || (node.data = {});

			if (CALLOUTS.has(name)) {
				data.hName = 'aside';
				data.hProperties = { className: ['callout', `callout-${name}`] };
				return;
			}

			if (name === 'spoiler') {
				data.hName = 'div';
				data.hProperties = { className: ['spoiler'], tabindex: '0' };
				return;
			}

			if (name === 'fold') {
				data.hName = 'details';
				data.hProperties = { className: ['fold'] };

				const labelIdx = node.children.findIndex(
					(c) => c.type === 'paragraph' && c.data && c.data.directiveLabel,
				);
				const summaryChildren =
					labelIdx !== -1
						? node.children.splice(labelIdx, 1)[0].children
						: [{ type: 'text', value: '展开' }];
				node.children.unshift({
					type: 'paragraph',
					data: { hName: 'summary' },
					children: summaryChildren,
				});
				return;
			}

			// 兜底：未识别的 directive，渲染为带 class 的 div，避免内容被静默丢弃
			data.hName = 'div';
			data.hProperties = { className: ['directive', `directive-${name}`] };
		});
	};
}
