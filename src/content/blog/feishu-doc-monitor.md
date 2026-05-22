---
title: '飞书 Wiki 子树文档变更监控器'
description: '一个轻量 Python 脚本，递归扫描飞书 Wiki 子树、对比 SQLite 基线、有变更就推飞书通知。无后端、无常驻进程、无付费 SaaS。'
pubDate: 'May 12 2026'
updatedDate: 'May 22 2026'
heroImage: '../../assets/blog/feishu-doc-monitor.jpg'
category: '项目分享'
tags: ['飞书', 'Python', '自动化', '通知']
---

## 一句话

给一个飞书 Wiki 根节点 URL，**递归展开**到所有 docx，发现内容变了就给负责人发飞书通知——**适合个人或小团队盯关键文档**（设计稿、决策记录、规范文档）。

## 为什么做

飞书 Wiki 没有"原生订阅整棵子树"的能力。你只有两个选项：

- 一篇篇手动收藏 → 工程量大、容易漏
- 开"消息推送"接收所有改动 → 噪音大到没法看

我想要的是中间状态：**指定一棵子树，只通知重要变更，附带责任人**。

## 工作原理

```
Wiki 根节点 URL → DFS 展开所有 docx → 跟 SQLite baseline 对比
   → 有变更 → 算重要性 → 查负责人 → 推飞书卡片
   → 无变更 → 静默跳过
```

第一次跑只**建立基线，不发通知**——避免冷启动一次推 50+ 条骚扰。

## 几个关键设计

**1. 不信任 API 的 `has_child` 提示**

DFS 遍历每个节点时都实打实查一次 `list_children`——飞书 API 偶尔会报 `has_child=false` 但实际有子节点（异步索引滞后）。用代码兜底，宁可多查一次也不漏。

**2. 责任人匹配 4 层 + 祖先回溯**

文档标题对应到模块名时，按这个优先级试：
1. **exact** — 标题 == 模块名
2. **normalized** — 剥 emoji、数字前缀、括号注释后比较
3. **substring** — 包含关系，最长模块胜出
4. **token** — 按 `-_/（）` 分词，最长 token 胜出

主匹配失败时按祖先链 reversed 逐级回溯。

**3. 重要性评分 → 卡片着色**

| 因素 | 加分 |
|------|------|
| 变更字符 > 500 / 100-500 / 10-100 | +3 / +2 / +1 |
| 命中关键词（紧急/重要/风险） | +2 |

`>= 5` 红、`>= 2` 橙，其他蓝。批量卡片整体颜色取最高等级。

## 通知样子

合并卡片在飞书 IM 里直接展开，按等级变色，每篇是个可折叠面板：

```
[紧急] 3 个文档有变更
▼ [HIGH] API 网关设计 · 负责人：张三 · 12 处变更
   - 新增：限流策略改为令牌桶
   - 删除：原有的固定窗口实现
▶ [MEDIUM] 错误码规范 · 负责人：李四 · 3 处
▶ [LOW] README · 负责人：未匹配 · 1 处
```

## 三渠道通知怎么选

私聊 / 群聊 / 文档评论，可单选可组合，按团队节奏配：

| 通道 | 适合 | 噪音控制 | 留痕 |
|---|---|---|---|
| **飞书私聊**（self） | 个人盯关键文档；想第一时间知道但不打扰团队 | 最低（只你自己看） | 仅 IM 记录 |
| **飞书群聊**（chat） | 团队共用同一棵 wiki；广播变更让大家自评是否影响 | 中（看群成员人数） | 群聊记录，可 pin |
| **文档评论**（comment） | 跨文档协作；变更需要"钉在文档上"让后续编辑者看到 | 几乎为零（不打扰任何人） | 直接在文档里 |

合并卡片在 IM 里展开是这样的：按最高等级变色（red / orange / blue），每篇是个可折叠面板，首篇展开、其余 `▶` 折叠。只有 1 篇变更时退化成单文档卡片，避免空壳列表。

三个通道彼此独立、可任意组合——开几个就并行发几条。失败隔离也是分通道做的：某个通道挂了（比如群聊 chat_id 失效）不影响其他通道继续推送。

## 快路径：obj_edit_time

飞书 API 拉 docx 全文相对慢——几百篇 wiki 一轮全拉，分钟级耗时是家常便饭。但绝大多数文档**根本没动过**，全拉一遍纯属浪费。

快路径的做法很直接：先从飞书 API 拿每篇的 `obj_edit_time`，跟本地 baseline 里的时间戳比一下：

- **没变** → 直接跳过，不拉全文、不算 hash、不进 diff 流程
- **有变** → 走完整流程：拉全文 → 算 hash → diff → 打分 → 通知

实测下来这一步把 250 篇规模的扫描从**分钟级降到几十秒级**——大部分时间都用在那几篇真改了的文档上。

兜底机制：`obj_edit_time` 偶尔会滞后或不更新（飞书 API 异步索引的副作用）。所以哪怕快路径判断"没变"，DFS 遍历这一步仍然要靠 `list_children` 把目录走完（详见下一节）——不能用 `obj_edit_time` 反推"子目录没变所以不用查"。

## DFS 不信任 has_child 提示

飞书 wiki API 在列节点时会附带 `has_child` 字段——理论上你可以用它做剪枝：标 `false` 的节点直接跳过 children 查询。但实测下来这个字段**会撒谎**——异步索引滞后的窗口里，`has_child=false` 的节点其实是有子节点的，按字段剪枝就会漏掉整个子树。

应对很简单：**不信任 `has_child`，每个节点都实打实查一次 `list_children`**。多花一次 API call 换零漏报，值。

为了让"API 到底有多不可信"这件事可见，每轮跑完会输出一段 stats：

```
wiki DFS: 360 nodes visited, 360 list_children calls,
          0 has_child-hint misses, 251 targets matched (types=['docx'])
```

`has_child-hint misses` 那个数字就是答案——如果它 > 0，说明 API 在这一轮真的报错了 N 次"我没子节点"但实际有。日积月累看下来，对飞书 API 的可信度边界会有更具体的认知，而不是停留在"听说有滞后"这种模糊印象。

## bitable 负责人映射的小坑

如果用飞书多维表格存「模块 → 负责人」映射（这样监控器才能在通知卡里 @ 到具体的人），配置里要填一个 `base_token`。最容易踩的坑——也是我自己第一次配的时候踩的——是**这个 token 不是 wiki URL 里的 token**。

wiki 节点把 bitable 包了一层。你看到的 URL 长这样：

```
https://your-tenant.feishu.cn/wiki/<wiki-token>
```

直接把 `<wiki-token>` 填进 `base_token`，监控器会一路 401 / 404 报错，让人怀疑是 scope 没给够或者 lark-cli 没登录。

实际要用 `lark-cli` 把 wiki 节点解一层，拿出真正的 `obj_token`：

```bash
lark-cli wiki spaces get_node --params '{"token":"<wiki-token>","obj_type":"wiki"}'
```

返回结果里有个 `obj_token` 字段，**那个才是要填的 `base_token`**。这层映射关系在飞书 OpenAPI 文档里有提，但藏在 wiki 那一章而不是 bitable 那一章——按 bitable 文档走配置流程根本不会看到。

试了几次 token 拼接都被拒之后才反应过来。这条命令后来直接写进了 README 的快速开始章节，让后来者少踩一次。

## 项目结构速览

每个文件只做一件事，出问题时定位面收到一个文件以内：

| 文件 | 职责 |
|---|---|
| `monitor_document.py` | 主入口，编排「展开 → diff → 打分 → 查负责人 → 通知」 |
| `lark_client.py` | lark-cli 子进程封装；`fetch_doc` / `wiki_*` / `send_im_message` |
| `baseline_db.py` | SQLite 基线（两张表：`document_baseline` + `change_history`） |
| `owner_mapper.py` | 4 层匹配 + 祖先回溯 |
| `notifier.py` | 三通道通知 + 批量卡片合并 + 失败隔离 |
| `diagnose_match.py` | 诊断工具：列出每篇文档的匹配情况，输出 CSV |
| `test_run.py` | 端到端冒烟：跑两轮验证「首次建基线 → 第二次无变更」 |
| `run_monitor.bat` | Windows 包装，配 Task Scheduler 用 |

跑起来后会在 `scripts/` 目录下生成几个运行时文件：

| 产物 | 用途 | 删了会怎样 |
|---|---|---|
| `baseline.db` | SQLite 基线，下次跑就是跟它对比 | **全冷启动**——下一轮全部当成新增，不通知 |
| `monitor.log` | 累加的运行日志（含 DFS stats、API 调用、错误回溯） | 没影响，下次跑重新开始累加 |
| `monitor_results.json` | 本轮变更摘要，结构化输出 | 没影响 |
| `match_report.csv` | `diagnose_match.py` 输出，每篇文档匹配到哪个模块/负责人 | 没影响 |

出问题时按"代码归属 + 运行时产物"两个维度组合诊断——比如「通知没发出去 → `notifier.py` + `monitor.log` 尾部」，「匹配错负责人 → `owner_mapper.py` + `match_report.csv`」。

## 作为 Claude Code skill 使用

仓库里的 [SKILL.md](https://github.com/WizardHeHeJun/feishu-doc-monitor/blob/main/SKILL.md) 把整个监控器封装成了一个 Claude Code skill——项目放在能被识别的目录下就自动加载，零安装。

触发方式很自然：

> 「扫一下飞书文档」
> 「跑一次文档监控」
> 「看看哪些 wiki 文档改了」

Claude 会自动执行 `run_monitor.bat`、读 `monitor.log` 尾部 summary、用中文报告结果（比如"扫了 360 篇，3 篇有变更，重要等级 1 高 2 低，已推送到飞书"）。

写代码途中突然想起「今天那篇 API 设计文档改了没」，对 Claude 说一句就能知道——比"切终端 → cd → 跑脚本 → 看 log"那一串顺手很多。

## 一些边界

- **定时调度**：单次执行脚本，要定时跑用 cron / Task Scheduler
- **bitable / sheet / mindnote**：只能拉 docx markdown，其他类型展开阶段被跳过
- **邮件通知**：飞书三渠道已覆盖，要的话自己加 channel
- **增量内容获取**：每次拉全文，diff 内存里做。几万字以上可能慢但可控
- **AI 摘要 / Web 仪表板**：不在范围

[github.com/WizardHeHeJun/feishu-doc-monitor](https://github.com/WizardHeHeJun/feishu-doc-monitor)

---

> 📝 **更新记录**
> - 2026-05-12 初版
> - 2026-05-22 二版：补充三渠道通知 / `obj_edit_time` 快路径 / DFS 不信任 has_child / bitable `base_token` 坑 / 项目结构 / 作为 Claude Code skill 使用
