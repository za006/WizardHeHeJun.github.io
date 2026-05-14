---
title: '我用 Astro + GitHub Pages 搭了这个博客'
description: '从零搭起来的全过程——技术选型、踩过的坑、玻璃风、Pagefind 搜索、音乐播放器、鼠标拖尾……一次 commit 半天的折腾日记。'
pubDate: 'May 14 2026'
updatedDate: 'May 14 2026'
featured: true
heroImage: '../../assets/blog/building-this-blog.jpg'
category: '项目分享'
tags: ['Astro', 'GitHub Pages', '博客', '毛玻璃', 'Pagefind', '霞鹜文楷']
---

## 为什么要搭博客

很多想法、踩过的坑、灵光乍现的瞬间，如果不写下来就会被时间冲走。比起依赖记忆力对抗遗忘，把它们交给文字更靠谱——这就是有了这个小角落的初衷。

## 选型

短暂调研后定了 **Astro + GitHub Pages + GitHub Actions** 三件套：

- **Astro 6**：静态站点生成器，主打"少 JS、快加载"。适合内容型站点
- **GitHub Pages**：免费托管，对 `<用户名>.github.io` 仓库还有特殊待遇——直接挂在主域名下，无子路径
- **GitHub Actions**：推到 `main` 分支即自动构建部署，全程零运维

对比过 Hugo、WordPress、Hexo——Astro 胜在 Markdown 写作 + 现代主题生态 + 想加 React/Vue/Svelte 组件也无缝。

## 第一阶段：能跑起来

```bash
npx create-astro@latest my-blog --template blog --install --git
```

生成骨架后做的事：

1. **中文化**：`<html lang>` 改 `zh-CN`、日期格式用 `toLocaleDateString('zh-CN')`、导航文案全部换中文
2. **GitHub Actions workflow**：official 版本踩了一个坑——**Astro 6 要求 Node 22+，但 `withastro/action@v3` 默认用 Node 20**，必须显式写 `node-version: 22`
3. **社交图标**：GitHub、哔哩哔哩、X 的 SVG path 直接嵌在 Header / Footer 里
4. **自定义 favicon**：用 `sharp`（Astro 自带依赖）从一张头像生成 16/32/192 + apple-touch 四个尺寸
5. **毛玻璃主题**：全屏背景图 + `backdrop-filter: blur(18px) saturate(180%)`——所有内容卡片透出底层背景

## 第二阶段：从「能用」升级到「好用」

参考了 [xhblog.top](https://xhblog.top)，一次性补齐了 11 个功能（分 8 个 commit 推上去）：

### 内容组织

- **分类系统**：5 个枚举（项目分享 / 技术笔记 / 学习总结 / 生活随笔 / 碎碎念），写在 `content.config.ts` 里强类型校验，写错文件名构建直接挂
- **标签系统**：每篇 3-5 个 tag，自动生成 `/tags/<tag>` 页 + 标签云
- **阅读时长 + 字数**：自己写的 `calcReadingStats(body)` 工具，**中文按字符数 / 500 字一分钟，英文按词数 / 250**——不依赖 `reading-time` 包，因为它只算英文不友好

### UX 升级

- **博客列表卡显示摘要**：用 `description` frontmatter 字段，CSS `-webkit-line-clamp: 2` 限两行
- **侧边栏**：Profile + Stats（实时算 `getCollection` 长度）+ 最近 5 篇文章
- **分页**：`getStaticPaths({ paginate })` + 自定义 Pagination 组件，每页 6 篇
- **戏剧版 404 页**：「**4 [Elysia 头像] 4**」三位一体，浮动动画 + 飘动星星 + 渐变文字
- **友链页**：JSON 数据驱动，附带申请说明

### 重头戏：搜索 + 主题音乐

- **Pagefind 静态搜索**：`astro-pagefind` integration，构建时生成全文索引，**零运维**——比 Algolia / 自建 ES 优雅多了
- **搜索改成 overlay popover**：右上 🔍 按钮点击从 header 下方弹出 460px 浮窗（fade + scale 200ms 动画），ESC / 点背景关闭，按 `/` 全局打开
- **APlayer + MetingJS 音乐播放器**：CDN 加载，固定右下角 mini 模式，默认 ACG 公共歌单，可换网易云任意歌单 ID

### 字体 + 互动小巧思

- **霞鹜文楷 (LXGW WenKai Screen)** via jsDelivr CDN——按字符 chunk 拆分，浏览器只下载页面用到的字符块，不会一次拉 10MB
- **鼠标拖尾**：节流到 28fps，最多 12 个旋转小方块（粉/紫/蓝三色循环），500ms 淡出，**自动跳过触屏设备 + `prefers-reduced-motion`**
- **二级 dropdown**：「分类」「标签」收进「博客 ▾」hover 菜单，主导航更清爽
- **置顶机制**：schema 加 `featured: boolean`，列表排序「featured 优先 → 再按 pubDate 倒序」，列表卡带 📌 置顶徽章

### 首页 + 关于页改造

最后的最后，参考 [yanbowa.ng](https://yanbowa.ng/) 把首页和关于页都改成了**多 section 玻璃卡**布局：

- **首页 hero**：打字机问候（爱莉希雅口吻随机抽）+ Elysia 头像 + 名字 + 4 个身份 pill + 强调 callout + 双按钮
- **首页 Now 区**：4 张「现在在干嘛」小卡，仿 yanbowa 的 `/now` 页风格
- **关于页 6 个 section**：Hero / 你好 / 工具箱 / 主要项目 / 日常碎碎念 / 关于这个站

## 踩过最坑的 5 件事

1. **PowerShell 不让跑 npm**：Windows 默认禁脚本，`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 解决
2. **PowerShell `--` 参数传递有问题**：`npm create astro@latest -- --template blog ...` 的 flag 传不进去，要用 `npx --yes create-astro@latest ...` 直接调绕开
3. **Astro `<Image>` 自动裁剪会切脸**：竖版人像图被裁成横版时 `position="attention"` 算法会被装饰物吸引跳过脸——最稳的办法是**用 sharp 写个 `crop-hero.mjs` 预裁源图为「脸居中横版」**，再让 Astro 默认 center 裁剪
4. **Pagefind 的 import 在 build 时报 Vite 错**：`/pagefind/pagefind.js` 是构建后生成的，Vite 在构建时找不到——必须用 `<script is:inline>` 包裹动态 import
5. **背景图放 `public/` 还是 `src/assets/`**：选 `src/assets/`，CSS 里写 `url('../assets/bg.jpg')`——Vite 自动打包 + 加哈希，缓存破坏免费送

## 未来想加的

- 暗色模式
- Giscus 评论（基于 GitHub Issues，零维护）
- 文章 TOC 目录
- RSS 订阅按钮（feed 已经有了，缺入口）
- 数学公式 / mermaid 图支持

代码全部开源：[github.com/WizardHeHeJun/WizardHeHeJun.github.io](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io)

完整项目结构和自定义指南都在 README 里。如果你也想搭一个，欢迎 fork。

---

> 📝 **更新记录**
> - 2026-05-14 初版：Astro + GitHub Pages + 玻璃风 + favicon + 中文化
> - 2026-05-14 二版：补充 11 个功能升级、首页/关于页改造、5 个踩坑总结
