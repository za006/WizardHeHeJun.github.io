// 构造 IDE 跳转 URL：vscode://file/{path}:{line}:{column} 类
// 跨平台：Windows 用正斜杠也接受（vscode://file/D:/bot/my-blog/...）
const CONTENT_DIR = 'src/content/blog';

export function buildFilePath(projectRoot, postId) {
	// 强制正斜杠 — Windows 反斜杠会破坏 URL scheme
	const normalized = projectRoot.replace(/\\/g, '/');
	return `${normalized}/${CONTENT_DIR}/${postId}`;
}

export function buildEditorUrl(editor, filePath, line = 1, column = 1) {
	if (!editor || !editor.urlTemplate) return null;
	return editor.urlTemplate
		.replace('{path}', filePath)
		.replace('{line}', String(line))
		.replace('{column}', String(column));
}

export function openInEditor(editor, projectRoot, postId) {
	const filePath = buildFilePath(projectRoot, postId);
	const url = buildEditorUrl(editor, filePath);
	if (!url) return;
	window.open(url, '_blank');
}
