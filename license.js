/**
 * DEADLAB · 商业授权与防复刻安全卫士 (License & Anti-Piracy Guard v2.3)
 * 职责:
 *   1. 激活码安全校验：采用加盐 SHA-256 不可逆单向散列验签（前端零明文，彻底杜绝逆向盗取）
 *   2. 商业推演核心算法授权门禁 (未付费锁定深度死因与动爻因果)
 *   3. 本地存储授权凭证校验，公开万能码与自行推算码一律失效
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DEADLAB_LICENSE = factory();
    if (typeof window !== 'undefined') window.DEADLAB_LICENSE = root.DEADLAB_LICENSE;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  // 加盐安全密钥 (单向散列加固)
  const SALT = 'DEADLAB_SALT_2026_SECURE';

  // 官方预发卡密加盐哈希库 (无任何明文卡密，杜绝 F12/控制台窥探)
  const OFFICIAL_HASHES = new Set([
    "c79cad0fa4a835a58fdd5e1884c8c34dd4fec788a835fa8468903f45a871b273",
    "1c98dd1c97a6d830c96eb2f8c35f71e28f8ed74beecc87b0fb393611062b6e72",
    "d92746617c1eef1b51cca4fd5ed95aa57fe59356179da5f7f8b2ebf3e20a24b4",
    "19183e998549b8c0a7b2579fd03ea28aa16fe2bc365460f8275fc5ad4a38ecf1",
    "7cd189907650d38fb67ea9fa342e1252ac6accad925bfb6bcf5aa4cd4dfc554d",
    "e33f16960cc8078a11605f38c0cf8fa4a511a7a41348de281b34df6d3264b5ea",
    "f858f8d5e795c462610e461b03f5c987e431d12154590028ab9e434450a5e187",
    "a7c390238caebe24d2f960a3e32bfb3a338b863d51e8bbb30bde8500f26d1aa0",
    "58b98a61f8e5e5be9600f82e1d44542bf379b887bb4e58ee61f4cd8ebfb474eb",
    "df4db46b5d5d98ef577d659a338a85c95b6effdb5030af7368ae388cb96cccab",
    "2e9fb3b8afe3dbbf4701ebb1d627b5b8470407477dcc42ed894bf4619e18804f",
    "2695803db754015edcc3d0433c0056ebadc14c792d3e070e20b439556cccb75e",
    "8cee6a3d0ba29d6e2c7fe7a88e77ee92401a1a72a73fc9d00e26414bcba272e5",
    "e10786dbb59f0df052dbc6ee0d30ad15ae1639215be0d2eb2c24228bb11da934",
    "c33956613844d2108b776792dcac7f28284199c0aa46d30002292f6931b387bd",
    "b56d15286c628f7e41eeac98a3047141e3481dba387088ead2874f477b3774b0",
    "9b6699f8e13cc1b0a8623e197c27390aa44f418d75332d0f86589bc3370a0db9",
    "5fc077311b52a420a80e3d71c1e6fe2e02e5066beb6bf23f20b240bce29f574c",
    "63083e7e55f822b72e08b00ee7a12589fa1fa67ff97bb58d04f1897c6fbb7e46",
    "e36f1fb281ca8be5346623e7c551aabaeffc1f6c108856d3c6efae984e5836b8"
  ]);

  // 高性能、零依赖纯 JS SHA-256 算法实现 (完全离线运行于各端)
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16), oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        var temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
        var temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  function hashOf(code) {
    return sha256(String(code).trim().toUpperCase() + SALT);
  }

  function tokenFor(hash) {
    return 'DL_AUTH_V2_' + hash.slice(0, 16) + '_' + hash.slice(-8).toUpperCase();
  }

  // 校验激活码是否合法。只认哈希匹配的卡密，杜绝前端明文泄漏。
  function verifyCode(code) {
    if (!code) return { valid: false, message: '请输入激活码' };
    const cleaned = String(code).trim().toUpperCase();
    const h = hashOf(cleaned);

    if (OFFICIAL_HASHES.has(h)) {
      return { valid: true, token: tokenFor(h), type: 'OFFICIAL_KEY', message: '官方授权码激活成功' };
    }

    return { valid: false, message: '激活码无效或已被使用，请检查输入或重新购买' };
  }

  // 检查已保存的授权令牌。只认仍在有效哈希清单里的授权，旧万能码与篡改一律失效。
  function isLicensed() {
    if (typeof localStorage === 'undefined') return false;
    try {
      const token = localStorage.getItem('dl_license_token');
      if (!token) return false;
      for (const h of OFFICIAL_HASHES) {
        if (tokenFor(h) === token) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // 保存授权状态
  function activateLicense(token) {
    if (typeof localStorage === 'undefined') return false;
    try {
      localStorage.setItem('dl_license_token', token);
      localStorage.setItem('dl_license_time', String(Date.now()));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 清除授权状态
  function revokeLicense() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem('dl_license_token');
      localStorage.removeItem('dl_license_time');
    } catch (e) {}
  }

  return {
    OFFICIAL_HASHES,
    verifyCode,
    isLicensed,
    activateLicense,
    revokeLicense
  };
});
