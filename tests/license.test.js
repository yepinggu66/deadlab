const assert = require('assert');
const license = require('../license.js');

console.log('Testing License & Anti-Piracy Module...');

// 1. 验证未输入激活码
const emptyRes = license.verifyCode('');
assert.strictEqual(emptyRes.valid, false);

// 2. 验证官方发售卡密
const officialRes = license.verifyCode('DL-KD3N-GHV3');
assert.strictEqual(officialRes.valid, true);
assert.strictEqual(officialRes.type, 'OFFICIAL_KEY');
assert.ok(officialRes.token.startsWith('DL_AUTH_DL_KD3N_GHV3_'));
console.log('✔ Official license code verified');

// 3. 验证 VIP 超级码
const vipRes = license.verifyCode('DEADLAB-VIP-2026');
assert.strictEqual(vipRes.valid, true);
console.log('✔ VIP master license code verified');

// 4. 验证非法伪造码
const fakeRes = license.verifyCode('DL-FAKE-1234');
assert.strictEqual(fakeRes.valid, false);
console.log('✔ Tampered / fake license rejected');

console.log('All License tests passed successfully!');
