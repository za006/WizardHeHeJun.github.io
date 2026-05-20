import { useState, useEffect, useCallback } from 'preact/hooks';
import { PostList } from './components/PostList.jsx';
import { PostEditor } from './components/PostEditor.jsx';

export function App() {
	const [posts, setPosts] = useState([]);
	const [selectedId, setSelectedId] = useState(null);
	const [config, setConfig] = useState(null);
	const [loadError, setLoadError] = useState(null);
	const [isDirty, setIsDirty] = useState(false);

	useEffect(() => {
		fetch('/api/cms/list')
			.then((r) => r.json())
			.then((d) => {
				if (d.error) setLoadError(d.error);
				else setPosts(d.posts || []);
			})
			.catch((e) => setLoadError(e.message));
		fetch('/api/cms/config')
			.then((r) => r.json())
			.then(setConfig)
			.catch(() => {});
	}, []);

	const handleSelect = useCallback(
		(id) => {
			if (id === selectedId) return;
			if (isDirty && !confirm('当前文章有未保存的修改，确定切换吗？')) return;
			setSelectedId(id);
		},
		[isDirty, selectedId]
	);

	return (
		<div class="cms-shell">
			<aside class="cms-sidebar">
				<header class="sidebar-head">
					<h1>❀ my-blog CMS</h1>
					<div class="sub">
						{posts.length} 篇 · Phase 2B
						{isDirty && <span class="dirty-inline" title="有未保存的修改"> ●</span>}
					</div>
				</header>
				{loadError ? (
					<div class="error">加载失败：{loadError}</div>
				) : (
					<PostList posts={posts} selectedId={selectedId} onSelect={handleSelect} />
				)}
			</aside>
			<main class="cms-main">
				{selectedId ? (
					<PostEditor
						id={selectedId}
						config={config}
						onDirtyChange={setIsDirty}
						key={selectedId}
					/>
				) : (
					<div class="empty">
						<div class="empty-icon">📝</div>
						<div>左侧选一篇文章开始编辑</div>
					</div>
				)}
			</main>
		</div>
	);
}
