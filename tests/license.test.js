const assert = require('assert');
const license = require('../license.js');

console.log('Testing License & Anti-Piracy Module...');

function mockStorage() {
  const mem = new Map();
  global.localStorage = {
    getItem(k) { return mem.has(k) ? mem.get(k) : null; },
    setItem(k, v) { mem.set(k, String(v)); },
    removeItem(k) { mem.delete(k); }
  };
  return mem;
}

// 旧的可推算序列号：第二段以前四位加权和的 36 进制前缀开头即可通过。
function legacyAlgoCode(p1) {
  let sum = 0;
  for (let i = 0; i < p1.length; i++) sum += p1.charCodeAt(i) * (i + 1);
  const prefix = (sum % 997).toString(36).toUpperCase().padStart(2, '0');
  const p2 = (prefix + 'ZZ').slice(0, 4);
  return `DL-${p1}-${p2}`;
}

// 1. 验证未输入激活码
const emptyRes = license.verifyCode('');
assert.strictEqual(emptyRes.valid, false);

// 2. 验证官方发售卡密
const officialRes = license.verifyCode('DL-KD3N-GHV3');
assert.strictEqual(officialRes.valid, true);
assert.strictEqual(officialRes.type, 'OFFICIAL_KEY');
assert.ok(officialRes.token.startsWith('DL_AUTH_DL_KD3N_GHV3_'));
console.log('✔ Official license code verified');

// 3. 公开体验码 / 万能码必须失效
for (const code of ['DEADLAB-VIP-2026', 'deadlab-vip-2026', 'PRO-8888-8888']) {
  const res = license.verifyCode(code);
  assert.strictEqual(res.valid, false, code + ' must not unlock');
}
console.log('✔ Public experience / master codes rejected');

// 4. 可自行推算的序列号必须失效
const minted = legacyAlgoCode('WXYZ');
assert.ok(!license.OFFICIAL_CODES.has(minted));
assert.strictEqual(license.verifyCode(minted).valid, false);
console.log('✔ Computable license pattern rejected');

// 5. 验证非法伪造码
const fakeRes = license.verifyCode('DL-FAKE-1234');
assert.strictEqual(fakeRes.valid, false);
console.log('✔ Tampered / fake license rejected');

// 6. 已写入浏览器的旧令牌：只有仍在清单里的卡密继续有效
mockStorage();
assert.strictEqual(license.isLicensed(), false);
license.activateLicense(officialRes.token);
assert.strictEqual(license.isLicensed(), true);

license.activateLicense('DL_AUTH_DEADLAB_VIP_2026_ANY');
assert.strictEqual(license.isLicensed(), false);
license.activateLicense('DL_AUTH_A_B_C');
assert.strictEqual(license.isLicensed(), false);
license.activateLicense(license.verifyCode(minted).token || 'DL_AUTH_DL_WXYZ_ZZZZ_X');
assert.strictEqual(license.isLicensed(), false);
console.log('✔ Stored tokens rechecked against the current code list');

console.log('All License tests passed successfully!');
