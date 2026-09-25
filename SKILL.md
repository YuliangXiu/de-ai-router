---
name: de-ai-router
description: 去AI味指令路由器。当用户说"去AI味""说人话""humanize""make it sound human""deslop""去机械感"或任何想让文字不像 AI 写的指令时，先判断文本类型与用户意图，再从已安装的去AI味 skills 中推荐最优方案（或给出多方案选择），然后按推荐加载对应 skill 执行。覆盖 10 个 skill：qu-ai-wei（中文首选，实测语料+双模式）、humanizer-zh、no-ai-slop、unslop、slopbeth、humanizer-aboudjem、deslop、anti-ai-slop-writing、anti-slop、humanize。
---

# 去AI味路由（De-AI Router）

用户说"去AI味"、"说人话"等指令时，不要直接开始改。先路由，再执行。

## 已安装的去AI味 skills 全景

| Skill | 作者 | 工作模式 | 核心定位 | 方法论取向 |
|-------|------|---------|---------|-----------|
| **no-ai-slop** | Peter Yang | 双模式（编辑+检测） | 锐利的人类编辑，最小有效修改 | 最小修改、保留声音 |
| **unslop** | Cursor 官方 | 单模式重写 | 扫描→重写→注入灵魂→自审 | 注入声音、灵魂 |
| **slopbeth** | ehmo | 多模式（重写/批评/基准/检测） | 密集写作，奥威尔六规则，证据边界 | 信息密度 + 事实边界 |
| **humanizer-aboudjem** | Adam Boudjem | 多模式（detect/rewrite/edit + 0-100评分） | 55 模式，5 种 voice profile，burstiness 调整 | 注入声音 + 统计可测 |
| **deslop** | Stephen Turner | 审查导向 | 唯一覆盖科研写作（论文/摘要/基金/审稿回复） | 结构硬约束 + 保留声音 |
| **anti-ai-slop-writing** | jalaal | 前置写作约束 | 写作时就生效的硬规则（禁词表+结构规则） | 结构硬约束 |
| **anti-slop**（已装） | Matt Silverlock | 审查导向 | 保留作者声音为第一指令，假阳性比残留 tell 更糟 | 最小修改、保留声音 |
| **humanize**（已装） | aasha | 单模式重写 | 41 模式目录最全（融合维基+stop-slop+统计） | 事实边界 + 统计可测 |
| **humanizer-zh**（已装） | op7418（歸藏） | 编辑已有中文文本 | 中文专用：31 模式含 F 组中文特有检查（层叠"的"、"进行+动词"、被字句、四字排比、"随着…发展"开头） | 信息完整度优先 + 作者声音 |
| **qu-ai-wei**（已装） | baibanbao | 双模式（自家稿红笔报告 / 白名单直改） | 中文首选：三家合并（王佩写作系统+humanizer-zh+lieflat 实测 117.9 万汉字语料），11 刀有频率数据，含"不许动"反清单与七处裁决 | 实测数据 + 信息守恒 + 最小改动 |

## 路由步骤

### Step 1: 判断文本类型

| 文本类型 | 判断信号 |
|---------|---------|
| **学术/科研** | 论文、摘要、基金申请、审稿回复、technical report、学术邮件、ICCV/CVPR 等 |
| **通用散文** | 博客、文章、通讯、essay、专栏 |
| **短文本** | 推文、邮件、微信/飞书消息、小红书、朋友圈、标题 |
| **技术文档** | README、API 文档、代码注释、技术 blog |
| **营销/宣传** | 产品页、招生文案、推广、newsletter |
| **未知/混合** | 拿不准，或用户没给文本 |

### Step 2: 判断用户意图

| 意图 | 判断信号 |
|------|---------|
| **重写已有文本** | 用户贴了文本，要"改一版" |
| **检测/审查** | "看看这段像不像 AI 写的"、"有哪些 AI 味" |
| **从零写作** | "帮我写一个…"、"写的时候注意别像 AI" |
| **只要推荐** | "去AI味"但没给文本，或明确问"该用哪个" |

### Step 3: 路由决策表

**按文本类型（默认：用户给了文本且要重写）：**

| 文本类型 | 首选 | 备选 |
|---------|------|------|
| **中文文本（任意类型）** | **qu-ai-wei**（实测语料+双模式） | humanizer-zh（更轻量）；英文方案其 F 组中文检查仍可参考 |
| 学术/科研 | **deslop** | slopbeth（事实边界+密集写作） |
| 通用散文 | **no-ai-slop** | anti-slop（更保守，最大保留原声） |
| 短文本 | **anti-ai-slop-writing** | no-ai-slop |
| 技术文档 | **humanizer-aboudjem**（technical voice） | slopbeth |
| 营销/宣传 | **humanizer-aboudjem**（warm/blunt voice） | unslop |
| 未知/混合 | **humanize**（41 模式最全面） | humanizer-aboudjem |

**按意图覆盖：**

| 意图 | 方案 |
|------|------|
| 检测但不改写 | **no-ai-slop** detect 模式（只点名模式+引用原句，不评分不猜） |
| 检测 + 量化评分 | **humanizer-aboudjem** detect 模式（0-100 分） |
| 最大程度保留原声 | **anti-slop**（外科手术式措辞修改）或 no-ai-slop |
| 文本平淡无味要注入个性 | **unslop**（官方流程）或 humanizer-aboudjem（voice profile） |
| 从零写作防 AI 味 | **anti-ai-slop-writing**（前置硬规则）或 slopbeth（奥威尔六规则） |
| 密集、信息密度优先 | **slopbeth** |
| 严谨事实边界（不编造） | **humanize** 或 slopbeth（证据边界模式） |
| 中文文本去 AI 味 | **qu-ai-wei**（默认；自家稿出红笔报告，别人稿/只去味选白名单模式）。轻量场景用 humanizer-zh |
| 中文自己的文章要下狠刀+声音校准 | **qu-ai-wei** 自家稿模式（B 级红笔报告，不直接动稿） |

## 输出格式

**用户要推荐（默认）：** 给 1 个方案 + 一句话理由（引用上面表格的方法论定位）。

**用户要选择：** 给 2-3 个方案，每个附：名字 / 为什么适合这段文本 / 代价（如"会更大刀阔斧改"）。

**输出示例：**
> 这段是学术写作，推荐 **deslop** —— 它明确覆盖论文/审稿回复场景，且走"审查→外科手术式修改"路线，不会动你的论证结构。如果你更在意信息密度和事实边界，备选 **slopbeth**。

## 执行

1. 按路由结果用 Skill 工具加载对应 skill。
2. 把用户文本传给该 skill 执行。
3. 若用户对结果不满意（"太过了"/"还不够"），在路由表内切换：改得太狠 → 换 anti-slop / no-ai-slop；还不够人味 → 换 unslop / humanizer-aboudjem。

## 注意事项

- 路由只在用户发"去AI味/说人话/humanize"类指令时触发，不影响普通写作任务。
- 用户明确指名某个 skill（如"用 deslop"）时，跳过路由直接执行。
- 中文文本优先考虑对中文支持好的方案；**中文一律首选 qu-ai-wei**（模式一说"问一句"时再选模式）；轻量场景或 qu-ai-wei 不可用时退 humanizer-zh。anti-ai-slop-writing 的禁词表含中英双语，适合中文短文本的前置写作约束。humanizer-aboudjem 自带 patterns.zh.md 中文模式目录。
