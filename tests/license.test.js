const assert = require('assert');
const license = require('../license.js');

console.log('Testing License & Anti-Piracy Module v2.3...');

function mockStorage() {
  const mem = new Map();
  global.localStorage = {
    getItem(k) { return mem.has(k) ? mem.get(k) : null; },
    setItem(k, v) { mem.set(k, String(v)); },
    removeItem(k) { mem.delete(k); }
  };
  return mem;
}

// 1. 验证未输入激活码
const emptyRes = license.verifyCode('');
assert.strictEqual(emptyRes.valid, false);
console.log('✔ Empty code rejected');

// 2. 验证有效官方预发卡密 (由哈希验签通过，但前端无明文)
const validOfficialCode = 'DL-KD3N-GHV3';
const officialRes = license.verifyCode(validOfficialCode);
assert.strictEqual(officialRes.valid, true);
assert.strictEqual(officialRes.type, 'OFFICIAL_KEY');
assert.ok(officialRes.token.startsWith('DL_AUTH_V2_'));
console.log('✔ Official license code verified via salted SHA-256 hash');

// 3. 公开体验码 / 万能码必须失效
for (const code of ['DEADLAB-VIP-2026', 'deadlab-vip-2026', 'PRO-8888-8888', 'ADMIN-KEY']) {
  const res = license.verifyCode(code);
  assert.strictEqual(res.valid, false, code + ' must not unlock');
}
console.log('✔ Public experience / master codes rejected');

// 4. 任意非法/伪造/自行推算码必须失效
for (const fake of ['DL-FAKE-1234', 'DL-WXYZ-ZZZZ', 'DL-KD3N-0000']) {
  const fakeRes = license.verifyCode(fake);
  assert.strictEqual(fakeRes.valid, false);
}
console.log('✔ Tampered / fake / crafted licenses rejected');

// 5. 校验前端是否杜绝明文卡密泄露
assert.strictEqual(typeof license.OFFICIAL_CODES, 'undefined', 'OFFICIAL_CODES must not be exported');
assert.ok(license.OFFICIAL_HASHES instanceof Set, 'OFFICIAL_HASHES must be a Set');
assert.strictEqual(license.OFFICIAL_HASHES.size, 20, 'Must contain exactly 20 secure hashes');
console.log('✔ Front-end plain-text key leakage completely eliminated');

// 6. 已写入浏览器的令牌校验：只认清单内的真实授权
mockStorage();
assert.strictEqual(license.isLicensed(), false);
license.activateLicense(officialRes.token);
assert.strictEqual(license.isLicensed(), true);

license.activateLicense('DL_AUTH_DEADLAB_VIP_2026_ANY');
assert.strictEqual(license.isLicensed(), false);
license.activateLicense('DL_AUTH_A_B_C');
assert.strictEqual(license.isLicensed(), false);
license.activateLicense('DL_AUTH_V2_INVALID_HASH_TOKEN');
assert.strictEqual(license.isLicensed(), false);
console.log('✔ Stored tokens rigorously rechecked against valid hash pool');

console.log('All License tests passed successfully!');
