/* DEADLAB project store and portable data helpers */
(function (g) {
  const KEY = "deadlab_projects_v1";
  const APP = "deadlab";
  const VERSION = 1;
  const LV_KEYS = ["need", "cap", "econ", "dist", "dep", "stam"];

  function uid() {
    return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cleanLevel(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= 0 && n <= 3 ? n : null;
  }

  function cleanLV(source) {
    const out = {};
    LV_KEYS.forEach(function (key) {
      out[key] = cleanLevel(source && source[key]);
    });
    return out;
  }

  function normalizeProject(input) {
    const src = input && typeof input === "object" ? input : {};
    const now = Date.now();
    const unknown = {};
    LV_KEYS.forEach(function (key) {
      unknown[key] = !!(src.unknown && src.unknown[key]);
    });
    return {
      app: APP,
      version: VERSION,
      id: String(src.id || uid()),
      name: String(src.name || src.project || "未命名项目").slice(0, 80),
      source: String(src.source || "").slice(0, 500),
      sourceMeta: String(src.sourceMeta || src.meta || "").slice(0, 1000),
      lv: cleanLV(src.lv || src.vars),
      unknown: unknown,
      veto: {
        copy: !!(src.veto && src.veto.copy),
        lic: !!(src.veto && src.veto.lic),
        plat: !!(src.veto && src.veto.plat)
      },
      result: src.result && typeof src.result === "object" ? src.result : null,
      notes: String(src.notes || "").slice(0, 4000),
      createdAt: Number(src.createdAt) || now,
      updatedAt: Number(src.updatedAt) || now
    };
  }

  function readRaw() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function list() {
    return readRaw()
      .map(normalizeProject)
      .sort(function (a, b) { return b.updatedAt - a.updatedAt; });
  }

  function write(projects) {
    const clean = projects.map(normalizeProject);
    localStorage.setItem(KEY, JSON.stringify(clean));
    return clean;
  }

  function get(id) {
    if (!id) return null;
    const found = readRaw().find(function (p) { return String(p.id) === String(id); });
    return found ? normalizeProject(found) : null;
  }

  function save(project) {
    const item = normalizeProject(project);
    item.updatedAt = Date.now();
    const projects = readRaw().map(normalizeProject);
    const index = projects.findIndex(function (p) { return p.id === item.id; });
    if (index >= 0) projects[index] = item;
    else projects.push(item);
    write(projects);
    return item;
  }

  function remove(id) {
    const projects = readRaw().filter(function (p) { return String(p.id) !== String(id); });
    write(projects);
  }

  function exportPayload(projects) {
    return JSON.stringify({
      app: APP,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      projects: (projects || list()).map(normalizeProject)
    }, null, 2);
  }

  function importPayload(text) {
    const parsed = typeof text === "string" ? JSON.parse(text) : text;
    const source = Array.isArray(parsed) ? parsed : parsed && parsed.projects;
    if (!Array.isArray(source)) throw new Error("JSON 中没有 projects 数组");
    const existing = readRaw().map(normalizeProject);
    const imported = source.map(function (p) {
      const item = normalizeProject(p);
      item.id = uid();
      item.createdAt = Date.now();
      item.updatedAt = Date.now();
      return item;
    });
    write(existing.concat(imported));
    return imported;
  }

  function encodeData(value) {
    const json = JSON.stringify(value);
    const utf8 = unescape(encodeURIComponent(json));
    return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeData(code) {
    let value = String(code || "").trim().replace(/-/g, "+").replace(/_/g, "/");
    while (value.length % 4) value += "=";
    const json = decodeURIComponent(escape(atob(value)));
    return JSON.parse(json);
  }

  function encodeMember(member, lv) {
    const bits = LV_KEYS.map(function (key) { return String(cleanLevel(lv[key]) || 0); }).join("");
    return encodeData({ app: APP, kind: "member", version: VERSION, member: member, bits: bits });
  }

  function decodeMember(code) {
    const data = decodeData(code);
    if (!data || data.app !== APP || data.kind !== "member" || !/^[0-3]{6}$/.test(data.bits || "")) {
      throw new Error("成员码格式不正确");
    }
    if (!/^[ABC]$/.test(data.member || "")) throw new Error("成员码缺少有效成员");
    const lv = {};
    LV_KEYS.forEach(function (key, index) { lv[key] = Number(data.bits[index]); });
    return { member: data.member, lv: lv };
  }

  function downloadJSON(filename, text) {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  g.DEADLAB_STORE = {
    KEY: KEY,
    LV_KEYS: LV_KEYS,
    uid: uid,
    escapeHTML: escapeHTML,
    normalizeProject: normalizeProject,
    list: list,
    get: get,
    save: save,
    remove: remove,
    exportPayload: exportPayload,
    importPayload: importPayload,
    encodeMember: encodeMember,
    decodeMember: decodeMember,
    downloadJSON: downloadJSON
  };
})(window);
