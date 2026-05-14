// 中文友好的字数 + 阅读时长计算
// 中文按字符数算（约 500 字/分钟），英文按单词数算（约 250 词/分钟）
export function calcReadingStats(body: string) {
	// 剥掉 frontmatter、code blocks 之外的 markdown 噪音可选——这里用最简洁版
	const text = body
		.replace(/```[\s\S]*?```/g, '') // 去掉代码块
		.replace(/`[^`]*`/g, '') // 去掉行内代码
		.replace(/!\[.*?\]\(.*?\)/g, '') // 去掉图片
		.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // 链接保留文本

	const cjk = (text.match(/[一-龥]/g) ?? []).length;
	const englishWords = text
		.replace(/[一-龥]/g, ' ')
		.split(/\s+/)
		.filter((w) => /[a-zA-Z0-9]/.test(w)).length;

	const wordCount = cjk + englishWords;
	const minutes = cjk / 500 + englishWords / 250;
	const readingTime = Math.max(1, Math.ceil(minutes));
	return { wordCount, readingTime };
}
