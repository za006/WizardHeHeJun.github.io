export function PostList({ posts, selectedId, onSelect }) {
	if (posts.length === 0) {
		return <div class="post-list-empty">暂无文章</div>;
	}
	return (
		<ul class="post-list">
			{posts.map((post) => (
				<li
					key={post.id}
					class={`post-item ${selectedId === post.id ? 'active' : ''}`}
					onClick={() => onSelect(post.id)}
				>
					<div class="post-title">
						{post.featured && <span class="badge featured">📌</span>}
						{post.draft && <span class="badge draft">草稿</span>}
						<span>{post.title}</span>
					</div>
					<div class="post-meta">
						{post.category && <span class="cat">{post.category}</span>}
						<span class="date">{post.pubDate || '—'}</span>
					</div>
				</li>
			))}
		</ul>
	);
}
