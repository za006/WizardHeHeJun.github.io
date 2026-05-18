---
name: blog-post
description: 帮助在 WizardHeHeJun's Notes 博客创建新博文。调用 `npm run new` scaffold，引导填 frontmatter（5 类枚举分类 + 标签 + 置顶），按文章类型给结构模板，主动建议 Shoka markdown directives（callout/spoiler/fold），辅助找 hero 图（safebooru），最后跑 build + 提示 git push。复用 CLAUDE.md 全套约定。使用场景：写一篇博文、写博客、新博文、记录一下、想发个 post、new post、create blog post。只在 d:/bot/my-blog 项目内工作。
---

# Blog Post Skill

按 WizardHeHeJun's Notes（爱莉希雅人格、玻璃风、Astro 6 + GitHub Pages）的规范写新博文。仅当 cwd 是 `d:/bot/my-blog` 时启用。

## 工作流（5 步）

### 1. 理解主题 + 选分类

问清：标题、主题概述、分类（5 选 1）、是否置顶（默认否）。

**5 个固定分类**（schema 写死在 [src/content.config.ts](../../../src/content.config.ts)）：

| 分类 | 适用 |
|------|------|
| 项目分享 | 自己做的项目（GitHub 项目、技术尝试） |
| 技术笔记 | 技术学习、踩坑、深度笔记 |
| 学习总结 | 读书/课程/集中学习的 takeaway |
| 生活随笔 | 旅行、社交、生活观察 |
| 碎碎念 | 不严肃的小思考、emo、片段 |

模棱两可时**优先问用户**，不替选。

### 2. 跑 `npm run new` scaffold

**不要手写 frontmatter**——schema enum 容易踩错。`npm run new` 自动处理 slug 冲突 + pubDate 格式。

- **TTY 模式**（用户在终端）：直接 `npm run new`
- **Piped 模式**（你在 Bash 工具里）：
  ```bash
  printf '<title>\n<slug>\n<cat-num>\n<tags-csv>\n<y/n>\n<desc>\n' | npm run new
  ```
  字段顺序：title / slug / category(1-5) / tags / featured / description。空回车 = 用默认 fallback。

### 3. 协作起草

**正文用户主导，你不替写**。Read [references/article-templates.md](references/article-templates.md) 按分类挑结构模板给用户参考。你只做：
- 结构建议
- 节奏 / 语气 review
- 错别字 / 病句修订

### 4. 建议 Shoka markdown directives

写正文时**主动建议**用 callout / spoiler / fold 加层次。详细语法 + 何时用见 [references/shoka-syntax.md](references/shoka-syntax.md)。

### 5. Hero 图 + 校验 + push

- **要配图**：Read [references/hero-image-safebooru.md](references/hero-image-safebooru.md) 走 safebooru 找图 + Read 校验 + 必要时预裁。
- **校验**：`npm run build`（prebuild 自动重生 lqip.json，**不用手动**跑 gen-lqip）
- **Push**：
  ```bash
  git add src/content/blog/<slug>.md src/assets/blog/<slug>.jpg src/data/lqip.json
  git commit -m "post: <文章标题>"
  git push
  ```
  CI ~40-50s 部署完成。

## 重要约束

1. **[CLAUDE.md](../../../CLAUDE.md) 是真相源** —— skill 与 CLAUDE.md 不一致时以 CLAUDE.md 为准
2. **正文用户主导** —— 不替写完整正文，只辅助结构 / review / 修订
3. **`npm run build` 验证再 push** —— 不推未构建过的代码
4. **commit 不带 `Co-Authored-By: Claude`**（除非用户明说要）
5. **二次元图必须 Read 工具看图确认** —— 不要凭 tag 推断
6. **代码注释 / commit / PR title 用英文，正文 / UI / 解释用中文**
7. **小心 `.md` vs `.mdx` 的 remarkPlugins 分开**（CLAUDE.md §39）——当前全是 `.md`，不要随便建 `.mdx`

## 不该做的事

- ❌ 替用户写完整正文（剥夺创作）
- ❌ 强制按你的结构写（建议而非命令）
- ❌ 跳过 `npm run new` 自己手写 frontmatter
- ❌ push 前不跑 build
- ❌ 用 Safebooru 之外的找图站
- ❌ 没经 Read 工具看图直接拿 tag 推断的图
- ❌ commit 带 `Co-Authored-By: Claude`

## 示例对话

3 个典型场景的判断练习见 [references/examples.md](references/examples.md)：用户给主题 / 用户没头绪 / 用户要置顶 + 配图。
