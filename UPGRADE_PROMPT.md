# DEADLAB v2.0 商业化升级与替换部署指南

## 一、 压缩包文件清单（直接覆盖放入项目根目录）
- `engine.js`：升级版六爻生存引擎（已内置 150 个真实创业项目 Day-0 校准模型、木桶致命短板熔断、历史百分位基准线，且原生支持中/英双语自动切换）。
- `worker.js`：Cloudflare Worker 边缘后端（包含兑换码防白嫖核销 `/api/verify`、支付自动发码回调 `/api/webhook/pay`、云端项目库 `/api/projects`、团队匿名盲填与认知分歧雷达 `/api/team/*`）。
- `schema.sql`：Cloudflare D1 SQLite 数据库建表脚本。
- `wrangler.toml`：Cloudflare Workers + Static Assets 一体化部署配置。
- `i18n.js` + `i18n/zh.json` + `i18n/en.json`：全站统一中英双语运行时与词典。
- `en/index.html` + `en/report.html`：老版英文链接无损重定向桩（自动带 `?lang=en` 跳转到新版统一页面）。

---

## 二、 发给本地 AI 编程智能体（Cursor / Antigravity / Claude Code）的改造指令

把本压缩包解压覆盖到你的项目根目录后，打开本地智能体，复制发送以下指令让它自动完成剩余 HTML 与 `store.js` 的接线：

```text
我已将 v2.0 核心文件（engine.js、worker.js、schema.sql、wrangler.toml、i18n.js、i18n/zh.json、i18n/en.json、en/index.html、en/report.html）放入项目根目录。请帮我完成以下接线改造并跑通测试：

1. 改造 store.js 并删除 codes.json：
   - 删除根目录的 codes.json；
   - 将兑换码校验改为调用 POST /api/verify（传入 { code, device_id }），成功后将返回的 token 存入 localStorage.setItem('dl_token', res.token)；
   - 将项目列表读写（save/load）改为优先请求 GET/POST /api/projects（请求头携带 Authorization: Bearer <dl_token>），本地 localStorage 仅作离线兜底。

2. 升级 report.html 展示层：
   - 读取 DEADLAB.forecast() 返回的 res.benchmark（包含 tier、label、percentile、cohortSurvRate、confidence、confNote）与 res.fatalFlags；
   - 在报告顶部渲染「150 真实项目历史参照系」卡片与红色「致命短板熔断警报条」。

3. 升级 team.html 为团队盲填模式：
   - 创建者调用 POST /api/team/create 生成并展示邀请链接（?room=rm_xxxxxx）；
   - 当 URL 包含 ?room= 参数时，成员填写六爻后调用 POST /api/team/submit 匿名提交（提交前隐藏他人打分）；
   - 提交后或点击查看汇总时，调用 GET /api/team/result，将 avgLevels 传入 DEADLAB.forecast() 渲染团队综合卦象，并将 divergences（极差 >= 2 的维度）渲染为红色认知撕裂预警。

4. 全站接入双语切换：
   - 在根目录所有 .html 页面的 <head> 中引入 <script src="i18n.js"></script>；
   - 为导航栏和核心标题添加 data-i18n 属性，并在顶部导航右侧增加一个语言切换按钮（onclick="DL_I18N.setLang(DL_I18N.lang === 'zh' ? 'en' : 'zh')"）。

5. 运行测试验证：
   - 执行 node tests/store-engine.test.js，确保全部单元测试通过。
```

---

## 三、 替换旧版本的部署步骤（Cloudflare Workers + D1）

1. **创建云端数据库并初始化表结构**：
   ```bash
   npx wrangler d1 create deadlab-db
   # 将终端输出的 database_id 填入 wrangler.toml 的 database_id 字段
   npx wrangler d1 execute deadlab-db --remote --file=./schema.sql
   ```
2. **配置加密密钥与支付回调密钥**：
   ```bash
   npx wrangler secret put JWT_SECRET
   npx wrangler secret put WEBHOOK_SECRET
   ```
3. **生成首批兑换码**（在私有数据库里生成，不要把真实卡密写进仓库、页面或前端脚本）：
   ```bash
   npx wrangler d1 execute deadlab-db --remote --command="INSERT INTO licenses (code, plan, max_uses, used_count, created_at) VALUES ('DL-REPLACE-WITH-PRIVATE-CODE', 'team', 5, 0, 1764120000000);"
   ```
4. **一键发布覆盖旧版本**：
   ```bash
   npx wrangler deploy
   ```
