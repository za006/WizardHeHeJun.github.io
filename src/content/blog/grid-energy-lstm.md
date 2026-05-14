---
title: '智能电网能效优化：用 LSTM 做电力时序预测'
description: '基于 LSTM 网络的电力数据时间序列预测项目——分析过往用电模式，预测未来电力需求。'
pubDate: 'Apr 14 2026'
heroImage: '../../assets/blog/grid-energy-lstm.jpg'
category: '学习总结'
tags: ['LSTM', '时序预测', '深度学习']
---

## 是什么

**智能电网能效优化管理系统**——一个用 LSTM 网络做电力时间序列预测的项目。核心目标是：**通过历史电力数据，预测未来时间窗内的电力需求/储能状态**，为电网调度决策提供依据。

数据集：约 4MB 的 `BatteryStorage.csv`，包含历史储能/用电时序数据。

## 为什么是 LSTM

电力时序数据的两个特点决定了 LSTM 是合适的工具：

1. **强时间依赖性**——当前用电量跟过去几小时、过去几天的模式高度相关（比如工作日 vs 周末、白天 vs 夜间、季节波动）
2. **长期依赖**——某些规律横跨较长时间窗（比如月度结算周期、年度季节性）

LSTM 的门控机制（forget / input / output gate）可以有选择地保留长期信息、丢弃短期噪声，比朴素 RNN 更稳。

当然这是 2026 年——Transformer 在时序预测上已经全面超越 LSTM（Informer、Autoformer、TimesNet 等），如果重做我会优先试 Transformer 系。但 LSTM 作为基线，胜在简单、可解释性强、训练快。

## 项目结构

```
IntelligentGridEnergyEfficiencyOptimizationManagementSystem/
├── BatteryStorage.csv     # 4MB 历史时序数据
├── data_process.py        # 数据预处理（切窗口、归一化、train/val 切分）
├── model3.py              # LSTM 网络结构定义
└── main.py                # 训练 + 评估入口
```

整个项目只有 4 个核心文件，刻意保持小而清晰——这是一个**学习性质**的项目，不追求生产级工程化。

## 工程上的几点经验

**1. 时序数据切窗口的细节**

时序预测的常见踩坑：训练集和验证集**不能随机划分**——必须按时间顺序切（前 80% 训练、后 20% 验证），否则会有数据泄漏（用未来数据训练去预测过去）。

**2. 归一化要分别 fit**

scaler 必须只在训练集上 fit，再 transform 验证集。直接对全集做归一化会让验证指标虚高。

**3. LSTM hidden size 选型**

太小学不会，太大过拟合。这种规模的数据集，hidden_size 在 32-128 之间一般是甜蜜区。

## 反思

如果今天重做：
- **模型层面**：上 Transformer 系（至少 Informer），LSTM 作为对比基线
- **特征工程**：加入日历特征（小时、星期、是否节假日）、滑动统计特征
- **评估指标**：除了 MAE/RMSE，加上百分位误差（P50/P95），更能反映预测的鲁棒性

[github.com/WizardHeHeJun/IntelligentGridEnergyEfficiencyOptimizationManagementSystem](https://github.com/WizardHeHeJun/IntelligentGridEnergyEfficiencyOptimizationManagementSystem)
