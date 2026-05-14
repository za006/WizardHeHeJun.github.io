# WizardHeHeJun's Notes

个人博客源码——记录项目分享、技术笔记和碎碎念。

🌐 线上地址：[wizardhehejun.github.io](https://wizardhehejun.github.io/)

---

## 技术栈

- **[Astro 6](https://astro.build/)** —— 静态站点生成器
- **GitHub Pages** —— 免费托管
- **GitHub Actions** —— 推送即自动部署
- **Markdown / MDX** —— 写作格式

## 项目结构

```text
my-blog/
├── public/                       # 静态资源（直接拷到根路径）
│   ├── favicon-*.png             # 多尺寸浏览器图标
│   └── apple-touch-icon.png
├── src/
│   ├── assets/                   # 项目源资源（参与构建打包）
│   │   ├── elysia.png            # favicon 源图
│   │   ├── bg.jpg                # 全屏背景图
│   │   └── blog-placeholder-*.jpg
│   ├── components/               # 可复用组件
│   │   ├── BaseHead.astro        # <head> 通用元数据
│   │   ├── Header.astro          # 顶部导航 + 社交链接
│   │   ├── Footer.astro          # 页脚 + 社交链接
│   │   ├── HeaderLink.astro
│   │   └── FormattedDate.astro   # 中文日期格式化
│   ├── content/
│   │   └── blog/                 # ⭐ 写新文章的地方（.md / .mdx）
│   ├── layouts/
│   │   └── BlogPost.astro        # 文章页布局（含毛玻璃卡片）
│   ├── pages/                    # 路由页面
│   │   ├── index.astro           # 首页
│   │   ├── about.astro           # 关于页
│   │   ├── rss.xml.js            # RSS 订阅
│   │   └── blog/
│   │       ├── index.astro       # 文章列表
│   │       └── [...slug].astro   # 单篇文章动态路由
│   ├── styles/
│   │   └── global.css            # 全局样式（毛玻璃主题 + 背景图）
│   └── consts.ts                 # 站点标题与描述
├── scripts/
│   └── gen-favicon.mjs           # 从 src/assets/elysia.png 生成多尺寸 favicon
├── .github/workflows/
│   └── deploy.yml                # GitHub Actions 自动部署
└── astro.config.mjs              # Astro 配置（含 site URL）
```

## 主题特色

- 🌊 **毛玻璃风** —— 半透明白卡片 + backdrop-filter blur，背景图随页面滚动
- 🇨🇳 **中文友好** —— `lang="zh-CN"`、中文日期格式
- 🔗 **社交链接** —— GitHub / 哔哩哔哩 / X 一字排开

## 写新文章

```powershell
# 1. 在 src/content/blog/ 新建 .md 文件
#    照着 first-post.md 抄 frontmatter 即可

# 2. 本地预览
npm run dev      # http://localhost:4321/

# 3. 发布
git add .
git commit -m "post: 文章标题"
git push         # 推送后约 1-2 分钟自动部署上线
```

## 常用命令

| 命令 | 作用 |
| :--- | :--- |
| `npm install` | 安装依赖（首次或换电脑后用） |
| `npm run dev` | 本地开发服务器 `localhost:4321` |
| `npm run build` | 构建生产版本到 `./dist/` |
| `npm run preview` | 本地预览构建产物 |
| `node scripts/gen-favicon.mjs` | 重新生成 favicon（换头像后用） |

## 部署机制

推送到 `main` 分支后：

1. GitHub Actions 触发 `Deploy to GitHub Pages` workflow
2. 在 Ubuntu runner 上跑 `npm install` + `npm run build`
3. 把 `dist/` 上传为 Pages artifact
4. 自动部署到 `wizardhehejun.github.io`

无需手动操作，`git push` 即发布。

## 多设备协作

博客的「真身」在 GitHub 仓库，每台电脑只是工作副本：

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

- **改站点标题/描述** → `src/consts.ts`
- **改导航/社交链接** → `src/components/Header.astro` + `src/components/Footer.astro`
- **改主题颜色/玻璃透明度** → `src/styles/global.css` 的 `:root` 和 `--glass-*` 变量
- **换背景图** → 替换 `src/assets/bg.jpg` 即可
- **换 favicon** → 替换 `src/assets/elysia.png`，跑 `node scripts/gen-favicon.mjs`
