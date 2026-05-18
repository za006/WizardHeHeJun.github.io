# Hero 图：Safebooru 找图 + 校验流程

CLAUDE.md §2 用户多次纠正过侧脸/背影/SAMPLE 水印问题，这里把流程写死，避免下次再踩。

## 站点选择

| 站点 | 状态 | 备注 |
|------|------|------|
| Safebooru ✓ | **首选** | JSON API 稳定，二次元覆盖广 |
| Unsplash | ❌ | 都是真实摄影，用户不喜欢（多次明说） |
| Wallhaven | ❌ | WebFetch 被 403 |
| Pixabay | ❌ | WebFetch 被 403 |
| Pexels | ⚠ | 通但 anime 内容少 |

## API

```
https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=<tags>&json=1
```

返回 JSON 数组，每项有 `directory` + `image` 字段。完整图片 URL：
```
https://safebooru.org/images/{directory}/{image}
```

## 黄金 Tags 组合

```
1girl + solo + upper_body + looking_at_viewer + smile + <topic_tag>
```

**必须排除**（防侧脸/背影/水印/多人/生贺图）：
```
-from_behind -from_side -1boy -character_name
-sample_watermark -comic -happy_birthday
```

URL 构造时空格用 `+`，`-` 表示排除。完整示例（找「电脑/编程」主题）：

```
https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=1girl+solo+upper_body+looking_at_viewer+smile+computer+-from_behind+-from_side+-1boy+-character_name+-sample_watermark+-comic+-happy_birthday&json=1
```

## 主题 tag 选词

按博客分类配主题 tag：

| 博客主题 | safebooru tag 建议 |
|---------|-------------------|
| 编程/技术 | `computer` / `laptop` / `keyboard` |
| 阅读/学习 | `book` / `library` / `studying` |
| 旅行/生活 | `outdoors` / `sky` / `flower` |
| 工具/CLI | `computer` / `desk` |
| 数据/分析 | `chart` 不行（不存在）→ 退到 `computer` |
| 通用碎碎念 | 不加主题 tag，让结果更杂多 |

## 校验流程（必须执行）

1. **API 查询，取前 5-10 个候选**
2. **每个候选都用 Read 工具实际看图**：
   ```
   Read d:/tmp/preview-1.jpg
   ```
   或者用 WebFetch 拿到图后直接看。
3. **拒绝条件**：
   - 侧脸 / 背影（即使 tag 标了 `upper_body looking_at_viewer`，实际图可能不是）
   - SAMPLE 水印（部分 Safebooru 图带 SAMPLE 字样）
   - 角色名水印（左下/右下常有英文角色名 watermark）
   - 多人图（即使 tag 标了 `solo`，可能背景有路人）
   - 生贺/happy birthday 类（蜡烛蛋糕画面）
   - 严肃/战斗场景（用户偏好「休闲」）
4. **通过的图**：下载到 `src/assets/blog/<slug>.jpg`

## 竖图必须预裁

如果选中的图是竖版（height > width），Astro Image 默认的 `attention` 算法会被高饱和装饰物（蝴蝶结/帽子/头饰）吸引，**切掉脸**。必须预先用脚本裁成横版。

流程：
1. 编辑 `scripts/crop-hero.mjs`，在 targets 数组加一条：
   ```js
   { file: 'src/assets/blog/<slug>.jpg', topRatio: 0.0, bottomRatio: 0.6 },
   ```
   - `topRatio` 是从顶部开始的裁剪起点（占原图高度比例）
   - `bottomRatio` 是裁剪终点
   - 一般 `0.0` 到 `0.6` 把头+上半身保留
2. 跑 `node scripts/crop-hero.mjs`
3. 重跑 `npm run build`（prebuild 会重生 lqip）

## frontmatter 引用

```yaml
heroImage: '../../assets/blog/<slug>.jpg'
```

路径相对于 `src/layouts/BlogPost.astro`，**不是**博文 .md 自身。`npm run new` 生成的 frontmatter 里已有这一行，但是注释掉的（`# heroImage: ...`），加图后取消注释。

## 自动化：LQIP

加 hero 图后**不用手动跑** `gen-lqip` —— prebuild 钩子会在 `npm run build` 前自动重生 `src/data/lqip.json`，把新图的 32px 缩略 + dominant color 加进去。

只需要：
```bash
# 1. 拖图到 src/assets/blog/<slug>.jpg
# 2. 取消 frontmatter heroImage 注释
# 3. npm run build  (prebuild 自动跑 gen-lqip)
```
