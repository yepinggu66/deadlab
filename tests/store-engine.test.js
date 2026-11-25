const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function createWindow() {
  const data = {};
  const win = {
    localStorage: {
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
      },
      setItem(key, value) {
        data[key] = String(value);
      },
      removeItem(key) {
        delete data[key];
      }
    },
    btoa(value) {
      return Buffer.from(value, "binary").toString("base64");
    },
    atob(value) {
      return Buffer.from(value, "base64").toString("binary");
    },
    escape,
    unescape
  };
  win.window = win;
  vm.createContext(win);
  return win;
}

function loadInto(win, file) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), win, { filename: file });
}

const win = createWindow();
loadInto(win, "store.js");
loadInto(win, "engine.js");

const store = win.DEADLAB_STORE;
const engine = win.DEADLAB;
const lv = { need: 1, cap: 2, econ: 3, dist: 0, dep: 1, stam: 2 };

const first = store.save({ name: "A", lv, result: { s12: 0.42 } });
store.save({ name: "B", lv: { need: 2, cap: 2, econ: 2, dist: 2, dep: 2, stam: 2 } });
assert.strictEqual(store.list().length, 2);
assert.strictEqual(store.get(first.id).name, "A");

const payload = store.exportPayload();
const imported = store.importPayload(payload);
assert.strictEqual(imported.length, 2);
assert.strictEqual(store.list().length, 4);

const decoded = store.decodeMember(store.encodeMember("A", lv));
assert.strictEqual(decoded.member, "A");
assert.strictEqual(JSON.stringify(decoded.lv), JSON.stringify(lv));
assert.throws(() => store.decodeMember("not-a-member-code"));

assert.strictEqual(store.escapeHTML("<img onerror=x>"), "&lt;img onerror=x&gt;");

const a = JSON.stringify(engine.runSim(lv, 2000, 23));
const b = JSON.stringify(engine.runSim(lv, 2000, 23));
assert.strictEqual(a, b);

console.log("store-engine tests passed");
