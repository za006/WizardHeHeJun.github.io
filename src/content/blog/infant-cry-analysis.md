---
title: 婴儿哭声多模态分析：STFT + Mel 双通道 CNN
description: 用 STFT 和 Mel 两种频谱堆叠成 2 通道输入，4 层 CNN + 3 层 FC 做婴儿哭声原因分类，PyTorch 实现。
pubDate: Apr 14 2026
heroImage: ../../assets/blog/infant-cry-analysis.jpg
category: 项目分享
tags:
  - 深度学习
  - PyTorch
  - CNN
  - 音频
---

## 是什么

新生儿哭声是他们与世界沟通的唯一方式——饿了、困了、不舒服、需要换尿布……不同需求对应不同的哭声模式。这个项目的目标是：**用深度学习自动识别婴儿哭声背后的原因**，属于声音事件分类（Audio Event Classification）的子问题。

## 「多模态」指的是什么

项目名带「Multimodal（多模态）」三个字，但这里的"模态"并不是指音频 + 视频/文本之类的跨模态，而是指**同一段音频被提取成两种不同的频谱表示，堆叠成 2 通道输入**：

```
原始 wav
  ├── STFT 频谱（线性频率轴）   → 通道 1
  └── Mel 频谱（感知频率轴）    → 通道 2
       ↓ np.stack(axis=0)
   shape: (2, 128, 128) 的张量 → 喂给 CNN
```

两种频谱各有侧重：

- **STFT 谱** 在频率轴上是线性等距的，**保留高频细节**——婴儿哭声里那些尖锐的瞬态突发能被精确刻画
- **Mel 谱** 按人耳对数感知做了 mel 滤波，**低频分辨率更高**——更贴近人类对"哭声听感"的判断

把两个谱当作 RGB 图像里的 R 和 G 通道堆起来，让 CNN 的第一层卷积核就能**在两种视角间做跨通道融合**。这是项目里最值得说的一个设计。

## 数据预处理流水线

```
原始 wav
  → librosa.load                       # 默认采样率
  → 加噪增强（可选）                    # np.random.randn(len(y)) * 0.005
  → pad / 截断 到 10 秒
  → STFT(n_fft=2048, hop=512, hann)   # → 1025 × T
  → amplitude_to_db                    # 转 dB
  → Mel(n_mels=128)                    # → 128 × T
  → resize 到 128 × 128
  → np.stack((S_db, S_db_mel), axis=0) # (2, 128, 128)
```

几个工程决定：

- **统一长度 10 秒**：不足的 pad，超过的截断。批训练必需的代价是丢掉长片段的尾部信息
- **resize 到 128×128**：方形输入便于沿用图像分类的 CNN 结构（4 次 stride-2 pooling 后正好剩 8×8）
- **只用高斯噪声做增强**：`np.random.randn * 0.005`，没有时间拉伸/移频/SpecAugment——这是后面"反思"里会回来吐槽的点

标签是用 `sklearn.preprocessing.LabelEncoder` 从文件夹名编码而来——数据按类别名组织在子文件夹里，目录遍历即标签。

## 模型结构

完整的 `SoundModel`：

```python
class SoundModel(nn.Module):
    def __init__(self, n_classes):
        super().__init__()
        # 4 个卷积块：Conv → BN → ReLU → MaxPool(2,2)
        self.conv1 = nn.Conv2d(2,   32,  3, 1, 1);  self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32,  64,  3, 1, 1);  self.bn2 = nn.BatchNorm2d(64)
        self.conv3 = nn.Conv2d(64,  128, 3, 1, 1);  self.bn3 = nn.BatchNorm2d(128)
        self.conv4 = nn.Conv2d(128, 256, 3, 1, 1);  self.bn4 = nn.BatchNorm2d(256)
        self.pool    = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.5)

        # 3 个全连接层
        self.fc1 = nn.Linear(256 * 8 * 8, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, n_classes)
```

特征图尺寸变化（输入 `2×128×128`）：

| Stage | Shape | 通道含义 |
|---|---|---|
| Input | 2 × 128 × 128 | STFT + Mel |
| Conv1 + Pool | 32 × 64 × 64 | 低层时频纹理 |
| Conv2 + Pool | 64 × 32 × 32 | 局部能量模式 |
| Conv3 + Pool | 128 × 16 × 16 | 段级声学特征 |
| Conv4 + Pool | 256 × 8 × 8 | 高层抽象 |
| Flatten | 16384 | |
| FC1 | 512 | |
| Dropout(0.5) | 512 | |
| FC2 | 256 | |
| FC3 | n_classes | logits |

几个细节：

- **每层都有 BatchNorm**——对频谱这种动态范围很大的输入很关键，能让训练稳定不少
- **Dropout 只放在 FC1 和 FC2 之间**——卷积层靠 BN 抗过拟合，全连接层靠 Dropout
- **没有 GlobalAvgPool**——直接 Flatten 256·8·8 = 16384，FC1 的参数量是大头（8.4M），整个模型主要的参数都在这里

## 训练配置

```python
optimizer = Adam(lr=1e-5, weight_decay=1e-5)
scheduler = CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=0)
criterion = CrossEntropyLoss()

batch_size      = 32
train/val split = 80/20（随机切）
early_stop      = 验证 loss 连续 5 epoch 不降就停
```

几个值得注意的选择：

- **lr=1e-5 偏保守**：通常从头训练的 CNN 会用 1e-3，这里小两个量级。猜测是数据量小、不想冲飞，但代价是收敛慢
- **CosineAnnealingLR + 早停 patience=5**：余弦退火会让 lr 在末期降到 0 附近，此时验证 loss 自然会震荡——patience 太小有可能在 lr 衰减阶段被误触发，调参时要留意
- **train/val 随机切**：音频数据集如果同一段录音被切成多个 10 秒片段，随机切可能让同源片段同时落到训练集和验证集，造成指标虚高。生产环境要改成按"录音 ID"分组切

训练完会输出三张曲线（loss / accuracy / lr）和一张混淆矩阵热力图。保存的产物：

- `best_urbansound8k_model.pth` —— 验证最优权重
- `urbansound8k_model_final.pth` —— 训练结束时权重
- `label_encoder.pkl` —— 类别编码器（推理时要加载）

## 推理

`test.py` 的逻辑很直接：加载权重 + label_encoder，把新音频走同一套预处理流水线（STFT + Mel → 2 通道 128×128），forward 后 argmax，再用 label_encoder 反查类别名。

只要预处理函数和训练时一致，推理就只是一次前向。

## 反思

回头看，能改进的地方不少：

**模型层面**
- 4 层 CNN + 3 层 FC 已经是 2015 年左右的架构思路。今天会优先试 **wav2vec 2.0 / HuBERT** 这类自监督预训练特征做编码器，下游接一个小分类头——小数据集上的表达能力差别会很大
- 即便坚持 CNN 路线，也应该上 **CRNN（CNN+BiGRU）** 或加 attention pooling，让模型显式建模时间维度，而不是靠 16384 维的 flatten 硬记

**数据增强**
- 只加噪声太单薄。现成的可选项很多：**SpecAugment**（时间/频率轴 mask）、**MixUp**、**时域伸缩 + 移频**（用 librosa.effects 即可）、**RIR 卷积模拟房间混响**
- 对婴儿哭声这种小数据集场景，增强往往比换模型收益更大

**评估**
- 只看 accuracy 和混淆矩阵不够。婴儿哭声分类的类别天然不均衡（"饿"远多于"疼痛"），应该看 **per-class F1 / macro F1**，必要时做类别加权采样

**真实场景的鸿沟**
- 公开数据集（录音棚 / 近距离麦克风 / 单一婴儿）和家庭实采（远场、电视背景音、多人对话）之间差距非常大
- 想真正落地一个"哭声助手"，**域适配和鲁棒性**才是真正的难题，模型选型反而是相对小的问题

## 后话

这实际上是我本科毕业的时候拿到的课题，也是第一次做信号处理相关的，确实在其中也学到了不少东西，回想起来那几个月泡在实验室里面的时光。又回看起这个仓库，历历往事仿佛就在眼前。虽说那个时候还有些稚嫩。已经毕业快一年了啊。。。

[github.com/WizardHeHeJun/Multimodal-analysis-of-infant-crying](https://github.com/WizardHeHeJun/Multimodal-analysis-of-infant-crying)
