---
title: '把博客抽成模板：stardust 的诞生'
description: '从个人博客抽出一个开源模板的过程——替换清单、stardust CLI 收口、给二次开发者留的扩展点。'
pubDate: 'May 22 2026'
heroImage: '../../assets/blog/stardust.png'
category: '项目分享'
tags: ['Astro', '博客模板', 'GitHub Pages', 'CLI', '开源']
featured: true
---

## 起因

博客越改越发现一件事：每次给「玻璃风 + TOC + 抽屉 + 评论」这些通用骨架加功能，总会顺手污染到「头像 / 友链 / 博文」这些只属于我的内容。一边迭代框架一边维护私人页，每次都得小心翼翼绕开自己的东西。

干脆一分为二——私人内容留在原仓库（[WizardHeHeJun.github.io](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io)）继续写，通用骨架抽到 [stardust](https://github.com/WizardHeHeJun/stardus) 作为模板独立维护。顺便也想试一下当 maintainer 的感觉：从「自用」到「别人能 clone 直接跑」，中间到底差了多少东西。

事实证明，「能跑」和「能让别人用」之间，差了一整个 README 的距离。

## 抽离的边界

把博客拆开看，大致是这样的分法：

| 保留（模板的通用骨架） | 换成占位符（给二开者改的） |
|---|---|
| 玻璃风 + parallax 背景层 | 头像 `src/assets/avatar.png` |
| TOC / 抽屉 / 评论组件框架 | 站点标题、描述（`consts.ts`） |
| stardust CLI + Markdown 扩展 | 社交链接（4 处全局搜 `href="#"`） |
| 响应式 4 档断点 + 微动效 | giscus 4 个 ID |
| LQIP + OG cache 工作链 | 网易云歌单 ID |
| 5 个枚举分类 + 标签系统 | 友链 / memories / 博文（全清空） |

边界设计的难点不在「该不该保留 TOC」这类显然的事，而在**纯色和强个人配色之间那条灰色地带**——鼠标拖尾的几何抽象、选中态的高饱和粉、滚动条的色调，这些"装饰性"细节看起来无害，但凑在一起就是浓浓的"原作者印记"。反复改了几轮才意识到：模板化不只是删名字、换头像，整个视觉系统里只要带"强偏好色"都要中性化。

附带的小决定：原本作为内置示例的两篇示范博文最后也删了——示例内容应该归 README 维护，而不是混在博文里跟用户自己的真实文章一起排序。

## 模板初始化清单的设计

一开始想过做 `npx stardust init` 之类的引导脚手架——挨个问头像路径、giscus ID、站点描述，然后帮二开者改好所有文件。优雅，但**优雅是有代价的**：

- 自动改文件 = 把决策藏进脚本里，二开者不知道改了哪些 / 没改哪些
- 一旦脚手架本身出 bug，调试要先搞懂"它原本打算怎么改"
- 加新可配置项需要同步改脚手架，长期维护成本更高

最后选了 checkbox 清单——**笨，但诚实**。二开者把清单跑一遍，自己改自己看，没有黑盒。

清单本体（写进 README 顶部，跟 hero 截图同屏可见）：

- [ ] `src/consts.ts` — 站点标题、描述、giscus 4 个 ID
- [ ] `astro.config.mjs` — `site` URL 改成自己的域名
- [ ] `package.json` — `name` / `author` / `repository`
- [ ] `src/assets/avatar.png` — 换头像后跑 `node scripts/gen-favicon.mjs`
- [ ] `src/assets/bg.jpg` — 换背景图，或保留默认渐变占位
- [ ] `src/data/friends.json` — 加自己的友链（或保持 `[]`）
- [ ] 全局搜 `href="#"` 占位，把社交链接替换掉
- [ ] `src/components/MusicPlayer.astro` — 改网易云歌单 ID 或删 `<MusicPlayer />`
- [ ] `.github/workflows/*.yml` — 确认 deploy 目标
- [ ] 删示例博文（如还残留在 `src/content/blog/`）

最容易踩的几个二阶坑：

1. **favicon 可能要 build 2-3 次**才能齐——`scripts/gen-favicon.mjs` 前几次会跳过 CSS 输出，验证 `ls dist/_astro/*.css | wc -l` 该是 7
2. **改完 `site` URL 后 OG 缓存要重抓**：`npx stardust refresh-og --force` 一下，否则友链卡的元数据还是旧域名
3. **giscus 4 个 ID 必须从 [giscus.app](https://giscus.app) 配置器拿**——repo ID 和 category ID 不是字符串而是数字编码，肉眼复制容易看错位

这些坑都是反复装错才补到清单里的。

## stardust CLI 的由来

模板抽出来之后，老命令一长串 `npm run xxx` 散在 `package.json` 里——`new-post`、`cms`、`gen-favicon`、`refresh-og`、`backup`、`restore`……人在工作的时候根本记不全。

```bash
# 旧
npm run new-post
npm run cms
npm run refresh-og

# 新
npx stardust new
npx stardust cms
npx stardust refresh-og
```

收成子命令风之后有几个直接收益：

- **`npx stardust` 一行出交互菜单**：新手不用查命令，跑一下看选项就行
- **子命令名跟动作对齐**：`stardust new` 比 `npm run new-post` 短而准
- **bin 链接自动建立**在 `./node_modules/.bin/stardust`，配合 `npx` 不用全局装

7 个子命令对应 7 种日常操作：

| 命令 | 用途 |
|---|---|
| `stardust new` | 新建博文（交互填 frontmatter） |
| `stardust cms` | 启动本地浏览器 CMS（端口 4322） |
| `stardust refresh-og` | 抓 friends.json + 博文裸 URL 的 OG meta |
| `stardust backup` | 备份（标准 / 完整） |
| `stardust restore` | 从备份还原 |
| `stardust list` | 列出已有备份 |
| `stardust clean` | 清理旧备份 |

命名上 CLI 跟项目同名是有意为之——CLI 就是项目本体的对外接口，叫别的名字反而要二开者多记一个。

## 给二次开发者留的扩展点

模板设计时刻意把几个"高频会改"的位置都集中收口，省得二开者翻整个项目猜：

| 想做的事 | 改哪儿 |
|---|---|
| 换主题色 / accent 色 | `src/styles/global.css` 里的 `--accent` 等 CSS var |
| 加一个新的独立页面 | 复制 `src/pages/about.astro` 改造，nav 链接加在 `src/components/Header.astro` |
| 换评论方案（Disqus / Waline / Utterances） | 改 `src/components/Comments.astro` 一处即可，三个调用点都通过它 |
| 加新 Markdown directive | `plugins/remark-shoka-directives.mjs` 里加一种 transformer |
| 换字体 | `src/styles/global.css` 顶部的 jsDelivr `@font-face` URL |

每处都尽量做到"改一个文件就生效"——而不是"改一个文件、再加一段 import、再调整三处 CSS、再跑某个脚本"。如果你发现哪个扩展点改起来还是要东挪西凑，欢迎开 issue 告诉我，我会想办法把它收口到一个文件。

## 跟本博客的关系

物理上是两个仓库：

- **[stardust](https://github.com/WizardHeHeJun/stardus)** —— 骨架 / 模板，对外发布
- **[WizardHeHeJun.github.io](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io)** —— 我自己的博客，本质上是 stardust 的一个二开实例

我的维护立场很简单——**stardust 维护的是骨架本身的健康度**：能 clone、能跑、初始化清单准确、二阶坑及时补到 README。至于二开者拿到之后想做什么样的个人化、加什么页、改什么动效，那是他们自己的事——我不会通过 stardust 去框定"博客应该长什么样"。

唯一会回流到 stardust 的是**骨架层的缺陷**：

- CSS var 命名冲突、组件 props 设计不合理
- 初始化清单漏了某项
- 某个 directive transformer 有 edge case bug
- 工作流脚本（stardust CLI）在新环境跑不通

这些是所有二开者都会受影响的共性问题，自然该在 stardust 修。

我自己博客上"加了张回忆相册照片"、"友链加了一个新站点"、"调了下首页打字机文案"——这些是**实例级改动**，不进 stardust，也不该进。

## 现状

能跑、能看、能让我自己继续在它上面写——我现在用的就是它。这篇博客本身就是 stardust 的活 demo，导航 / TOC / 评论 / 画板 / 回忆相册都直接可点。

要是 clone 之后跑出问题，欢迎开 issue。

---

**项目地址**：[github.com/WizardHeHeJun/stardus](https://github.com/WizardHeHeJun/stardus) · MIT License
