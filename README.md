# 程序员逆天卦-沙盘 · DEADLAB

先算它怎么死，再决定要不要做。

## 目录

```
逆天卦_2026-11-24/
├─ index.html          沙盘（六爻 + 三票否决 → 5000 次推演 → 死法/死期/命门）
│                      含：校准账本、分享卡、今日一卦
├─ import.html         导入项目（GitHub / 本地文件夹 / JSON → 推断六爻 + 证据）
├─ cases.html          案例档案（4 个深案 + 导航）
├─ library.html        案例库（100 个原型，可搜索/筛选）
├─ team.html           团队模式（三人各填六爻 → 共识卦 + 分歧标红）
├─ compare.html        反事实对比（A/B 两条生存曲线）
├─ report.html         一页纸报告（A4 打印 / 存 PDF）
├─ api.html            API 文档 + 线上试跑
├─ engine.js           模型内核（六十四卦 + 蒙特卡洛），各页复用
├─ ui.css              子页面共用样式
├─ video/              宣传片源码与成片（promo.mp4）
├─ v1-起卦版.html      第一版（纯卦象，留档）
├─ v2-墨金版.html      第二版（宣纸金风格，留档）
└─ README.md
```

## 六项功能

| 模块 | 在哪 | 做了什么 |
|---|---|---|
| **导入项目** | import.html | 粘 GitHub 地址 / 选本地文件夹 / 粘 JSON，自动推断六爻并列出证据 |
| **三票否决** | 沙盘首页 | 版权 / 牌照 / 平台，任一红 → 存活率归零，不进推演 |
| **校准账本** | 沙盘 06 | 存证 → 到期点「活着/已死」→ 自动算 Brier 校准分 |
| **团队模式** | team.html | 三人各填六爻，合并共识，分歧 ≥2 档标红 |
| **一页纸报告** | report.html | 从上次推演生成 A4 报告，浏览器直接打印成 PDF |
| **案例库** | library.html | 100 个项目原型，按行业/名称检索，按存活率排序 |
| **反事实对比** | compare.html | 两套参数，同一条时间轴，两条生存曲线 |
| **竖版分享卡** | 沙盘结果页 | Canvas 生成 1080×1440 PNG，一键下载 |
| **API / 席位** | api.html | `DEADLAB.forecast()` 纯前端调用，可批量接入 |

## 本地打开

双击 `index.html` 即可。子页面通过 `engine.js` 共享同一套模型，无需构建。

## 部署

纯静态，整个文件夹就是产物。

```bash
npx wrangler pages deploy . --project-name deadlab   # Cloudflare Pages
npx vercel --prod                                     # Vercel
npx netlify deploy --prod --dir .                     # Netlify
```

## 视频

`video/promo.mp4` 1920×1080 / 99s。重新生成：

```powershell
$code = [System.IO.File]::ReadAllText("video\make.ps1", [System.Text.Encoding]::UTF8)
Invoke-Expression $code
```

需要 ffmpeg 和 Windows 中文语音 `Microsoft Huihui`。

## 口径

- 数字来自模型推演，不是真实统计；**绝对值别信，排序可信**。
- 案例与案例库均为演示用途，不构成投资或经营建议。
- 校准分只有在你真的回填结果之后才有意义；样本 < 5 时不要引用。
