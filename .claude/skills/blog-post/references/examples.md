# 示例对话

3 个常见场景的「应该怎么走」演示。不是脚本，是判断练习。

## 示例 1：用户给了主题，scaffold + 协作起草

**用户**：「想写一篇博文，记录一下今天用 npm run new 这个 CLI 的体验」

**你的步骤**：

1. **判断分类**：技术笔记（关于工具的体验，不是炫耀项目本身）。50/50 拿不准就问用户，不要替选。

2. **跑 scaffold**（piped 模式）：
   ```bash
   printf 'npm run new 用起来如何\nnpm-run-new-review\n2\ncli,scaffold,astro\nn\n一次 30 分钟把博文创建摩擦清零的体验\n' | npm run new
   ```

3. **提供大纲**（按 `references/article-templates.md` 的「技术笔记」模板）：
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

4. **用户写正文** → 你 review。可建议「探索过程」段（实验记录）用 `:::fold[实现细节]` 收起来让主线干净（参考 `references/shoka-syntax.md`）。

5. **跑 build** → 提示用户加 hero 图 / 直接 push。

## 示例 2：用户没头绪，不要急着 scaffold

**用户**：「想写点什么但不知道写啥」

**你**：**不调** `npm run new`。先聊。问：
- 「最近做了什么 / 学了什么 / 烦什么 / 想感谢谁？」
- 「最近有没有想跟某个人分享但没机会说的事？」

让用户先发散，再判断分类 + 该不该开 scaffold。

**反模式**：直接给 5 个分类让用户选 —— 用户没头绪选项越多越烦。

## 示例 3：用户要置顶 + 配图

**用户**：「写一篇置顶的项目分享，做了个飞书文档监控工具」

**你的步骤**：

1. **scaffold**（piped）：
   ```bash
   printf '飞书文档监控工具上线了\nfeishu-doc-monitor-v2\n1\nfeishu,monitor,python\ny\n监控指定 wiki 子树的文档变更，发飞书机器人通知\n' | npm run new
   ```
   注意第 5 个字段 `y` = 置顶。

2. **大纲**（按 `references/article-templates.md` 的「项目分享」模板）。

3. **找 hero 图**（按 `references/hero-image-safebooru.md`）：
   - safebooru API 搜 `1girl+solo+upper_body+smile+computer+...排除`
   - **Read 工具看候选图** 确认露脸，不要直接信 tag
   - 若选中的是竖版图，先加进 `scripts/crop-hero.mjs` targets 跑一次

4. **文章里**主动建议：
   - `:::tip` 写「关键技术决策」
   - `:::warning` 写「踩过的坑」

5. **build → commit → push**：
   ```bash
   git add src/content/blog/feishu-doc-monitor-v2.md \
          src/assets/blog/feishu-doc-monitor-v2.jpg \
          src/data/lqip.json
   git commit -m "post: 飞书文档监控工具上线了"
   git push
   ```

## 边界场景

### 场景：用户想改已有博文

**不要触发 scaffold**。直接 Edit `src/content/blog/<slug>.md`。提醒：
- 改 `description` / `title` 后会影响 OG / RSS
- 若添加 `updatedDate`，文章页会显示「最后更新于」
- frontmatter 仍走 schema 校验，跑 `npm run build` 确认

### 场景：用户写到一半说"先存了，明天写"

不要 commit 半成品到 main。建议：
```bash
git add src/content/blog/<slug>.md
git commit -m "wip: <文章标题>"
# 或者用 git stash 不 commit
```
明天继续：直接打开 .md 接着写。

### 场景：build 失败

- **schema 错误**：通常 `category` 不在 5 个枚举里，或 `pubDate` 格式不对（应该是 `'May 18 2026'` 无逗号）
- **markdown 错误**：看错误行号，常见是 `:::fold[标题]` 末尾少了 `:::`
- **缺 hero 图文件**：frontmatter 引用了 `heroImage` 但 `src/assets/blog/` 下没文件 → 注释回去或补图

## 关键约束（用户多次明确）

- ❌ 不要替用户写完整正文
- ❌ commit message 不带 `Co-Authored-By: Claude`
- ❌ 不要用 Safebooru 之外的找图站
- ❌ 不要跳过 Read 工具看图直接信 tag
- ❌ 不要 push 没 build 过的代码
- ✅ 写正文要符合「爱莉希雅 / 玻璃风 / 中文为主」的整体气质，但不要替写人格化语句
