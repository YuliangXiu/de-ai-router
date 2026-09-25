# NOTICE — 收录 skills 的来源与许可

本仓库 `skills/` 目录打包了 10 个第三方去 AI 味 skills，方便一键安装。所有内容版权归原作者；本仓库仅做聚合分发，聚合本身（`de-ai-router/SKILL.md` 路由逻辑）为 MIT。

| Skill | 上游来源 | 许可 | 收录说明 |
|-------|---------|------|---------|
| **qu-ai-wei** | https://github.com/baibanbao/qu-ai-wei | MIT（见其 LICENSE） | 完整收录。本身是王佩写作系统 v4.0（未公开，作者已获授权内化）+ humanizer-zh + lieflat-less-ai-tone（MIT）的合并作品 |
| **humanizer-zh** | https://github.com/op7418/Humanizer-zh | MIT（见其 LICENSE） | 完整收录，含测试 |
| **slopbeth** | ehmo/slopkit（slopbeth skill） | MIT（见其 LICENSE） | 完整收录，含 benchmarks 与 scripts |
| **humanizer-aboudjem** | https://github.com/Aboudjem/humanizer-skill | MIT（上游仓库声明） | 完整收录，含中英 patterns 与 evals |
| **deslop** | https://github.com/stephenturner/skill-deslop | MIT（见其 LICENSE，© Stephen D. Turner） | 完整收录 |
| **anti-ai-slop-writing** | https://github.com/jalaalrd/anti-ai-slop-writing | **上游无 LICENSE 文件** | 按 skills 生态惯例收录（公开教程性 Markdown）；如权利人有异议请联系移除 |
| **unslop** | https://github.com/cursor/plugins（pstack/skills/unslop） | **上游无 LICENSE 文件** | Cursor 官方公开发布的 skill 文档；如权利人有异议请联系移除 |
| **no-ai-slop** | https://github.com/petergyang/no-ai-slop | MIT（上游仓库 LICENSE） | 收录 SKILL.md + eval.md |
| **anti-slop** | elithrar/dotfiles（agents-skills/anti-slop） | MIT（上游仓库 LICENSE） | 完整收录 |
| **humanize** | aasha（源仓库未详，本地快照） | MIT（见其 LICENSE） | 完整收录，含 sloplint 工具 |

## 免责

- 各 skill 的内容与观点归原作者所有，本仓库不对其效果作任何担保。
- 上游无 LICENSE 的两个条目（anti-ai-slop-writing、unslop）按行业惯例以完整署名方式分发；权利人提出异议即下架。
- 本聚合不改变任何 skill 的原始内容（除剔除 `.git`、`.gitignore`、`node_modules`）。
