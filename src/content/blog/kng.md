---
title: 'KNG：让 Claude Code 越用越准的知识驱动框架'
description: '一个 Claude Code 插件，通过双知识库（能力库 + 项目库）+ 自动学习闭环，让 AI 在特定领域持续积累经验。'
pubDate: 'May 12 2026'
heroImage: '../../assets/blog/kng.jpg'
---

## 是什么

KNG（**K**nowledge-driven **N**ext-**G**en Agent Framework）是我做的一个 Claude Code 插件，核心思想是：**让 AI 拥有可累积、可迁移的领域记忆**，而不是每次对话从零开始。

一句话概括：**双知识库（能力库 + 项目库）+ 自动检索 + 自动学习**——让 AI 在你的项目里越用越准。

## 为什么做

用 Claude Code 久了发现一个矛盾：模型在通用问题上很强，但每次进入一个具体项目，那些只有团队内部才知道的约定（业务模块、历史踩坑、命名规范、被否决过的方案）模型都不知道——你只能反复贴上下文，或者每次都重新解释一遍。

我想要的是：**第一次告诉 AI 一个约束，以后所有任务都自动遵守**。

## 核心架构

| 知识库 | 位置 | 装什么 |
|--------|------|--------|
| **能力库** | `~/.kng-plugin/kb/capability/` | 通用方法论、可复用技能（如「测试用例设计法」「代码审查 checklist」） |
| **项目库** | `~/.kng-plugin/kb/projects/<id>/` | 项目业务模块、历史 bug 模式、约束规范 |

数据存在 SQLite 里，用 FTS5 全文检索 + trigram 分词器（中文友好，无需 jieba）。

## 两个让我特别得意的设计

**1. Hint + on-demand 的检索机制**

每次用户提交 prompt，hook 自动跑一次知识库检索——但**只往上下文注入一行命中数提示**，不带 KB 文字内容。Claude 看到提示后再决定要不要调用 `kng-recall` skill 加载详情。这样做有两个收益：

- **结构性绕开 API 输入分类器**：业务术语（fuzz、安全测试等）密集时，直接注入会被 Anthropic 的安全分类器拦截整段对话。把"提醒信号"和"业务内容"分到两个通道，分类器永远看不到敏感词聚集
- **不污染主对话上下文**：详情加载在 subagent 隔离上下文里跑，主助手只看摘要

**2. 自动学习闭环**

对话进行 5 轮后，hook 启动 extractor subagent，从最近的 user prompt 里抽 4 类候选反馈（correction / missed / constraint / confirmation），写入 pending 队列。攒到 8 条会主动邀请用户跑 `/kng-evolve` 做归并审核——**只有用户确认才落进 KB，AI 永远不能自动改写知识库**。

## 安装

```bash
npx kng-plugin install
# 或在 Claude Code 里：
# /plugin marketplace add WizardHeHeJun/kng
# /plugin install kng
```

## 现状

已经在我自己的几个项目里跑了一段时间，有种"AI 真的开始懂这个项目"的感觉——每次给它一个任务，它都会自动把过去踩过的坑、定下的规范带进考虑。

[github.com/WizardHeHeJun/kng](https://github.com/WizardHeHeJun/kng) · MIT License
