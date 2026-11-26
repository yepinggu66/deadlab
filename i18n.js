/* DEADLAB i18n Runtime — Unified Bilingual Engine */
(function (g) {
  const SUPPORTED = ['zh', 'en'];

  function detectLang() {
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.includes(urlLang)) {
      localStorage.setItem('dl_lang', urlLang);
      return urlLang;
    }
    const saved = localStorage.getItem('dl_lang');
    if (SUPPORTED.includes(saved)) return saved;
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  const lang = detectLang();
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  const I18N = {
    lang,
    dict: {},
    t(key, vars) {
      let str = this.dict[key] || key;
      if (vars) {
        Object.keys(vars).forEach((k) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
        });
      }
      return str;
    },
    setLang(nextLang) {
      if (!SUPPORTED.includes(nextLang)) return;
      localStorage.setItem('dl_lang', nextLang);
      const u = new URL(location.href);
      u.searchParams.set('lang', nextLang);
      location.href = u.toString();
    },
    applyDOM(root = document) {
      root.querySelectorAll('[data-i18n]').forEach((el) => {
        const val = this.t(el.getAttribute('data-i18n'));
        if (val) el.textContent = val;
      });
      root.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const val = this.t(el.getAttribute('data-i18n-html'));
        if (val) el.innerHTML = val;
      });
      root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const val = this.t(el.getAttribute('data-i18n-placeholder'));
        if (val) el.setAttribute('placeholder', val);
      });
      const titleKey = document.body?.getAttribute('data-title-key');
      if (titleKey) document.title = this.t(titleKey);
    },
    async init() {
      try {
        const base = location.pathname.includes('/en/') ? '../i18n/' : './i18n/';
        const res = await fetch(`${base}${lang}.json?v=202611`);
        this.dict = await res.json();
      } catch (e) {
        console.warn('[DEADLAB i18n] Failed to load dictionary:', e);
      }
      this.applyDOM();
      window.dispatchEvent(new CustomEvent('deadlab:i18n-ready', { detail: { lang } }));
      return this;
    }
  };

  g.DL_I18N = I18N;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18N.init());
  } else {
    I18N.init();
  }
})(window);
