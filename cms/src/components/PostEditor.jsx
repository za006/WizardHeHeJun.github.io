// 主编辑器：frontmatter form（可折叠）+ CodeMirror + 实时预览 + 保存 + VS Code 跳转
import { useState, useEffect, useCallback } from 'preact/hooks';
import { FrontmatterForm } from './FrontmatterForm.jsx';
import { CodeEditor } from './CodeEditor.jsx';
import { MarkdownPreview } from './MarkdownPreview.jsx';
import { openInEditor } from '../lib/editor-url.js';

export function PostEditor({ id, config, onDirtyChange }) {
	const [original, setOriginal] = useState(null);
	const [frontmatter, setFrontmatter] = useState({});
	const [content, setContent] = useState('');
	const [saving, setSaving] = useState(false);
	const [showForm, setShowForm] = useState(true);
	const [lastSavedAt, setLastSavedAt] = useState(null);
	const [error, setError] = useState(null);

	const isDirty =
		original != null &&
		(content !== original.content ||
			JSON.stringify(frontmatter) !== JSON.stringify(original.frontmatter));

	// 加载文章
	useEffect(() => {
		setOriginal(null);
		setError(null);
		fetch(`/api/cms/read?id=${encodeURIComponent(id)}`)
			.then((r) => r.json())
			.then((d) => {
				if (d.error) {
					setError(d.error);
				} else {
					setOriginal(d);
					setFrontmatter(d.frontmatter || {});
					setContent(d.content || '');
				}
			})
			.catch((e) => setError(e.message));
	}, [id]);

	// 上报 dirty 状态（让 App 在切换文章时给出提示）
	useEffect(() => {
		onDirtyChange?.(isDirty);
	}, [isDirty, onDirtyChange]);

	// 关闭前提醒
	useEffect(() => {
		if (!isDirty) return;
		function handler(e) {
			e.preventDefault();
			e.returnValue = '';
		}
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [isDirty]);

	const save = useCallback(async () => {
		if (!original || !isDirty || saving) return;
		setSaving(true);
		setError(null);
		try {
			const r = await fetch('/api/cms/write', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, frontmatter, content }),
			});
			const data = await r.json();
			if (data.error) throw new Error(data.error);
			setOriginal({ ...original, content, frontmatter });
			setLastSavedAt(data.savedAt || new Date().toISOString());
		} catch (e) {
			setError('保存失败: ' + e.message);
		} finally {
			setSaving(false);
		}
	}, [original, isDirty, saving, id, frontmatter, content]);

	// 全局 Ctrl+S 监听（form 里也能 ctrl+s，不光是 CodeMirror 内）
	useEffect(() => {
		function handler(e) {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				save();
			}
		}
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [save]);

	if (error && !original) return <div class="error">读取失败：{error}</div>;
	if (!original) return <div class="loading">加载中...</div>;

	const editors = config?.editors || [];
	const projectRoot = config?.projectRoot || '';

	return (
		<div class="post-editor">
			<header class="editor-header">
				<div class="header-title">
					{frontmatter.featured && <span class="badge featured">📌</span>}
					<h2>{frontmatter.title || id}</h2>
					{isDirty && (
						<span class="dirty-dot" title="未保存的修改">
							●
						</span>
					)}
					{!isDirty && lastSavedAt && <span class="saved-hint">已保存</span>}
				</div>
				<div class="header-actions">
					<button
						class="btn btn-primary"
						onClick={save}
						disabled={!isDirty || saving}
						title="Ctrl+S"
					>
						{saving ? '保存中...' : '💾 保存'}
					</button>
					{editors.map((e) => (
						<button
							class="btn btn-secondary"
							key={e.id}
							onClick={() => openInEditor(e, projectRoot, id)}
							title={`在 ${e.id} 中打开`}
						>
							⚙ {e.id}
						</button>
					))}
					<button
						class="btn btn-ghost"
						onClick={() => setShowForm(!showForm)}
						title={showForm ? '收起 frontmatter' : '展开 frontmatter'}
					>
						{showForm ? '▲' : '▼'} frontmatter
					</button>
				</div>
			</header>

			{showForm && (
				<FrontmatterForm value={frontmatter} onChange={setFrontmatter} />
			)}

			{error && original && <div class="error inline-error">{error}</div>}

			<div class="editor-split">
				<div class="pane pane-editor">
					<div class="pane-label">编辑（CodeMirror）</div>
					<CodeEditor value={content} onChange={setContent} onSave={save} />
				</div>
				<div class="pane pane-preview">
					<div class="pane-label">预览（marked + directives）</div>
					<MarkdownPreview source={content} />
				</div>
			</div>
		</div>
	);
}
