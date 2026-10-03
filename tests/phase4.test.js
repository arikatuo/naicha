const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const diary = require('../utils/diary-store');
const { dateKey } = require('../utils/calendar');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const walk = (dir, ext, out = []) => {
  for (const name of fs.readdirSync(path.join(root, dir))) {
    const rel = path.join(dir, name);
    if (['node_modules', '.git', 'tests', 'docs', 'assets'].includes(name)) continue;
    if (fs.statSync(path.join(root, rel)).isDirectory()) walk(rel, ext, out);
    else if (rel.endsWith(ext)) out.push(rel);
  }
  return out;
};

function loadPage(relativePath) {
  let definition;
  const previousPage = global.Page;
  global.Page = (page) => { definition = page; };
  const file = path.join(root, relativePath);
  delete require.cache[require.resolve(file)];
  try { require(file); } finally { global.Page = previousPage; }
  return {
    ...definition,
    data: structuredClone(definition.data || {}),
    setData(patch) { Object.assign(this.data, patch); }
  };
}

function setup() {
  const values = new Map();
  const vibrations = [];
  const navigation = [];
  global.getApp = () => ({ globalData: {} });
  global.wx = {
    getStorageSync: (key) => values.get(key),
    setStorageSync: (key, value) => values.set(key, structuredClone(value)),
    switchTab: ({ url }) => navigation.push(url),
    navigateTo: ({ url }) => navigation.push(url),
    vibrateShort: ({ type }) => vibrations.push(type)
  };
  return { vibrations, navigation };
}

test('statistics show the average per cup and let a tapped bar toggle on and off', () => {
  setup();
  const today = dateKey(new Date());
  diary.saveRecord({ date: today, mode: 'custom', drinkName: '奶茶', calories: 300 });
  diary.saveRecord({ date: today, mode: 'custom', drinkName: '奶茶', calories: 401 });
  const stats = loadPage('pages/stats/stats.js');
  stats.onShow();
  assert.equal(stats.data.averageCalories, 351);
  const index = stats.data.buckets.findIndex((bucket) => bucket.count);
  stats.openBucket({ currentTarget: { dataset: { index } } });
  assert.equal(stats.data.selectedIndex, index);
  assert.ok(stats.data.selectedBucket);
  stats.openBucket({ currentTarget: { dataset: { index } } });
  assert.equal(stats.data.selectedIndex, -1);
  assert.equal(stats.data.selectedBucket, null);
  stats.changePeriod({ currentTarget: { dataset: { period: 'week' } } });
  assert.equal(stats.data.selectedIndex, -1);
});

test('empty statistics average stays zero instead of dividing by nothing', () => {
  setup();
  const stats = loadPage('pages/stats/stats.js');
  stats.onShow();
  assert.equal(stats.data.averageCalories, 0);
  assert.equal(stats.data.hasPeriodRecords, false);
});

test('period switch is a row of centred, equal-width options', () => {
  const markup = read('pages/stats/stats.wxml');
  const styles = read('pages/stats/stats.wxss');
  assert.match(markup, /<view [^>]*class="period-option [^"]*"[^>]*bindtap="changePeriod"/);
  assert.match(styles, /\.period-option\s*{[^}]*display:\s*flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;/s);
  assert.match(styles, /\.period-option\s*{[^}]*flex:\s*1;/s);
  assert.match(styles, /\.period-option\.active\s*{[^}]*background:\s*var\(--surface\);/s);
});

test('there is no press feedback or vibration anywhere: buttons opt out of the default grey flash', () => {
  for (const file of [...walk('pages', '.wxml'), 'custom-tab-bar/index.wxml']) {
    const markup = read(file);
    assert.doesNotMatch(markup, /hover-class="(?!none")/, file);
    for (const tag of markup.match(/<button\b[^>]*>/g) || []) {
      assert.match(tag, /hover-class="none"/, `${file}: ${tag.slice(0, 60)}`);
    }
  }
  for (const file of [...walk('pages', '.wxss'), ...walk('pages', '.js'), 'app.wxss', 'custom-tab-bar/index.wxss', 'utils/record-flow.js']) {
    const source = read(file);
    assert.doesNotMatch(source, /:active|\.press\b|vibrateShort|haptics/, file);
  }
  assert.equal(fs.existsSync(path.join(root, 'utils/haptics.js')), false);
});

test('no stylesheet falls back to heavy font weights, gradients or the old hard-coded accent', () => {
  for (const file of [...walk('pages', '.wxss'), 'app.wxss', 'custom-tab-bar/index.wxss']) {
    const css = read(file);
    assert.doesNotMatch(css, /font-weight:\s*(700|800|900)/, file);
    assert.doesNotMatch(css, /linear-gradient/, file);
  }
});
