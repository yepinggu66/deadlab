/**
 * DEADLAB · 商业授权与防复刻安全卫士 (License & Anti-Piracy Guard v2.2)
 * 职责:
 *   1. 激活码与授权凭证防伪验签 (离线算法 + 正式卡密库)
 *   2. 商业推演核心算法授权门禁 (未付费锁定深度死因与动爻因果)
 *   3. 前端反盗版防复刻加固 (防止非法扒皮与白嫖复刻)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DEADLAB_LICENSE = factory();
    if (typeof window !== 'undefined') window.DEADLAB_LICENSE = root.DEADLAB_LICENSE;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  // 内置预发卡密清单 (与 codes.json 保持同步，用于离线与快速验证)
  const OFFICIAL_CODES = new Set([
    "DL-KD3N-GHV3", "DL-QLTN-PQN9", "DL-Q4F3-MKUR", "DL-W6KA-TMRA",
    "DL-HALX-4EVD", "DL-AG6H-7UKD", "DL-TLD7-X6N9", "DL-PHXK-6UHD",
    "DL-YTFN-EWDM", "DL-FC3F-NMTD", "DL-TGMG-KTHK", "DL-TMHT-LLFL",
    "DL-9YNK-N496", "DL-HVYW-DHQD", "DL-UVXW-HAXG", "DL-L43W-NPA3",
    "DL-4NGU-7HUW", "DL-HQ7V-3RGL", "DL-4F9W-UPE7", "DL-CH9T-AHNX",
    "DEADLAB-VIP-2026", "PRO-8888-8888"
  ]);

  // 简易哈希验签
  function simpleChecksum(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & 0xFFFFFFFF;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  }

  // 校验激活码是否合法
  function verifyCode(code) {
    if (!code) return { valid: false, message: '请输入激活码' };
    const cleaned = String(code).trim().toUpperCase();

    // 1. 是否在官方发行卡密库中
    if (OFFICIAL_CODES.has(cleaned)) {
      const token = 'DL_AUTH_' + cleaned.replace(/-/g, '_') + '_' + simpleChecksum(cleaned + '_SALT_2026');
      return { valid: true, token, type: 'OFFICIAL_KEY', message: '官方授权码激活成功' };
    }

    // 2. 离线算法校验 (格式: DL-[A-Z0-9]{4}-[A-Z0-9]{4})
    const match = cleaned.match(/^DL-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
    if (match) {
      const p1 = match[1];
      const p2 = match[2];
      // 算法校验和：p1 与 p2 字符乘积模校验
      let sum = 0;
      for (let i = 0; i < p1.length; i++) sum += p1.charCodeAt(i) * (i + 1);
      const expectedPrefix = (sum % 997).toString(36).toUpperCase().padStart(2, '0');
      if (p2.startsWith(expectedPrefix)) {
        const token = 'DL_AUTH_' + cleaned.replace(/-/g, '_') + '_' + simpleChecksum(cleaned);
        return { valid: true, token, type: 'ALGO_KEY', message: '算法序列号激活成功' };
      }
    }

    return { valid: false, message: '激活码无效或已被使用，请检查输入或重新购买' };
  }

  // 检查当前环境是否已经获得授权
  function isLicensed() {
    if (typeof localStorage === 'undefined') return false;
    try {
      const token = localStorage.getItem('dl_license_token');
      if (!token || !token.startsWith('DL_AUTH_')) return false;
      const parts = token.split('_');
      if (parts.length < 4) return false;
      return true;
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

  // 清除授权状态 (用于调试或注销)
  function revokeLicense() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem('dl_license_token');
      localStorage.removeItem('dl_license_time');
    } catch (e) {}
  }

  return {
    OFFICIAL_CODES,
    verifyCode,
    isLicensed,
    activateLicense,
    revokeLicense
  };
});
