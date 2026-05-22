// CodeMirror 6 包装：markdown 语法 + Ctrl/Cmd+S 保存 + 软换行
// 用 ref 防止 stale closure——onSave/onChange 总是调最新版本
import { useEffect, useRef } from 'preact/hooks';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { keymap } from '@codemirror/view';

export function CodeEditor({ value, onChange, onSave, apiRef }) {
	const containerRef = useRef(null);
	const viewRef = useRef(null);
	const onSaveRef = useRef(onSave);
	const onChangeRef = useRef(onChange);
	onSaveRef.current = onSave;
	onChangeRef.current = onChange;

	useEffect(() => {
		if (!containerRef.current) return;
		const view = new EditorView({
			state: EditorState.create({
				doc: value ?? '',
				extensions: [
					basicSetup,
					markdown(),
					EditorView.lineWrapping,
					keymap.of([
						{
							key: 'Mod-s',
							preventDefault: true,
							run: () => {
								onSaveRef.current?.();
								return true;
							},
						},
					]),
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							onChangeRef.current?.(update.state.doc.toString());
						}
					}),
				],
			}),
			parent: containerRef.current,
		});
		viewRef.current = view;
		if (apiRef) {
			apiRef.current = {
				scrollToLine(line) {
					const doc = view.state.doc;
					if (!line || line < 1 || line > doc.lines) return;
					const pos = doc.line(line).from;
					view.dispatch({
						selection: { anchor: pos },
						effects: EditorView.scrollIntoView(pos, { y: 'start', yMargin: 8 }),
					});
					view.focus();
				},
			};
		}
		return () => {
			view.destroy();
			viewRef.current = null;
			if (apiRef) apiRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// 外部 value 切换（切换文章时）→ 强制同步到编辑器
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		const current = view.state.doc.toString();
		if (current !== value) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: value ?? '' },
			});
		}
	}, [value]);

	return <div ref={containerRef} class="cm-editor-wrapper" />;
}
