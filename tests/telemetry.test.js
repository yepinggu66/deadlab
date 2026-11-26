const assert = require('assert');
const telemetry = require('../telemetry.js');

console.log('Testing Telemetry and Inquisitor Engine...');

// 1. 测试冷酷投资人审讯室
const vanityCase = telemetry.auditCommercialCase('我们准备做一个基于 GPT-4 的全自动生成工具，市场巨大，大家都会喜欢！');
assert.ok(vanityCase.questions.length >= 2, 'Should detect multiple evidence deficits');
assert.strictEqual(vanityCase.baseLv.need, 0, 'Demand should be locked to 0 for vanity claim');
assert.strictEqual(vanityCase.baseLv.dep, 0, 'Wrapper without moat should be locked to 0');
console.log('✔ Inquisitor vanity pitch scrutiny passed');

const realisticCase = telemetry.auditCommercialCase('B2B 获客插件，已有 15 个候补邮箱并收取了 3 位客户定金，定价每月 $49，单用户 API 成本经测算控制在 $4。');
assert.strictEqual(realisticCase.baseLv.need, 2, 'Should unlock need=2 with deposit proof');
assert.strictEqual(realisticCase.baseLv.econ, 2, 'Should unlock econ=2 with margin & cost proof');
console.log('✔ Inquisitor validated evidence pitch passed');

// 2. 测试 GitHub 活体脉搏心电图
const activeRepo = {
  commits: [{ date: new Date(Date.now() - 2 * 864e5).toISOString() }],
  repo: { full_name: 'test/active', stargazers_count: 500, open_issues_count: 5 }
};
const pulseActive = telemetry.computeVitalPulse(activeRepo);
assert.strictEqual(pulseActive.status, 'HEALTHY');
assert.strictEqual(pulseActive.stamRecommended, 3);
assert.ok(pulseActive.svgPath.includes('M 0,45'));
console.log('✔ Active repo vital pulse test passed');

const stalledRepo = {
  commits: [{ date: new Date(Date.now() - 35 * 864e5).toISOString() }],
  repo: { full_name: 'test/stalled', stargazers_count: 100, open_issues_count: 28 }
};
const pulseStalled = telemetry.computeVitalPulse(stalledRepo);
assert.strictEqual(pulseStalled.status, 'SEVERE');
assert.strictEqual(pulseStalled.stamRecommended, 1);
assert.ok(pulseStalled.alertMessage.includes('已连续 35 天无有效代码提交'));
console.log('✔ Stalled repo vital pulse test passed');

console.log('All Telemetry & Inquisitor tests successfully passed!');
