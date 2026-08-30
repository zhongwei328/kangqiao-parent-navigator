# 家长版 Demo — 验收清单（Acceptance Checklist）

> 当前版本验收行为基线。每次加功能前先 `npm test`（= `node test/harness.js`）确保全部通过，再动手。
> 测试桩 `test/harness.js` 用 DOM 桩 `eval` 真实 `index.html` 应用段，**73 条断言全过**即视为主链路未回归。

## 1. 录入与 PDF 辅助填表
- [x] 「上传学校 PDF 报告」置于录入卡**最顶部**（姓名之前），无 PDF 也可手动填。
- [x] PDF 提取**跨 IB 报告格式通用**：G6（Phase 4）与 G7（Phase 3）均正确，不依赖硬编码年级头。
- [x] **老师评语全部捕获并录入** `teacherComment`（含非核心科目：社会情感课/音乐课/设计课…），按最近科目头映射中文名。
- [x] **学科成绩 + A/B/C/D 四标准**从报告摘要表读取，兼容「老师名前缀」写法（如 `Po Chen 6 8 7 8`）。
- [x] 已知坑：G6/G7 报告 PDF 本身**无国籍行** → `nationality` 留空属正常（非 bug），需手动补。

## 2. 行动清单（校内资源优先 + 优先级 + 来源链接）
- [x] 每条行动带 **原因 + 信息来源(📌)**；学科/SA 行动挂**真实链接**（IB MYP 官方课程页 / 康桥官网）。
- [x] 按 `紧急×10+重要` 降序排 P1…Pn；SA 未达标恒为 P1。
- [x] 校内课程点名康桥真实项目（状元养成计划 / 语言中心）并挂官网项目链接。

## 3. 竞争力总览与结论
- [x] 本地结论显式带 **英语标化缺口**（方向驱动：港三→TOEFL/IELTS；美Top30+无SAT→SAT/ACT）+ **SA 完成度**（0/7 最高优先级风险项）。
- [x] 已录 TOEFL/SAT 时列成绩；标化齐 + SA 达标显示「已覆盖/满足」；SA 未录入提示需核实。
- [x] 结论保留 MBTI / Holland / 兴趣地图，结合国籍(Non-JUPAS 池)与申请方向。

## 4. 优势与待改进点（③）
- [x] **以老师评语为主、学科分数补充**：评语存在时优点/待改进主要来自评语，并自动剔除「既夸又批」自相矛盾项；未录评语回退分数推断并提示。

## 5. 年度路线图
- [x] 逐年列到 **G12**；起点=录入当前年级（非硬编码）；末节点=申请目标年级并高亮。
- [x] 含康桥 IB 基准水位（均分 35-36，40+ 占 18%-23%）。

## 6. AI 实时诊断（MiniMax）
- [x] KPI 状态框**始终显示**三种模式：🤖 AI 实时诊断 / ⚠️ AI 失败已回退本地 / 🧮 本地诊断（未填 Key）。
- [x] 提示词 P0：反幻觉（严禁编造/白名单/未录入）+ 家长可读 + 结论结构化(positioning/edge/risks/nextWindow)。
- [x] 提示词 P1：yearsToApply 时间窗 + 竞争基准量化；P1-6 temperature=0.3 / max_tokens=2048。
- [x] 提示词 P2-7：拆 system/user 角色 + 输出前自检五项核对；P2-8：正反示例。
- [x] 连通性自检：可达→true，网络失败→false（提前回退，不干等 30s）。
- [x] 业务错误识别：HTTP 200 但 `base_resp.status_code=1004` → 明确提示 Key 无效/过期。

## 7. 自测链接（已实测免费出结果）
- [x] MBTI → 16personalities.com/zh-cn
- [x] Holland → psyctest.cn
- [x] 兴趣地图 → mynextmove.org/explore/ip（O*NET Interest Profiler）

## 回归 fixtures
- `test/fixtures/henry_g6_report.txt`（2025_Grade_6_1_Henry.pdf）
- `test/fixtures/henry_g7_report.txt`（2026_Grade_7_2_Henry.pdf）
