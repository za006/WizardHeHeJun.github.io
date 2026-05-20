# Shoka Markdown Directives 速查

`plugins/remark-shoka-directives.mjs` 把 remark-directive 解析出的 `:::` 块转成对应 HTML。所有写法都是 **container directive**（`:::` 开头 + 同名 `:::` 结尾）。

## 四色 Callout

````markdown
:::info
信息块，蓝色调，用于补充说明
:::

:::tip
建议块，薄荷绿，比 info 更亲切
:::

:::warning
警告块，琥珀色，提醒副作用 / 注意条件
:::

:::danger
危险块，玫红色，破坏性操作 / 重大坑
:::
````

渲染为 `<aside class="callout callout-{name}">`，内部可以放任何 markdown（粗体/列表/代码块都行）。

## Spoiler 剧透块

````markdown
:::spoiler
默认隐藏的文字。点击 / hover / Enter / Space 解锁，一旦显示就持续显示。
:::
````

渲染为 `<div class="spoiler" tabindex="0">`。点击解锁脚本在 `src/layouts/BlogPost.astro` 末尾的 inline script。

## Fold 折叠块

````markdown
:::fold[标题]
默认折叠的内容。点击标题展开。

支持任何 markdown：
- 列表
- 代码
- 嵌套段落
:::
````

渲染为原生 `<details class="fold"><summary>标题</summary>...`。**无 JS**。标题可省略（默认「展开」），但建议总是写。

## 何时建议用

| 场景 | 用哪个 |
|------|--------|
| 技术笔记里「踩过的坑」 | `:::warning` |
| 项目分享里「关键决策」 | `:::tip` |
| 教程里「Step-by-step 注意事项」 | `:::info` |
| 提醒「会破坏数据」「不可逆」操作 | `:::danger` |
| 不想被搜索引擎过分抓但想留下的话 | `:::spoiler` |
| 题外话 / 实现细节 / 不打断主线的「拓展阅读」 | `:::fold[标题]` |
| 长故事里「角色 B 的视角」（叙事剧透） | `:::spoiler` |

## 反模式

- ❌ 整篇博文用 `:::info` 包起来 —— 失去层次，等于没用
- ❌ `:::tip` 套 `:::warning` 嵌套 —— 视觉混乱
- ❌ `:::fold[标题]` 装关键信息 —— 折叠的应该是「可省略」，关键信息必须主线
- ❌ `:::spoiler` 装公开链接 —— 反而显得是真有秘密。spoiler 应该是「情感重 / 私密」内容
- ❌ 自创 directive 名（如 `:::note` `:::idea`）—— remark-shoka-directives transformer 只识别 info/tip/warning/danger/spoiler/fold 6 个，其他会退化成 `<div class="directive directive-{name}">` 没样式

## 旁敲：Pagefind 索引

折叠的 `<details>` 内容**仍然在 HTML 里**，所以 Pagefind 搜得到。`:::spoiler` 同理。这是 desired —— 搜索仍能找到，只是浏览时被默认收起。如果想要「真不被索引」的内容，写在 `data-pagefind-ignore` 包裹的元素里。

## 渲染细节速查

| Directive | 输出元素 | className | 特殊属性 |
|-----------|---------|-----------|---------|
| `:::info` | `<aside>` | `callout callout-info` | — |
| `:::tip` | `<aside>` | `callout callout-tip` | — |
| `:::warning` | `<aside>` | `callout callout-warning` | — |
| `:::danger` | `<aside>` | `callout callout-danger` | — |
| `:::spoiler` | `<div>` | `spoiler` | `tabindex="0"` |
| `:::fold[X]` | `<details>` | `fold` | 子 `<summary>` 含 X |

样式定义在 [src/styles/global.css](../../../../src/styles/global.css) 的 `.prose .callout-*` / `.prose details.fold` / `.prose .spoiler`。
