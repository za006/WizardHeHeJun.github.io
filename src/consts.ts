// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "WizardHeHeJun's Notes";
export const SITE_DESCRIPTION = '项目分享、技术笔记，和一些不想被时间冲走的碎碎念。';

// giscus 配置 — 4 个 ID 来自 https://giscus.app 配置器
// 一次性步骤：仓库开 Discussions → 装 https://github.com/apps/giscus → 在 giscus.app 拿 ID 填回这里
export const GISCUS = {
	repo: 'WizardHeHeJun/WizardHeHeJun.github.io',
	repoId: 'R_kgDOSc_OIQ',
	category: 'Announcements',
	categoryId: 'DIC_kwDOSc_OIc4C9Gde',
} as const;
