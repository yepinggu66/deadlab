const assert = require('assert');
const { spawnSync, spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cliPath = path.join(root, 'bin', 'deadlab.js');

console.log('Testing CLI and MCP Server...');

// 1. 测试 CLI JSON 格式输出
const jsonRun = spawnSync(process.execPath, [cliPath, '--preset', 'ai-wrapper', '--json'], { encoding: 'utf8' });
assert.strictEqual(jsonRun.status, 0, `CLI failed with error: ${jsonRun.stderr}`);
const jsonOutput = JSON.parse(jsonRun.stdout);
assert.strictEqual(jsonOutput.project, '薄套壳 AI 应用 (Thin Wrapper)');
assert.strictEqual(typeof jsonOutput.hexagram.primary[2], 'string');
assert.strictEqual(typeof jsonOutput.hexagram.result[2], 'string');
assert.ok(jsonOutput.hexagram.movingLines.length >= 1, 'Should have at least 1 moving line');
assert.ok(jsonOutput.fatalFlags.length >= 1, 'ai-wrapper should have fatal flags');
assert.strictEqual(jsonOutput.isFatal, true);
console.log('✔ CLI JSON output test passed');

// 2. 测试 CLI 渲染模式
const textRun = spawnSync(process.execPath, [cliPath, '--need', '2', '--cap', '2', '--econ', '0', '--dist', '3', '--dep', '1', '--stam', '2'], { encoding: 'utf8' });
assert.strictEqual(textRun.status, 0);
assert.ok(textRun.stdout.includes('DEADLAB · 程序员逆天卦'));
assert.ok(textRun.stdout.includes('卦象推演'));
assert.ok(textRun.stdout.includes('动爻'));
assert.ok(textRun.stdout.includes('立项熔断警告'));
console.log('✔ CLI terminal report test passed');

// 3. 测试 MCP Server 协议 (initialize, tools/list, tools/call)
const mcpProc = spawn(process.execPath, [cliPath, '--mcp'], { stdio: ['pipe', 'pipe', 'pipe'] });

let mcpStdout = '';
mcpProc.stdout.setEncoding('utf8');
mcpProc.stdout.on('data', chunk => {
  mcpStdout += chunk;
});

// 发送 initialize
mcpProc.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {}
}) + '\n');

// 发送 tools/list
mcpProc.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
}) + '\n');

// 发送 tools/call deadlab_check
mcpProc.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'deadlab_check',
    arguments: {
      name: '测试项目',
      need: 1,
      cap: 2,
      econ: 0,
      dist: 2,
      dep: 0,
      stam: 1
    }
  }
}) + '\n');

setTimeout(() => {
  mcpProc.stdin.end();
  mcpProc.kill();

  const lines = mcpStdout.trim().split('\n').filter(Boolean);
  assert.ok(lines.length >= 3, `Expected at least 3 responses from MCP server, got: ${lines.length}`);

  const resp1 = JSON.parse(lines[0]);
  assert.strictEqual(resp1.id, 1);
  assert.strictEqual(resp1.result.serverInfo.name, 'deadlab-mcp');

  const resp2 = JSON.parse(lines[1]);
  assert.strictEqual(resp2.id, 2);
  assert.strictEqual(resp2.result.tools[0].name, 'deadlab_check');

  const resp3 = JSON.parse(lines[2]);
  assert.strictEqual(resp3.id, 3);
  assert.ok(resp3.result.content[0].text.includes('DEADLAB · 立项沙盘推演报告'));
  assert.ok(resp3.result.content[0].text.includes('立项本卦'));
  assert.strictEqual(resp3.result.isFatal, true);

  console.log('✔ MCP Server protocol test passed');
  console.log('All CLI & MCP tests successfully completed!');
}, 600);
