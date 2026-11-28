/**
 * DEADLAB · 商业授权与防复刻安全卫士 (License & Anti-Piracy Guard v2.2)
 * 职责:
 *   1. 激活码校验：只接受另行发放、且仍在预发卡密清单中的序列号
 *   2. 商业推演核心算法授权门禁 (未付费锁定深度死因与动爻因果)
 *   3. 已保存的授权必须能对上当前清单，过期或公开码一律失效
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
    "DL-4NGU-7HUW", "DL-HQ7V-3RGL", "DL-4F9W-UPE7", "DL-CH9T-AHNX"
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

  function tokenFor(cleaned) {
    return 'DL_AUTH_' + cleaned.replace(/-/g, '_') + '_' + simpleChecksum(cleaned + '_SALT_2026');
  }

  // 校验激活码是否合法。只认预发卡密，不接受公开体验码，也不接受可自行推算的序列号。
  function verifyCode(code) {
    if (!code) return { valid: false, message: '请输入激活码' };
    const cleaned = String(code).trim().toUpperCase();

    if (OFFICIAL_CODES.has(cleaned)) {
      return { valid: true, token: tokenFor(cleaned), type: 'OFFICIAL_KEY', message: '官方授权码激活成功' };
    }

    return { valid: false, message: '激活码无效或已被使用，请检查输入或重新购买' };
  }

  // 已保存的令牌必须对得上当前仍有效的卡密。旧体验码和随意写入的令牌不再放行。
  function isLicensed() {
    if (typeof localStorage === 'undefined') return false;
    try {
      const token = localStorage.getItem('dl_license_token');
      if (!token) return false;
      for (const code of OFFICIAL_CODES) {
        if (tokenFor(code) === token) return true;
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
