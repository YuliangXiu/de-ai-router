# de-ai-router 去AI味指令路由器

一个 Agent Skill：当你说"去AI味""说人话""humanize""deslop"时，它不直接改稿，而是先判断**文本类型**与**意图**，从 10 个去 AI 味 skills 中路由到最合适的一个，再加载执行。

**本仓库 self-contained**：`skills/` 目录已打包全部 10 个 skills，克隆即用，无需单独安装。

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

## 安装

**方式一：一键全装（推荐，self-contained）**

```bash
git clone https://github.com/YuliangXiu/de-ai-router.git /tmp/de-ai-router
mkdir -p ~/.claude/skills
# 路由器本体
cp -R /tmp/de-ai-router ~/.claude/skills/de-ai-router
# 10 个子 skill
for d in /tmp/de-ai-router/skills/*/; do cp -R "$d" ~/.claude/skills/$(basename "$d"); done
```

**方式二：只要路由器**（自己已有部分子 skill）

只复制根目录的 `SKILL.md`，并按需删改路由表。

子 skill 兼容 `SKILL.md` 约定的 agent 环境（Claude Code / Codex / WorkBuddy 等）。

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
| 从零写作防 AI 味 | anti-ai-slop-writing（前置硬规则） | slopbeth（奥威尔六规则） |
| 拿不准/混合 | humanize（41 模式最全） | humanizer-aboudjem |

完整决策表（含意图覆盖、切换策略、使用注意）见 [SKILL.md](SKILL.md)。

## 打包的 skills（`skills/` 目录）

| Skill | 作者 | 定位 |
|-------|------|------|
| qu-ai-wei | baibanbao | 中文首选：三家合并（王佩写作系统+humanizer-zh+lieflat 实测 117.9 万汉字语料），双模式，11 刀带人机频率数据 |
| humanizer-zh | op7418（歸藏） | 中文专用 31 模式，含 F 组中文特有检查 |
| no-ai-slop | Peter Yang | 锐利人类编辑，最小有效修改 + detect 模式 |
| unslop | Cursor 官方 | 扫描→重写→注入灵魂→自审 |
| slopbeth | ehmo | 密度优先，奥威尔六规则，证据边界，自带基准数据 |
| humanizer-aboudjem | Adam Boudjem | 55 模式 + 5 种 voice profile + 0-100 评分，含中文模式目录 |
| deslop | Stephen Turner | 唯一覆盖科研写作场景 |
| anti-ai-slop-writing | jalaal | 从零写作时的前置硬规则（禁词表+结构规则） |
| anti-slop | Matt Silverlock (elithrar) | 最大保留作者声音，假阳性比残留 tell 更糟 |
| humanize | aasha | 41 模式目录最全，事实边界+统计可测，含 sloplint |

来源与许可详见 [NOTICE.md](NOTICE.md)。8 个 MIT；2 个上游无 LICENSE（anti-ai-slop-writing、unslop），按惯例署名分发，权利人有异议即下架。

## 定制

- 路由决策表就是 `SKILL.md` 里的两个 Markdown 表格，直接改
- 装不齐 10 个也没关系——把路由表里没有的条目删掉即可
- 加自己的 skill：在表格加一行，保持"首选/备选"格式

## 许可

聚合层（路由逻辑）：MIT，见 [LICENSE](LICENSE)。
打包的各子 skill 许可归原作者，见 [NOTICE.md](NOTICE.md)。
