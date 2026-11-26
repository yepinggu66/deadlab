#!/usr/bin/env node

/**
 * DEADLAB · 程序员逆天卦 (CLI & MCP Server v2.1.0)
 * AI 时代开发者立项沙盘与商业风险熔断器
 *
 * 用法:
 *   1. CLI 命令行沙盘推演:
 *      npx deadlab-check --need 2 --cap 2 --econ 0 --dist 3 --dep 1 --stam 2
 *      npx deadlab-check --preset ai-wrapper
 *      npx deadlab-check --preset solo-saas --json
 *
 *   2. 作为 MCP Server 供 Cursor / Claude Code / Windsurf / Antigravity 调用:
 *      node bin/deadlab.js --mcp
 */

const path = require('path');
const engine = require(path.join(__dirname, '..', 'engine.js'));

// 预设经典立项典型案例
const PRESETS = {
  'ai-wrapper': {
    name: '薄套壳 AI 应用 (Thin Wrapper)',
    lv: { need: 1, cap: 2, econ: 0, dist: 2, dep: 0, stam: 1 }
  },
  'solo-saas': {
    name: '闭门造车小 SaaS (Zero-Distribution SaaS)',
    lv: { need: 2, cap: 3, econ: 2, dist: 0, dep: 1, stam: 2 }
  },
  'open-source': {
    name: '为爱发电开源工具 (Unmonetized Open-Source)',
    lv: { need: 2, cap: 3, econ: 0, dist: 2, dep: 2, stam: 1 }
  },
  'hard-tech': {
    name: '硬核研发找不着买家 (Tech In Search Of Need)',
    lv: { need: 0, cap: 3, econ: 1, dist: 0, dep: 3, stam: 3 }
  }
};

// ANSI 终端调色板
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m'
};

function parseArgs(args) {
  const parsed = {
    flags: {},
    params: {}
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed.params[key] = args[i + 1];
        i++;
      } else {
        parsed.flags[key] = true;
      }
    }
  }
  return parsed;
}

// -----------------------------------------------------------------------------
// MCP Server 模式 (JSON-RPC 2.0 over stdio)
// -----------------------------------------------------------------------------
function runMcpServer() {
  let buffer = '';

  function send(msg) {
    const json = JSON.stringify(msg);
    // 标准 MCP 格式可直接换行或包含 Content-Length
    process.stdout.write(json + '\n');
  }

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留未完成的一行

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const req = JSON.parse(trimmed);
        handleMcpRequest(req, send);
      } catch (err) {
        // 忽略非 JSON 行
      }
    }
  });

  process.stderr.write(`[DEADLAB MCP Server v2.1.0] Running on stdio...\n`);
}

function handleMcpRequest(req, send) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    send({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'deadlab-mcp',
          version: '2.1.0'
        }
      }
    });
    return;
  }

  if (method === 'notifications/initialized') {
    return; // 不需要回复
  }

  if (method === 'tools/list') {
    send({
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'deadlab_check',
            description: '【程序员逆天卦·商业立项熔断器】在生成代码或立项前，对 6 个核心维度（需求、交付、经济、分发、依赖、续航）进行动爻与变卦推演，预测 12/24 个月存活率，并在触发死穴时输出熔断警告和 3 条最小化避坑任务。',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: '项目名称或主要创意（可选）' },
                need: { type: 'integer', minimum: 0, maximum: 3, description: '需求验证度 (0自嗨, 1有人问, 2有人付钱, 3供不应求)' },
                cap: { type: 'integer', minimum: 0, maximum: 3, description: '交付能力 (0做不出, 1能跑常错, 2基本可信, 3稳定可用)' },
                econ: { type: 'integer', minimum: 0, maximum: 3, description: '单位经济 (0越用越亏, 1勉强持平, 2有毛利, 3很赚)' },
                dist: { type: 'integer', minimum: 0, maximum: 3, description: '分发渠道 (0没入口, 1几个熟人, 2稳定流量, 3自己会涨)' },
                dep: { type: 'integer', minimum: 0, maximum: 3, description: '生态依赖 (0全靠上游, 1单点依赖, 2有备选, 3自主)' },
                stam: { type: 'integer', minimum: 0, maximum: 3, description: '创始人续航 (0快撑不住, 1还能半年, 2能撑两年, 3长期主义)' }
              },
              required: ['need', 'cap', 'econ', 'dist', 'dep', 'stam']
            }
          }
        ]
      }
    });
    return;
  }

  if (method === 'tools/call') {
    const toolName = params ? params.name : null;
    const args = (params && params.arguments) || {};

    if (toolName === 'deadlab_check') {
      const lv = {
        need: Math.max(0, Math.min(3, parseInt(args.need || 0, 10))),
        cap: Math.max(0, Math.min(3, parseInt(args.cap || 0, 10))),
        econ: Math.max(0, Math.min(3, parseInt(args.econ || 0, 10))),
        dist: Math.max(0, Math.min(3, parseInt(args.dist || 0, 10))),
        dep: Math.max(0, Math.min(3, parseInt(args.dep || 0, 10))),
        stam: Math.max(0, Math.min(3, parseInt(args.stam || 0, 10)))
      };

      const result = engine.forecast(lv);
      const evo = engine.evolveHexagram(lv);
      const isFatal = (result.fatalFlags && result.fatalFlags.length > 0) || result.s24 < 0.15;

      let md = `## ☯ DEADLAB · 立项沙盘推演报告\n\n`;
      if (args.name) md += `**项目名称**: ${args.name}\n\n`;

      if (isFatal) {
        md += `> 🛑 **【立项熔断警告 FATAL CIRCUIT BREAKER】**\n`;
        md += `> 商业推演显示该项目 24 个月存活率仅为 **${(result.s24 * 100).toFixed(1)}%**，存在致命商业死穴！\n`;
        md += `> 强烈建议在写代码前，先完成最小化闭环验证。\n\n`;
      } else {
        md += `> 🟢 **【沙盘推演通过】** 24 个月基线存活率预测: **${(result.s24 * 100).toFixed(1)}%**。\n\n`;
      }

      md += `### 1. 卦象演化与动爻推演\n`;
      md += `* **立项本卦**: 【${evo.primaryHex[2]}】（${evo.primaryHex[3]}）\n`;
      md += `* **动爻数量**: ${evo.movingLines.length} 个相位动爻\n`;
      md += `* **终局变卦**: 【${evo.resultHex[2]}】（${evo.resultHex[3]}）\n\n`;
      md += `**演化叙事**:\n${evo.narrative}\n\n`;

      md += `### 2. 量化生存指标\n`;
      md += `* 12 个月存活几率: **${(result.s12 * 100).toFixed(1)}%**\n`;
      md += `* 24 个月存活几率: **${(result.s24 * 100).toFixed(1)}%**\n`;
      md += `* 中位生存时间: **${result.median} 个月**\n`;
      md += `* 头号死穴: **${result.outTop ? result.outTop[0] : '无明显死因'}**\n\n`;

      if (result.fatalFlags && result.fatalFlags.length > 0) {
        md += `### 3. 致命短板排查 (Fatal Flags)\n`;
        result.fatalFlags.forEach((flag, idx) => {
          md += `${idx + 1}. ${flag}\n`;
        });
        md += `\n`;
      }

      md += `### 4. 最小化验证任务 (Action Plan)\n`;
      md += `1. **需求验证**: 严禁在未获得 3 位用户明确付费预约前盲目开发大功能。\n`;
      md += `2. **单位经济**: 算清单次核心业务的 API/算力与获客成本底线，拒绝负毛利做推广。\n`;
      md += `3. **反上游绞杀**: 确保核心交付具备独立业务资产，而非纯粹的薄层转发。\n`;

      send({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: md
            }
          ],
          isFatal,
          s12: result.s12,
          s24: result.s24,
          primaryHex: evo.primaryHex[2],
          resultHex: evo.resultHex[2]
        }
      });
      return;
    }

    send({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Tool not found: ${toolName}`
      }
    });
    return;
  }

  // 默认未知方法
  send({
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  });
}

// -----------------------------------------------------------------------------
// CLI 交互与报告渲染
// -----------------------------------------------------------------------------
function renderCliReport(lv, projectName) {
  const result = engine.forecast(lv);
  const evo = engine.evolveHexagram(lv);
  const isFatal = (result.fatalFlags && result.fatalFlags.length > 0) || result.s24 < 0.15;

  console.log(`\n${c.bold}${c.cyan}┌────────────────────────────────────────────────────────┐${c.reset}`);
  console.log(`${c.bold}${c.cyan}│   ☯  DEADLAB · 程序员逆天卦 (AI 时代立项商业熔断器)     │${c.reset}`);
  console.log(`${c.bold}${c.cyan}│   版本: v2.1.0 · 内核: 动爻状态机与 150 样本校准模型     │${c.reset}`);
  console.log(`${c.bold}${c.cyan}└────────────────────────────────────────────────────────┘${c.reset}\n`);

  if (projectName) {
    console.log(`${c.bold}【项目推演】:${c.reset} ${c.yellow}${projectName}${c.reset}`);
  }

  // 本卦与变卦横幅
  console.log(`${c.bold}【卦象推演】:${c.reset} 本卦【${c.bold}${evo.primaryHex[2]}${c.reset}】(${evo.primaryHex[3]}) ──${evo.movingLines.length > 0 ? c.red + ' (触发动爻变卦) ' + c.reset : ' (静卦稳定) '}──> 变卦【${c.bold}${evo.resultHex[2]}${c.reset}】(${evo.resultHex[3]})`);

  // 六爻盘 ASCII 渲染 (从上爻到底部初爻)
  console.log(`\n${c.bold}六爻推演盘:${c.reset}`);
  const linesNames = [
    { name: '初爻 · 需求', val: lv.need, key: 'need', label: engine.VARS[0].lv[lv.need] },
    { name: '二爻 · 能力', val: lv.cap,  key: 'cap',  label: engine.VARS[1].lv[lv.cap] },
    { name: '三爻 · 经济', val: lv.econ, key: 'econ', label: engine.VARS[2].lv[lv.econ] },
    { name: '四爻 · 分发', val: lv.dist, key: 'dist', label: engine.VARS[3].lv[lv.dist] },
    { name: '五爻 · 依赖', val: lv.dep,  key: 'dep',  label: engine.VARS[4].lv[lv.dep] },
    { name: '上爻 · 续航', val: lv.stam, key: 'stam', label: engine.VARS[5].lv[lv.stam] }
  ];

  // 倒序打印：上爻在上，初爻在下
  for (let i = 5; i >= 0; i--) {
    const item = linesNames[i];
    const isYang = item.val >= 2;
    const moving = evo.movingLines.find(l => l.index === i);

    let yaoSymbol = isYang ? `${c.green}━━━━━━━━━━━${c.reset}` : `${c.dim}━━━━━ ━━━━━${c.reset}`;
    let movingTag = '';
    if (moving) {
      yaoSymbol = `${c.red}━━━━━ ⭕ ━━━━${c.reset}`;
      movingTag = ` ${c.bgRed}${c.white} 动爻发动 [${moving.yao}·第${moving.month}月] ${c.reset}`;
    }

    console.log(`  ${item.name}:  ${yaoSymbol}  ${isYang ? c.green + '阳' : c.dim + '阴'}${c.reset}  (${item.label})${movingTag}`);
  }

  // 动爻演化故事叙述
  console.log(`\n${c.bold}【时序动爻叙事】:${c.reset}`);
  console.log(`${c.yellow}${evo.narrative}${c.reset}`);

  // 量化指标
  console.log(`\n${c.bold}【24 个月量化生存预测】:${c.reset}`);
  const s12Color = result.s12 >= 0.5 ? c.green : (result.s12 >= 0.3 ? c.yellow : c.red);
  const s24Color = result.s24 >= 0.4 ? c.green : (result.s24 >= 0.2 ? c.yellow : c.red);
  console.log(`  * 12 个月基线存活率: ${s12Color}${c.bold}${(result.s12 * 100).toFixed(1)}%${c.reset}`);
  console.log(`  * 24 个月基线存活率: ${s24Color}${c.bold}${(result.s24 * 100).toFixed(1)}%${c.reset}`);
  console.log(`  * 中位生存周期:     ${c.bold}${result.median} 个月${c.reset}`);
  console.log(`  * 头号高危死因:     ${c.red}${result.outTop ? result.outTop[0] : '无明显死因'}${c.reset}`);

  // 熔断警告
  if (isFatal) {
    console.log(`\n${c.bgRed}${c.white}${c.bold} ⚠️  【立项熔断警告 CIRCUIT BREAKER TRIGGERED】 ${c.reset}`);
    if (result.fatalFlags && result.fatalFlags.length > 0) {
      result.fatalFlags.forEach((flag, idx) => {
        console.log(`  ${c.red}[${idx + 1}] ${flag}${c.reset}`);
      });
    } else {
      console.log(`  ${c.red}[!] 24 个月综合存活率低于 15% 临界线，商业结构极度脆弱！${c.reset}`);
    }
  } else {
    console.log(`\n${c.green}${c.bold} ✔  【沙盘检测通过】 未触发硬性死因熔断，具备基本启动条件。${c.reset}`);
  }

  // 最小化避坑任务
  console.log(`\n${c.bold}🛡️  【最小化验证避坑任务 ACTION PLAN】:${c.reset}`);
  console.log(`  1. ${c.cyan}需求排查${c.reset}: 严禁未收款直接开工。先做 Landing Page，验证是否有 3 个真实付款或预售预约。`);
  console.log(`  2. ${c.cyan}成本筑底${c.reset}: 精算单次调用 COGS，确保客单价至少覆盖毛利的 3 倍，绝不垫资买量。`);
  console.log(`  3. ${c.cyan}解耦防绞杀${c.reset}: 关键链路预留第二供应商或本地回退方案，防止被上游一口吃掉。\n`);
}

function showHelp() {
  console.log(`
${c.bold}${c.cyan}DEADLAB · 程序员逆天卦 (CLI & MCP Server v2.1.0)${c.reset}
AI 编程时代立项沙盘推演与商业风险熔断器

${c.bold}用法:${c.reset}
  npx deadlab-check [选项]

${c.bold}参数说明 (各爻档位 0 ~ 3):${c.reset}
  --need <0-3>   需求验证 (0自嗨, 1有人问, 2有人付钱, 3供不应求)
  --cap  <0-3>   交付能力 (0做不出, 1能跑常错, 2基本可信, 3稳定可用)
  --econ <0-3>   单位经济 (0越用越亏, 1勉强持平, 2有毛利, 3很赚)
  --dist <0-3>   分发渠道 (0没入口, 1几个熟人, 2稳定流量, 3自己会涨)
  --dep  <0-3>   生态依赖 (0全靠上游, 1单点依赖, 2有备选, 3自主)
  --stam <0-3>   创始人续航 (0快撑不住, 1还能半年, 2能撑两年, 3长期主义)

${c.bold}常用快捷方式:${c.reset}
  --preset <name>       加载预设案例: ai-wrapper, solo-saas, open-source, hard-tech
  --name <title>        设置项目名称
  --json                以纯 JSON 格式输出推演数据 (便于 CI/CD 与工具链集成)
  --mcp                 启动 MCP Server 监听 stdio (供 Cursor / Claude Code 等 IDE 工具调用)
  --help                查看此帮助信息

${c.bold}示例:${c.reset}
  npx deadlab-check --preset ai-wrapper
  npx deadlab-check --need 2 --cap 2 --econ 0 --dist 3 --dep 1 --stam 2
  npx deadlab-check --preset solo-saas --json
`);
}

// -----------------------------------------------------------------------------
// 入口主逻辑
// -----------------------------------------------------------------------------
function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  // 1. MCP Server 模式
  if (args.flags.mcp) {
    runMcpServer();
    return;
  }

  // 2. 帮助
  if (args.flags.help || (argv.length === 0 && process.stdout.isTTY)) {
    showHelp();
    return;
  }

  // 3. 解析六爻数据
  let lv = { need: 1, cap: 2, econ: 1, dist: 1, dep: 1, stam: 2 };
  let projectName = args.params.name || '';

  if (args.params.preset && PRESETS[args.params.preset]) {
    const p = PRESETS[args.params.preset];
    lv = Object.assign({}, p.lv);
    if (!projectName) projectName = p.name;
  }

  ['need', 'cap', 'econ', 'dist', 'dep', 'stam'].forEach(k => {
    if (args.params[k] !== undefined) {
      lv[k] = Math.max(0, Math.min(3, parseInt(args.params[k], 10)));
    }
  });

  // 4. JSON 模式
  if (args.flags.json) {
    const result = engine.forecast(lv);
    const evo = engine.evolveHexagram(lv);
    const output = {
      project: projectName,
      lv,
      hexagram: {
        primary: evo.primaryHex,
        result: evo.resultHex,
        movingLines: evo.movingLines,
        narrative: evo.narrative
      },
      metrics: {
        s12: result.s12,
        s24: result.s24,
        medianMonths: result.median,
        topCause: result.outTop ? result.outTop[0] : null
      },
      fatalFlags: result.fatalFlags,
      isFatal: (result.fatalFlags && result.fatalFlags.length > 0) || result.s24 < 0.15
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // 5. 渲染格式化 CLI 报告
  renderCliReport(lv, projectName);
}

main();
