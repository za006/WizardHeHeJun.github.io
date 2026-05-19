---
title: '让博客学会画图——给 .md 嵌入 antv infographic'
description: '从零集成 @antv/infographic，让博文里写 ```infographic 代码块直接渲染玻璃风 SVG'
pubDate: 'May 19 2026'
category: '技术笔记'
tags: ['astro', 'remark', 'antv', 'infographic', 'svg']
# heroImage: '../../assets/blog/infographic-demo.jpg'
---

呐～悄悄告诉你，今天给博客加了一项小能力——写博文时插一段 ```infographic 代码块，build 出来就是一张玻璃风的内联 SVG。整个流程零运行时 JS、不依赖 React、跟现有的 7 篇旧博文也不会打架。

## 缘起：Mermaid 行，但不可爱

之前我装过一会 mermaid，效果是 OK 的，但跟整站的「米哈游系水彩透亮」气质有点冲——mermaid 默认那种工程线条感比较硬。我想要的是「画图也能像玻璃卡一样柔」。

正好看到 cosZone 的 [astro-koharu](https://github.com/cosZone/astro-koharu) 项目规划了一整套基于 [@antv/infographic](https://infographic.antv.vision/) 的信息图能力（[`.claude/skills/infographic-*`](https://github.com/cosZone/astro-koharu/tree/main/.claude/skills) 一共 5 个 skill）——可惜对方只写了 spec，渲染管线和示例博文都没真的实现。我就把这条路替他探完了。

## 真正能跑的，是这样的

下面就是真东西——一段 antv pie chart，配色是站点的 `--accent` 蓝 + 粉色胶囊系列：

```infographic
template: chart-pie-plain-text
data:
  items:
    - value: 45
      label: 写作
    - value: 25
      label: 调试
    - value: 18
      label: 找图
    - value: 12
      label: 喝茶发呆
```

这段代码我什么都没多写——`themeConfig` 留空，plugin 自动给我注入了玻璃风调色板 `[#2337ff, #ff5d8f, #66ccff, #ffd1e4, #b8860b]` 和 LXGW 文楷字体。

## 想换主题色？写 themeConfig 就好

如果某天想要一张「警告系」的图，手动覆盖一下 `themeConfig`：

```infographic
template: chart-pie-plain-text
data:
  items:
    - value: 60
      label: 已修
    - value: 40
      label: 待修
themeConfig:
  palette: ['#ff6b6b', '#4ecdc4']
```

plugin 检测到你写了 `themeConfig` 就跳过自动注入，把决定权交给你。

## 出错也不会把 build 弄崩

我故意写一段语法坏掉的，看降级：

```infographic
template: chart-pie-plain-text
data:
  items: [{invalid yaml here
```

上面这块在 build 时被 plugin 的 try/catch 兜住，输出成 `.infographic-error` figure（一个带红边的容器，显示原 DSL 和错误信息），**build 继续不挂**。这点很关键——以前 mermaid 那阵，写错一个字 GitHub Actions 就红一片。

## 怎么实现的

整件事的核心其实就两个文件：

:::fold[实现细节·点开看]
**[`plugins/remark-infographic.mjs`](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io/blob/main/plugins/remark-infographic.mjs)** 大约 110 行，做这几件事：

1. 第一遍 `visit()` 同步遍历 mdast，收集所有 `lang === 'infographic'` 的 code block
2. 每块 body 用 `js-yaml` parse 成 object（YAML 比 JSON 对人友好太多）
3. 若 `themeConfig` 没写，自动 prepend `GLASS_THEME_CONFIG`
4. `await Promise.all(...renderToString...)` 并行调用 antv SSR
5. 第二遍同步把每个原 code 节点替换成 mdast `html` 节点（裸 SVG 字符串）

为啥要两遍？因为 unist 的 `visit` 是同步的，但 antv SSR 是异步——经典的 unified 异步插件模式。

**[`astro.config.mjs`](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io/blob/main/astro.config.mjs)** 顺手修了 `CLAUDE.md` §39 提的隐患：之前我们在 `markdown.remarkPlugins` 里注册的 plugin 不会自动给 `.mdx` 用。这次把它们提成共享数组，同时塞到 `mdx({ remarkPlugins })` 和 `markdown.remarkPlugins`——这样 Shoka directives 和 infographic 在两种格式里都生效。

:::tip
顺手修一个埋雷比专门排查时机更省力。如果你也在维护 Astro 站，记得检查一下顶层 `markdown.remarkPlugins` 是不是漏了 mdx integration。
:::
:::

## 给后来者

如果你想抄这套做法到自己的 Astro 博客：

:::info
1. `npm i @antv/infographic`（v0.3.19 我跑通了 SSR `renderToString`）
2. 复制 [`plugins/remark-infographic.mjs`](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io/blob/main/plugins/remark-infographic.mjs)，按需改 `GLASS_THEME_CONFIG`
3. `astro.config.mjs` 同时给 `markdown.remarkPlugins` 和 `mdx({ remarkPlugins })` 注册——别漏 mdx
4. `global.css` 加个 `.infographic` figure 容器样式，包成你想要的视觉
5. 想要 skill 联动写作流程，看 [`.claude/skills/infographic-*`](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io/tree/main/.claude/skills) 5 个目录
:::

antv 的 276 个内置模板都能直接用 —— `list-grid-badge-card` 适合介绍页、`sequence-timeline-rounded-rect-node` 适合做项目时间线、`compare-quadrant-quarter-simple-card` 做四象限分析超合适。

## 接下来

下次写「项目分享」类博文，我会试着用 `:::fold` 收技术细节、用 ```infographic 画结构图。如果你想看哪类图怎么画，悄悄告诉我哦～
