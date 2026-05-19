// 把段落里独占一行的 ![alt](src) 包成 <figure class="prose-figure"><img><figcaption>alt</figcaption></figure>
// - 段落只含一个 image 节点 + alt 非空时才转（保留普通 inline 图片不变）
// - 保留原 image 节点让 Astro 继续走 Image 优化（webp/lazy load）
// - 配套 .prose .prose-figure CSS（global.css）+ 客户端 lightbox（BlogPost.astro 末尾脚本）
import { visit } from 'unist-util-visit';

export default function remarkFigure() {
	return (tree) => {
		visit(tree, 'paragraph', (node) => {
			if (!node.children || node.children.length !== 1) return;
			const img = node.children[0];
			if (img.type !== 'image') return;
			const alt = (img.alt || '').trim();
			if (!alt) return; // 无 alt：保留原样不转 figure

			// 把 paragraph 渲染成 figure，children 多加一个 figcaption
			const data = node.data || (node.data = {});
			data.hName = 'figure';
			data.hProperties = { className: ['prose-figure'] };

			node.children = [
				img,
				{
					type: 'paragraph',
					data: { hName: 'figcaption' },
					children: [{ type: 'text', value: alt }],
				},
			];
		});
	};
}
