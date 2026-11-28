/**
 * DEADLAB · 授权码生成与哈希计算工具 (Keygen Utility)
 * 用法:
 *   node scripts/keygen.js [数量，默认 20]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const count = parseInt(process.argv[2] || '20', 10);
const SALT = 'DEADLAB_SALT_2026_SECURE';
const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 排除容易混淆的 0, 1, I, O

function randomPart(len) {
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

function generateCode() {
  return `DL-${randomPart(4)}-${randomPart(4)}`;
}

console.log(`Generating ${count} new secure license keys with salt...`);

const newCodes = [];
const hashes = [];

for (let i = 0; i < count; i++) {
  const code = generateCode();
  const hash = crypto.createHash('sha256').update(code + SALT).digest('hex');
  newCodes.push(code);
  hashes.push(hash);
}

console.log('\n--- 1. Private License Keys (发给买家的真实卡密) ---');
newCodes.forEach((c, idx) => {
  console.log(`[${(idx + 1).toString().padStart(2, '0')}] ${c}`);
});

console.log('\n--- 2. Public Hashes for license.js (放入前端 license.js 的哈希数组) ---');
hashes.forEach((h, idx) => {
  console.log(`    "${h}", // ${newCodes[idx]}`);
});

console.log('\nDone!');
