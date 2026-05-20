// 把 frontmatter 拆成结构化表单字段。CATEGORIES 与 scripts/new-post.mjs 保持一致
const CATEGORIES = ['项目分享', '技术笔记', '学习总结', '生活随笔', '碎碎念'];

export function FrontmatterForm({ value, onChange }) {
	const fm = value || {};
	function update(key, val) {
		onChange({ ...fm, [key]: val });
	}

	return (
		<section class="frontmatter-form">
			<div class="form-row">
				<label>title</label>
				<input
					type="text"
					value={fm.title || ''}
					onInput={(e) => update('title', e.currentTarget.value)}
					placeholder="文章标题"
				/>
			</div>
			<div class="form-row">
				<label>description</label>
				<input
					type="text"
					value={fm.description || ''}
					onInput={(e) => update('description', e.currentTarget.value)}
					placeholder="~30 字内简介"
				/>
			</div>
			<div class="form-row">
				<label>category</label>
				<select
					value={fm.category || ''}
					onChange={(e) => update('category', e.currentTarget.value)}
				>
					<option value="">（未分类）</option>
					{CATEGORIES.map((c) => (
						<option value={c} key={c}>
							{c}
						</option>
					))}
				</select>
			</div>
			<div class="form-row">
				<label>tags</label>
				<input
					type="text"
					value={Array.isArray(fm.tags) ? fm.tags.join(', ') : ''}
					onInput={(e) =>
						update(
							'tags',
							e.currentTarget.value
								.split(',')
								.map((t) => t.trim())
								.filter(Boolean)
						)
					}
					placeholder="逗号分隔：astro, blog, 写作"
				/>
			</div>
			<div class="form-row">
				<label>pubDate</label>
				<input
					type="text"
					value={fm.pubDate || ''}
					onInput={(e) => update('pubDate', e.currentTarget.value)}
					placeholder="May 14 2026"
				/>
			</div>
			<div class="form-row">
				<label>heroImage</label>
				<input
					type="text"
					value={fm.heroImage || ''}
					onInput={(e) => update('heroImage', e.currentTarget.value)}
					placeholder="../../assets/blog/foo.jpg（可空）"
				/>
			</div>
			<div class="form-row inline-checks">
				<label class="check">
					<input
						type="checkbox"
						checked={!!fm.featured}
						onChange={(e) => update('featured', e.currentTarget.checked)}
					/>
					featured 📌
				</label>
				<label class="check">
					<input
						type="checkbox"
						checked={!!fm.draft}
						onChange={(e) => update('draft', e.currentTarget.checked)}
					/>
					draft
				</label>
			</div>
		</section>
	);
}
