# de-ai-router 去AI味指令路由器

一个 Agent Skill：当你说"去AI味""说人话""humanize""deslop"时，它不直接改稿，而是先判断**文本类型**与**意图**，从已安装的去 AI 味 skills 中路由到最合适的一个，再加载执行。

## 设计动机

去 AI 味的 skill 有一个共同问题：风格差异极大，没有"全能冠军"。有人擅长最小修改保留原声，有人擅长注入个性，有人带实测语料数据。用错 skill 比不用更糟——比如给学术投稿用激进重写方案，论证结构会被破坏。

路由器把这些 skill 变成一个入口：

```
"去AI味" + 文本
      ↓
 文本类型？意图？
      ↓
 路由决策表 → 加载对应 skill → 执行
      ↓
 "太狠了 / 还不够" → 在路由表内切换
```

## 当前路由表（10 个 skill）

| 文本类型 / 意图 | 首选 | 备选 |
|---------|------|------|
| **中文（任意类型）** | **qu-ai-wei**（实测语料+双模式） | humanizer-zh（轻量） |
| 学术/科研（英文） | deslop（唯一覆盖论文/审稿回复） | slopbeth |
| 通用散文 | no-ai-slop（最小修改） | anti-slop（更保守） |
| 短文本 | anti-ai-slop-writing | no-ai-slop |
| 技术文档 | humanizer-aboudjem（technical voice） | slopbeth |
| 营销/宣传 | humanizer-aboudjem（warm/blunt） | unslop |
| 检测但不改写 | no-ai-slop detect 模式 | — |
| 检测+量化评分 | humanizer-aboudjem（0-100） | — |
| 拿不准/混合 | humanize（41 模式最全） | humanizer-aboudjem |

完整决策表（含意图覆盖、切换策略）见 [SKILL.md](SKILL.md)。

## 已覆盖的 skills

| Skill | 作者 | 定位 |
|-------|------|------|
| qu-ai-wei | baibanbao | 中文首选：三家合并（王佩写作系统+humanizer-zh+lieflat 实测 117.9 万汉字语料），双模式，11 刀带人机频率数据 |
| humanizer-zh | op7418（歸藏） | 中文专用 31 模式，含 F 组中文特有检查 |
| no-ai-slop | Peter Yang | 锐利人类编辑，最小有效修改 + detect 模式 |
| unslop | Cursor 官方 | 扫描→重写→注入灵魂→自审 |
| slopbeth | ehmo | 密度优先，奥威尔六规则，证据边界 |
| humanizer-aboudjem | Adam Boudjem | 55 模式 + 5 种 voice profile + 0-100 评分 |
| deslop | Stephen Turner | 唯一覆盖科研写作场景 |
| anti-ai-slop-writing | jalaal | 从零写作时的前置硬规则（禁词表+结构规则） |
| anti-slop | Matt Silverlock | 最大保留作者声音，假阳性比残留 tell 更糟 |
| humanize | aasha | 41 模式目录最全，事实边界+统计可测 |

## 安装

把本目录放进你的 agent skills 目录即可（Claude Code / WorkBuddy 等兼容 `SKILL.md` 约定的环境）：

```bash
git clone https://github.com/YuliangXiu/de-ai-router.git ~/.claude/skills/de-ai-router
```

路由器本身不包含上面 10 个 skill——它们需要单独安装。你可以按需装子集，路由表只推荐已安装的（把表里没有的条目删掉即可）。

## 定制

路由决策表就是两个 Markdown 表格，直接改 `SKILL.md`：

- 换掉不匹配你场景的首选/备选
- 删掉没安装的 skill 行
- 加入你自己的 skill

## 许可

MIT
