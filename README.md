# WizardHeHeJun's Notes

个人博客源码——记录项目分享、技术笔记和碎碎念。

🌐 线上地址：[wizardhehejun.github.io](https://wizardhehejun.github.io/)

完整搭建过程见博文：[我用 Astro + GitHub Pages 搭了这个博客](https://wizardhehejun.github.io/blog/building-this-blog/)

---

## 技术栈

- **[Astro 6](https://astro.build/)** —— 静态站点生成器
- **GitHub Pages** —— 免费托管
- **GitHub Actions** —— 推送即自动部署
- **Markdown / MDX** —— 写作格式
- **[Pagefind](https://pagefind.app/)** —— 静态全文搜索
- **[giscus](https://giscus.app/)** —— 基于 GitHub Discussions 的评论 + 表情反应（自定义玻璃主题）
- **[APlayer](https://aplayer.js.org/) + [MetingJS](https://github.com/metowolf/MetingJS)** —— 音乐播放器
- **[LXGW WenKai Screen](https://github.com/lxgw/LxgwWenKai-Screen)** —— 手写感中文字体（jsDelivr CDN）
- **[remark-directive](https://github.com/remarkjs/remark-directive)** —— Shoka 风 `:::callout / :::spoiler / :::fold` 扩展语法
- **[mermaid](https://mermaid.js.org/)** —— 客户端 lazy load 渲染流程图 / 时序图 / 思维导图

## 项目结构

```text
my-blog/
├── public/                          # 静态资源（直接拷到根路径）
│   ├── favicon-{16,32,192}.png      # 多尺寸浏览器图标
│   ├── apple-touch-icon.png         # iOS 主屏图标
│   ├── giscus-theme.css             # giscus 自定义玻璃主题（生产环境用，dev 回退 light）
│   └── memories/                    # 回忆相册图片目录（拖图进去即可）
├── src/
│   ├── assets/                      # 项目源资源（Vite 打包，自动加 hash）
│   │   ├── elysia.png               # favicon 源图
│   │   ├── bg.jpg                   # 全屏背景图
│   │   ├── fonts/                   # 旧 Atkinson 字体（已弃用，未删）
│   │   ├── blog/                    # 博文 hero 图（按 slug 命名）
│   │   └── blog-placeholder-*.jpg   # 模板自带占位图
│   ├── components/                  # 可复用组件
│   │   ├── BaseHead.astro           # <head> 通用元数据 + LXGW 字体 CDN
│   │   ├── Header.astro             # 顶部导航（带 SVG 图标 + 粉色胶囊 active）+ 移动端 ☰ 抽屉 + 最近文章 ticker（≤640 嵌入 nav 的胶囊滚动）
│   │   ├── Footer.astro             # 全宽底部条 + 挂载所有全局组件
│   │   ├── HeaderLink.astro         # 导航链接组件
│   │   ├── FormattedDate.astro      # 中文日期格式化
│   │   ├── Comments.astro           # giscus 评论组件（mapping/term props，dev 回退 light，生产用自定义主题 + cache buster）
│   │   ├── Sidebar.astro            # 博客列表的左侧栏（Profile/Stats/最近文章，头像带 hover wiggle）
│   │   ├── Pagination.astro         # 分页器（数字 + 上下页）
│   │   ├── BgLayer.astro            # 独立背景层（绕开 backdrop-filter 冻结 bug）
│   │   ├── BgScrollSync.astro       # JS 把 scroll 进度同步到 --bg-y CSS 变量
│   │   ├── CursorTrail.astro        # 鼠标拖尾（菱形 + 三角混搭，节流 45fps，跳过触屏）
│   │   ├── SearchOverlay.astro      # 搜索浮窗（Pagefind JS API + 自定义 UI，flex 居中）
│   │   ├── TableOfContents.astro    # 文章 TOC（DOM 扫描 h2/h3 + 桌面左侧栏 + 移动浮 header + 阅读进度环 + FAB）
│   │   └── MusicPlayer.astro        # APlayer + MetingJS 右下角音乐播放器
│   ├── content/
│   │   └── blog/                    # ⭐ 写新文章的地方（.md / .mdx）
│   ├── content.config.ts            # 博文 collection schema（含 category / tags / featured）
│   ├── layouts/
│   │   └── BlogPost.astro           # 文章页布局（hero 图 + 玻璃 prose 卡）
│   ├── pages/                       # 路由页面
│   │   ├── index.astro              # 首页（hero 打字机 + 头像 wiggle + 最近文章 3×2 + Now 区）
│   │   ├── about.astro              # 关于页（6 sections 玻璃卡 + giscus 评论）
│   │   ├── 404.astro                # 戏剧版 404（4 [Elysia] 4 + 浮动动画）
│   │   ├── friends.astro            # 友链页（数据来自 src/data/friends.json + giscus 评论申请入口）
│   │   ├── memories.astro           # 🆕 回忆相册（按日期倒序卡片网格，图片放 public/memories/）
│   │   ├── whiteboard.astro         # 🆕 画板（HTML5 canvas + 颜色/粗细/橡皮/清空 + 主题化 confirm modal）
│   │   ├── search.astro             # 搜索页（fallback，主入口已改 overlay）
│   │   ├── rss.xml.js               # RSS 订阅
│   │   ├── blog/
│   │   │   ├── [...page].astro      # 博客列表（分页 + sidebar）
│   │   │   └── [...slug].astro      # 单篇文章动态路由（含 giscus 评论）
│   │   ├── categories/
│   │   │   ├── index.astro          # 分类总览
│   │   │   └── [category].astro     # 单分类下的文章列表
│   │   └── tags/
│   │       ├── index.astro          # 标签云
│   │       └── [tag].astro          # 单标签下的文章列表
│   ├── data/
│   │   ├── friends.json             # 友链数据
│   │   └── memories.json            # 🆕 回忆相册数据（[{ image, date, title, description? }]）
│   ├── styles/
│   │   └── global.css               # 全局样式（玻璃变量 + 字体 + 渐变 fallback）
│   ├── utils/
│   │   └── reading-time.ts          # 中文友好的字数 + 阅读时长计算
│   └── consts.ts                    # 站点标题与描述
├── scripts/
│   ├── gen-favicon.mjs              # 从 src/assets/elysia.png 生成多尺寸 favicon
│   └── crop-hero.mjs                # 预裁竖图为脸居中横版（Astro <Image> 默认 center 裁剪友好）
├── .github/workflows/
│   └── deploy.yml                   # GitHub Actions 自动部署（Node 22）
├── CLAUDE.md                        # 项目惯例（供 AI 协作参考）
└── astro.config.mjs                 # Astro 配置（site URL + Pagefind integration）
```

## 主题特色

- 🖼️ **Hero 图 LQIP** —— 32px base64 占位（含 dominant color）内联到 HTML，弱网下立即可见，全图加载完 0.4s 淡入；prebuild 自动重生
- ✍️ **Shoka markdown 扩展** —— `:::info / :::tip / :::warning / :::danger / :::spoiler / :::fold[标题]` 6 种 directive，融入玻璃风，spoiler 可点击解锁
- 📊 **Mermaid 客户端渲染** —— 写 ` ```mermaid ` 代码块即可画 flowchart/sequence/mindmap/quadrant 等；仅含 mermaid 块的页面才 lazy load 主包，零负担
- 💻 **代码块 macOS 窗口风** —— shiki 上叠加 36px 灰色 header + 红黄绿 3 圆点 + lang 标签 + 右上角「放大」「复制」按钮（fullscreen portal 到 body 避开 stacking trap，复制带 ✓ 反馈）
- 🖼️ **正文图 figure + 智能放大** —— `![alt](src)` 自动转 `<figure>` + figcaption；点击图打开仿 macOS 预览的 lightbox（右侧工具栏放大/缩小/100%/适应/关闭 + 双击 toggle + 滚轮按光标位置缩放 + 拖拽平移）
- 📑 **TOC 大改造** —— 玻璃蒙版 + 上下篇切换按钮 + 阅读进度条（`#66ccff`）+ 卡高度跟随 header 状态动态扩展（header 隐藏时撑满 viewport 左侧） + 「未完全展开时隐藏底部按钮」过渡
- 💧 **友链卡 per-friend accent** —— 每个 friend 可指定 `accent: '#hex'`，卡顶色块 + 名字色 + hover 发光全部从 accent 派生（color-mix 自动算明暗变体）；20° 3D tilt 跟随鼠标 + 头像 translateZ 凸起
- 🌐 **OG 元数据缓存** —— `npm run refresh-og` 抓友链 URL 的 OG image/title/description/favicon 进 `src/data/og-cache.json`（commit 进 git，CI 不上网）；渲染分 thumb-top 卡 / 圆头像 / 字母 tile 三级 fallback
- 🌊 **毛玻璃风** —— 半透明白卡片 + `backdrop-filter: blur(18px) saturate(180%)`
- 🖼️ **滑块式视差背景** —— 独立 `bg-layer` div + JS 同步 scroll 进度，页头看图顶 / 页尾看图底
- 📐 **响应式四档断点** —— 移动 ≤640 / 平板 641-960 / 桌面 961-1280 / 大屏 >1400（再宽到 1800 解锁博文列表 1680px / 画板 1680px）
- 🍔 **移动端 ☰ 抽屉** —— ≤720 折叠汉堡菜单，含可展开二级（博客 → 分类/标签）+ 社交快捷（已删冗余 ×，留 4 种关闭路径）
- 📰 **嵌入式 ticker** —— ≤640 nav 里挂胶囊状的最近文章自动滚动条（脉动小圆点 + 5s/项 + 无缝循环）
- 📑 **文章 TOC 目录** —— 桌面 ≥1280 左侧贴边固定栏，含粉色「文章目录」胶囊 + 编号 + 主动态高亮 + 底部跳转按钮 + 渐变遮罩；移动端浮入 header（带**实时阅读进度环**）；窄屏右下角 FAB（回到顶部 / 滚到底部 / 折叠手柄）
- 🎯 **Header 自动隐藏** —— 下滑藏 / 上滑现 / 贴顶 80px 内永远显示，body class 联动 TOC 等组件；移动端 header 加厚到 68px
- 🃏 **横向交错卡片** —— 博文列表单列横向，奇偶图左/图右交错；置顶用 21:9 全宽大图差异化
- 🎯 **卡片微动效** —— hover 配图一次性 wiggle + 卡片上抬 + "阅读全文 →" 滑入；active 0.985 下沉反馈
- 💞 **头像 hover wiggle** —— 首页/关于/sidebar 三处头像鼠标悬停时一次性 0.6s 摆动（global keyframes 复用）
- 💬 **giscus 评论 + 表情反应** —— 基于 GitHub Discussions，自定义玻璃水色主题，三处接入（博文/关于/友链），每次 build 自动 cache-bust
- 🔤 **霞鹜文楷** —— LXGW WenKai Screen via jsDelivr CDN，按字符 chunk 拆分
- 🇨🇳 **中文友好** —— `lang="zh-CN"`、中文日期、中文字数 + 阅读时长、正文宽度 ≤ 1100px（≥1800 大屏放宽）
- 🔍 **Pagefind 搜索** —— 静态全文索引，浮窗 flex 居中（大屏阶梯加宽 560/640/740px），按 `/` 全局打开
- 🎵 **音乐播放器** —— APlayer + MetingJS，固定右下角，可换网易云任意歌单
- ✨ **鼠标拖尾** —— 空心几何菱形 + 三角形 3:1 混搭（粉/蓝/紫三色 + 描边 + 发光），自动跳过触屏 + 减少动画偏好
- 📜 **自定义滚动条** —— 水蓝 `#66CCFF` 胶囊滑块（Firefox `scrollbar-color` + Webkit `::-webkit-scrollbar-thumb`）
- 📷 **回忆相册** —— JSON 数据驱动的卡片网格，按日期倒序，图片放 `public/memories/`
- 🎨 **画板** —— HTML5 Canvas 自由绘画，6 色板 + 自定义颜色 + 粗细滑块 + 橡皮 + 清空（主题化 confirm modal，不保存）
- 📌 **置顶机制** —— frontmatter `featured: true`，列表暖色金边大卡
- 🏷️ **分类 + 标签** —— 5 个枚举分类 + 自由标签，自动生成聚合页
- 🔗 **社交** —— GitHub / 哔哩哔哩 / X / 邮箱，统一 48px 圆形玻璃按钮（深灰图标 + 粉色 hover 渐变）

## 写新文章

```powershell
# 1. 交互式 scaffold（推荐）
npm run new      # 输入标题 / slug / 分类 / 标签 / 是否置顶 / 描述
                 # 生成 src/content/blog/<slug>.md + 注释掉的 heroImage 行

# 2. 写正文。可用 Shoka markdown directives：
#   :::info / :::tip / :::warning / :::danger  四色 callout
#   :::spoiler                                 剧透块（默认隐藏）
#   :::fold[标题]                              折叠块（原生 details）
#   ```mermaid                                 流程图/时序图（客户端渲染）
#   ![alt](src)                                自动转 figure + caption，点击放大

# 3. 加 hero 图：拖到 src/assets/blog/<slug>.jpg，取消 heroImage 注释。
#    prebuild 自动重生 LQIP，无需手动跑 gen-lqip。

# 4. 本地预览
npm run dev      # http://localhost:4321/

# 5. 发布
git add .
git commit -m "post: 文章标题"
git push         # 推送后约 40-50 秒自动部署上线
```

> 也可以手动建 .md。最小 frontmatter：
>
> ```yaml
> title: '...'
> description: '...'         # 30 字内
> pubDate: 'May 14 2026'     # 英文日期格式
> category: '项目分享'        # 5 选 1：项目分享 / 技术笔记 / 学习总结 / 生活随笔 / 碎碎念
> tags: ['标签1', '标签2']
> featured: true             # 可选，置顶
> heroImage: '../../assets/blog/<slug>.jpg'  # 可选
> updatedDate: 'May 14 2026' # 可选，更新过显示「最后更新于」
> ```

## 常用命令

| 命令 | 作用 |
| :--- | :--- |
| `npm install` | 安装依赖（首次或换电脑后用） |
| `npm run dev` | 本地开发服务器 `localhost:4321` |
| `npm run build` | 构建生产版本到 `./dist/`（prebuild 自动重生 LQIP） |
| `npm run preview` | 本地预览构建产物 |
| `npm run new` | **交互式新建博文 CLI**（prompt 标题/slug/分类/标签/置顶/描述） |
| `npm run refresh-og` | 抓 `friends.json` URL 的 OG meta 到 `og-cache.json`（增量；`--force` 全量重抓） |
| `node scripts/gen-favicon.mjs` | 重新生成 favicon（换头像后用） |
| `node scripts/crop-hero.mjs` | 预裁竖版人像图为横版面孔居中 |

## 部署机制

推送到 `main` 分支后：

1. GitHub Actions 触发 `Deploy to GitHub Pages` workflow
2. Ubuntu runner 跑 `npm install` + `npm run build`（含 Pagefind 索引生成）
3. `dist/` 上传为 Pages artifact
4. 自动部署到 `wizardhehejun.github.io`

无需手动操作，`git push` 即发布。**约 40-50 秒**完成。

## 多设备协作

```powershell
# 新机器拉代码
git clone https://github.com/WizardHeHeJun/WizardHeHeJun.github.io.git
cd WizardHeHeJun.github.io
npm install

# 写之前先拉一下
git pull

# 写完推上去
git push
```

## 自定义提示

| 想改什么 | 改哪里 |
|---------|-------|
| 站点标题/描述 | `src/consts.ts` |
| **giscus 仓库 / 分类 / ID** | `src/consts.ts` 的 `GISCUS` 常量（4 个 ID 从 https://giscus.app 配置器拿） |
| **giscus 主题配色** | `public/giscus-theme.css`（透明度、按钮渐变、tab 配色都在里面） |
| 顶部导航/社交链接 | `src/components/Header.astro` + `src/components/Footer.astro` |
| 玻璃透明度/边框/阴影 | `src/styles/global.css` 的 `:root` 里 `--glass-*` 变量 |
| **滚动条颜色** | `src/styles/global.css` 里搜 `#66CCFF` |
| **头像 wiggle 强度** | `src/styles/global.css` 的 `@keyframes avatar-wiggle`（旋转角度 / scale） |
| 全屏背景图 | 替换 `src/assets/bg.jpg` 即可 |
| favicon | 替换 `src/assets/elysia.png`，跑 `node scripts/gen-favicon.mjs` |
| 音乐歌单 | `src/components/MusicPlayer.astro` 第 4 行的 `playlistId`（网易云歌单 ID） |
| 友链 | `src/data/friends.json`（schema `{name, url, description?, avatar?, accent?}`），改完跑 `npm run refresh-og` |
| **友链卡 tilt 力度 / 配色 fallback** | `src/pages/friends.astro` 顶部 `pickThumb` / CSS `--tilt-x/y` |
| **Mermaid 主题配色** | `src/layouts/BlogPost.astro` 末尾 `mermaid.initialize({ themeVariables: ... })` |
| **代码块 macOS 窗口配色** | `src/styles/global.css` 里 `pre.astro-code` 段（圆点色、header 灰条、lang 标签） |
| **Shoka callout 配色** | `src/styles/global.css` 里 `.prose .callout-{info,tip,warning,danger}` |
| **lightbox 工具栏** | `src/layouts/BlogPost.astro` 末尾 figure-lightbox 内联脚本（ICON SVG / scale 范围 0.25-6） |
| **回忆相册** | `src/data/memories.json` + 图片丢 `public/memories/`（JSON 里引用 `/memories/<文件名>`） |
| **画板色板/工具** | `src/pages/whiteboard.astro` 顶部的 `.swatches` HTML 块（6 色） |
| 首页 Now 区内容 | `src/pages/index.astro` 的 `.now-grid` 块 |
| 关于页技术栈/项目 | `src/pages/about.astro` 顶部的 `featured` 和 `stack` 数组 |
| 首页打字机短句 | `src/pages/index.astro` 的 `typeLines` 数组 |
| 鼠标拖尾颜色/速度/形状 | `src/components/CursorTrail.astro`（colors 数组 + MAX/LIFE/throttle 常量） |
| TOC 阅读进度环色 | `src/components/TableOfContents.astro` 里搜 `#ff5d8f`（粉色） |
| Header 自动隐藏阈值 | `src/components/Header.astro` 里 `TOP_LOCK`（贴顶锁定区）+ `THRESH`（抖动阈值） |

## 项目惯例（重要！别再踩这些坑）

详见 [CLAUDE.md](./CLAUDE.md) 和[博文中的「项目工作规范」一节](https://wizardhehejun.github.io/blog/building-this-blog/)。摘几条：

1. **背景图必须用独立 `BgLayer` 组件**——别直接挂 body，否则 `backdrop-filter` 会冻结
2. **二次元图必须先 `Read` 工具验证**——LLM 基于 tag 推断常常出错
3. **竖版人像图必须用 `crop-hero.mjs` 预裁**——Astro `<Image>` 的 attention 算法对二次元不准
4. **Pagefind 动态 import 必须用 `<script is:inline>`**——否则 Vite 在构建时报错
5. **改完必须 `npm run build` 验证再 push**——别提交未构建过的代码
6. **响应式只用四档断点**：640 / 960 / 1280 / 1400（再加 1800 给大屏）——不要发明 720 / 1024 之类
7. **宽度用 `width: min(Npx, 100% - 2em)`** 替代 `width + max-width` 双写
8. **全局 `box-sizing: border-box`** 必须有，否则 mobile 按钮 width:100% + padding 会溢出
9. **`align-items: center` + 内部高列表 = 坑**：列表会被居中导致 translateY 数学错乱——必须用内层 `.window` 包裹 + `position: absolute` 列表（见 ticker 实现）
10. **博客列表卡片用单列横向 + 奇偶交错**——置顶博文必须用独立大图样式差异化，不能只靠徽章
11. **TOC 等组件的 inline script 必须包 DOMContentLoaded**——`<script is:inline>` 在 HTML 解析到位置时立即执行，那时 `.prose` 等后续元素还没渲染
12. **滚动跟随必须用 `transform: translateY()` 而不是 `top`**——前者走 GPU 合成层，后者每帧触发 layout 重排，加上 `backdrop-filter` 直接掉帧
13. **跨组件协调用 body class**——`body.has-toc`、`body.header-hidden`、`body.drawer-open` 等，让 CSS 选择器单点联动多个组件，避免 prop drilling
14. **CSS 特异性陷阱**：相同特异性按源序后写赢——想覆盖必须显式提高一档（如 `nav h2 a:hover` 胜过 `nav a:hover`）
15. **数学最优解：6 = LCM(2, 3)**——首页最近文章展示 6 篇，2 列 / 3 列 grid 都能整齐填满，无孤儿尾巴
16. **Grid 防溢出 pattern：`minmax(min(Npx, 100%), 1fr)`**——别直接 `minmax(280px, 1fr)`，窄屏父容器 < 280px 时卡片会撑出右边界
17. **SVG 必须 inline `width`/`height` 属性**——Astro scoped CSS 加 `!important` 都不一定可靠，HTML 属性最稳
18. **giscus 自定义主题 URL 必须带 cache buster `?v=`**——iframe 会缓存 theme CSS，改了不刷新；构建时间戳追加到 URL 解决
19. **移动端必须 `-webkit-tap-highlight-color: transparent`**——iOS/Android 默认点击蓝方块会破坏自定义 active 反馈
20. **Astro page-scoped CSS 不下钻子组件渲染的元素**（CLAUDE.md §38）——`.card-media img` 在 page 里写，HeroImage 组件渲染的 img 带不同 cid，匹配失败；改用 `:global()` 或者把样式搬进子组件
21. **`.mdx` 不继承顶层 `markdown.remarkPlugins`**（§39）——必须 `mdx({ remarkPlugins })` 和 `markdown.remarkPlugins` 都注册同一份共享数组
22. **新装 npm 包必看 install hook**（§40）——`grep -E 'preinstall\|postinstall' node_modules/<pkg>/package.json`；obfuscated 代码 + crypto + fetch + 强制非主流 runtime = 否决（实战否决了 @antv/infographic）
23. **`backdrop-filter` 在祖先上让后代 `position: fixed` 退化成 absolute**——fullscreen pre / lightbox 必须 portal 到 body 直接子级才能逃出 stacking trap
24. **CSS `max-height` 跟 JS 设的 `height` 会打架**——viewport 小于某值时 CSS max 赢，JS height 失效（TOC 卡撑不到 viewport 底的根因）；JS 完全接管尺寸时删 CSS fallback
25. **Shiki 默认 `github-dark` 主题在玻璃白底上反差大**——`astro.config.mjs` 的 `markdown.shikiConfig: { theme: 'github-light' }` 统一全站

## License

代码 MIT。文章内容请勿转载。
