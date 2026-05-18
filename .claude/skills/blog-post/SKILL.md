---
name: blog-post
description: 帮助在 WizardHeHeJun's Notes 博客创建新博文。调用 `npm run new` 交互式 scaffold，引导填 frontmatter（5 类枚举分类 + 标签 + 置顶），建议合适的 hero 图和 Shoka markdown directives（callout/spoiler/fold），最后跑 build 验证 + 提示 git push。复用 CLAUDE.md 全套约定（玻璃风、爱莉希雅人格、safebooru 二次元找图模板）。使用场景：写一篇博文、写博客、新博文、记录一下、想发个 post、new post、create blog post。只在 d:/bot/my-blog 项目内工作。
---

# Blog Post Skill

帮助按 WizardHeHeJun's Notes（爱莉希雅人格、玻璃风、Astro 6 + GitHub Pages）的规范写新博文。

## 适用前提

仅当 cwd 是 `d:/bot/my-blog` 时启用。其他目录不要触发此 skill。

## 你的任务（5 步流程）

### Step 1: 理解主题 + 选分类

问清以下信息（如果用户没说）：
- **标题**（一句话，会进 frontmatter `title`）
- **主题概述**（一两句话，用于建议分类 + 起草大纲）
- **分类**（5 选 1，下方有详情）
- **是否置顶**（默认否，除非用户明说）

**5 个固定分类**（schema 写死在 [src/content.config.ts](src/content.config.ts) 的 enum）：

| 分类 | 适用 | 举例 |
|------|------|------|
| 项目分享 | 自己做的项目 | 「我用 X 搭了 Y」 |
| 技术笔记 | 技术学习、踩坑、深度笔记 | 「Astro scoped CSS 不下钻子组件」 |
| 学习总结 | 读书/课程/集中学习的 takeaway | 「读完《分布式系统》整理」 |
| 生活随笔 | 旅行、社交、生活观察 | 「上海五一两天」 |
| 碎碎念 | 不严肃的小思考、emo、片段 | 「今天写代码到三点了」 |

模棱两可时优先问用户，不要替选。

### Step 2: 跑 `npm run new`

**不要手写 frontmatter** —— `npm run new` 自动处理 schema 合法性 + slug 冲突检测 + pubDate 格式。

#### 交互式（用户在终端，TTY 模式）
```powershell
npm run new
# 然后用户依次回答 prompt
```

#### Piped 模式（在你的 Bash 工具里跑）
```bash
printf '<标题>\n<slug>\n<分类编号 1-5>\n<标签 csv>\n<y/n 置顶>\n<描述>\n' | npm run new
```

**字段顺序**：title / slug / category (1-5) / tags / featured / description。空字符串用回车（fallback 到默认值）。

**默认值规则**：
- slug：slugify(title) 去非 ASCII，全空则 `post-<timestamp>`
- 分类：默认 1（项目分享）
- 标签：默认空数组
- 置顶：默认 N
- 描述：默认 title 前 60 字

### Step 3: 协作起草内容

**关键原则：不要替用户写完整正文**。写作是用户的创作，你只做形式辅助：
- 给结构建议（按分类不同的模板）
- 主动建议 Shoka directives 增加可读性
- 用户写完后帮 review 节奏 / 语气 / 错别字

#### 三种文章结构模板

**项目分享**：
```markdown
## 缘起
[为什么做这个 / 解决什么痛点]

## 怎么做的
[关键技术决策 + 踩坑]

## 效果
[截图 / 数字 / 自己用的体验]

## 给后来者
[文档 / 仓库链接 / 待办]
```

**技术笔记**：
```markdown
## 背景
[遇到了什么]

## 探索过程
[尝试了什么 / 哪些不行]

## 解决方案
[最终做法 + 原理]

## 沉淀
[下次遇到类似的怎么办]
```

**碎碎念**：随意，可以一段到底。
- 用 `:::spoiler` 藏私密想法
- 用 `:::fold[标题]` 收题外话

### Step 4: Shoka markdown directives 速查

写正文时**主动建议**用：

````markdown
:::info / :::tip / :::warning / :::danger
四色 callout 块，加视觉层次
:::

:::spoiler
剧透 / 私密想法，点击或聚焦解锁
:::

:::fold[标题]
折叠题外话，原生 <details>，无 JS。标题可省略默认「展开」。
:::
````

**何时建议使用**：
- 技术笔记里「踩过的坑」`→ :::warning`
- 项目分享里「关键决策」`→ :::tip`
- 任何文章里「不想被搜索引擎过分抓但想留下的话」`→ :::spoiler`
- 任何文章里「题外话不打断主线」`→ :::fold[标题]`

实现细节见 [plugins/remark-shoka-directives.mjs](plugins/remark-shoka-directives.mjs)，渲染规则见 [src/styles/global.css](src/styles/global.css) `.prose .callout-*`。

### Step 5: 加 hero 图 + 校验 + push

#### Hero 图（如果用户要配图）

按 CLAUDE.md §2 的二次元找图模板（详见 [CLAUDE.md](CLAUDE.md#L66-L84)）：

- **必须用 Safebooru**：`https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=...&json=1`
- **黄金 tags 组合**：
  ```
  1girl + solo + upper_body + looking_at_viewer + smile + <topic>
  排除：-from_behind -from_side -1boy -character_name -sample_watermark -comic -happy_birthday
  ```
- **必须 Read 工具看图确认露脸** —— LLM 基于 tag 推断常常出错（CLAUDE.md §2 用户多次强调）
- 拖到 `src/assets/blog/<slug>.jpg`
- 取消 frontmatter 里 `# heroImage:` 那行的 `#`
- prebuild 自动重生 lqip.json，**不用手动跑** gen-lqip
- 竖图必须先用 `node scripts/crop-hero.mjs` 预裁（在脚本数组里加目标），否则 Astro Image 的 attention 算法会切到帽子/头发

#### 校验

```powershell
npm run build
```

- schema 错误 → 修 frontmatter（参考 [src/content.config.ts](src/content.config.ts)）
- markdown 错误 → 看输出哪一行
- 无 hero 图 OK（content collection schema 标了 optional）

#### Commit + Push

```powershell
git add src/content/blog/<slug>.md
# 若加了 hero 图：
git add src/assets/blog/<slug>.jpg src/data/lqip.json
git commit -m "post: <文章标题>"
git push
```

CI 通常 40-50s 部署完成。可以跑：
```powershell
gh run list --workflow "Deploy to GitHub Pages" --limit 1
```
查最新状态。

## 重要约束（必读）

1. **[CLAUDE.md](CLAUDE.md) 是真相源** —— skill 里的速查是摘要，与 CLAUDE.md 不一致时以 CLAUDE.md 为准
2. **正文用户主导** —— 你不替写完整正文，只辅助结构 / 改写 / 节奏 / 错别字 / 节奏建议
3. **必须 `npm run build` 验证再 push** —— 不要把未构建过的代码推上去
4. **commit message 不带 `Co-Authored-By: Claude`** —— 除非用户明说要（CLAUDE.md 工作流约定）
5. **二次元图必须 Read 工具看图确认** —— 用户对侧脸/背影/SAMPLE 水印图反复纠正过
6. **写代码注释 / commit / PR title 用英文，正文 / UI / 解释用中文** —— CLAUDE.md 用户偏好
7. **小心 Astro `.md` vs `.mdx` 的 remarkPlugins 分开**（CLAUDE.md §39）—— 当前所有博文是 `.md`，不要随便建 `.mdx` 否则 Shoka directives 不渲染

## 示例对话

### 示例 1：用户给了主题，你协作 scaffold + 起草

**用户**：「想写一篇博文，记录一下今天用 npm run new 这个 CLI 的体验」

**你的步骤**：
1. 判断分类：**技术笔记**（关于工具的体验，不是炫耀项目本身）。若 50/50 拿不准，问用户。
2. 跑：
   ```bash
   printf 'npm run new 用起来如何\nnpm-run-new-review\n2\ncli,scaffold,astro\nn\n一次 30 分钟把博文创建摩擦清零的体验\n' | npm run new
   ```
3. 提供大纲：
   ```
   ## 背景
   - 之前手动建 .md：frontmatter 漏字段、pubDate 格式错、slug 重复
   ## 探索过程
   - 评估过 pinyin-pro（300KB 拒绝）
   - readline.question 在 Node 22 piped EOF hang（坑）
   ## 解决方案
   - 自管理 stdin 行队列
   - 明确 prompt slug（拒绝丑陋拼音）
   ## 沉淀
   - 下次写带 CLI 的 Node 工具，避开 readline.question 直接用 stdin events
   ```
4. 用户写正文 → 你 review。可建议哪段题外话用 `:::fold[实现细节]` 收起。
5. 跑 build → 提示用户加 hero 图 / 直接 push。

### 示例 2：用户没头绪，先聊不要急着 scaffold

**用户**：「想写点什么但不知道写啥」

**你**：**不调** `npm run new`，先聊。问：「最近做了什么 / 学了什么 / 烦什么 / 想感谢谁？」让用户先发散，再判断该不该开 scaffold + 推荐哪个分类。

### 示例 3：用户要置顶 + 配图

**用户**：「写一篇置顶的项目分享，做了个飞书文档监控工具」

**你的步骤**：
1. 跑：
   ```bash
   printf '飞书文档监控工具上线了\nfeishu-doc-monitor-v2\n1\nfeishu,monitor,python\ny\n监控指定 wiki 子树的文档变更，发飞书机器人通知\n' | npm run new
   ```
2. 大纲（项目分享模板）。
3. 找 hero 图：safebooru 搜 `1girl + solo + upper_body + smile + computer`（监控/电脑主题），Read 工具看几张候选图确认露脸。若是竖版，加到 `scripts/crop-hero.mjs` 的 targets 数组先跑。
4. 文章里推荐 `:::tip` 块写「关键决策」，`:::warning` 写「踩过的坑」。
5. build → commit + push。

## 不该做的事

- ❌ 替用户写完整正文（剥夺创作）
- ❌ 强制按你的结构写（建议而非命令）
- ❌ 跳过 `npm run new` 自己手写 frontmatter（容易踩 schema enum 错）
- ❌ push 前不跑 build
- ❌ 用 Safebooru 之外的找图站（Unsplash 真实摄影用户拒绝；Wallhaven / Pixabay 403）
- ❌ 没经 Read 工具看图直接拿 safebooru tag 推断的图（CLAUDE.md §2 多次纠正过）
- ❌ commit 时带 `Co-Authored-By: Claude`（CLAUDE.md 明确禁止）
