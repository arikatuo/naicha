const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('global Clay-lite tokens use an accessible single-accent palette', () => {
  const appConfig = JSON.parse(read('app.json'));
  const styles = read('app.wxss');

  assert.equal(appConfig.window.navigationBarBackgroundColor, '#fbf8f3');
  assert.equal(appConfig.window.backgroundColor, '#fbf8f3');
  assert.match(styles, /page\s*{[^}]*background:\s*#fbf8f3;[^}]*color:\s*#2d1f18;/s);
  assert.match(styles, /\.button-primary\s*{[^}]*background:\s*linear-gradient\(145deg,\s*#b9473d,\s*#a94338\);[^}]*color:\s*#fff;/s);
  assert.match(styles, /\.surface\s*{[^}]*border-radius:\s*28rpx;[^}]*background:\s*#fff9f0;/s);
  assert.doesNotMatch(styles, /\.surface\s*{[^}]*inset/s);
});

test('calendar is the first page and makes first recording the primary action', () => {
  const markup = read('pages/home/home.wxml');
  const styles = read('pages/home/home.wxss');
  const appConfig = JSON.parse(read('app.json'));

  assert.equal(appConfig.pages[0], 'pages/home/home');
  assert.equal(appConfig.tabBar.list[0].text, '日历');
  assert.match(markup, /class="calendar-card surface"/);
  assert.match(markup, /这天的记录/);
  assert.match(markup, /class="empty-count"/);
  assert.match(markup, /bindtap="startRecord"/);
  assert.match(styles, /\.weekdays,\s*\.days-grid\s*{[^}]*grid-template-columns:\s*repeat\(7,/s);
});

test('brand page offers quick drinks and a brand fallback', () => {
  const markup = read('pages/brands/brands.wxml');
  const script = read('pages/brands/brands.js');

  assert.doesNotMatch(markup, /第一步/);
  assert.doesNotMatch(markup, /{{item\.drinkCount}}/);
  assert.match(markup, /选一杯你喝过的/);
  assert.match(markup, /wx:if="{{hasBrands}}"/);
  assert.match(markup, /class="empty-state"/);
  assert.match(script, /hasBrands:\s*false/);
  assert.match(script, /reloadBrands\(\)/);
});

test('drink page uses whole-card selection and an explicit close action', () => {
  const markup = read('pages/drinks/drinks.wxml');
  const script = read('pages/drinks/drinks.js');
  const styles = read('pages/drinks/drinks.wxss');

  assert.doesNotMatch(markup, /第二步/);
  assert.doesNotMatch(markup, /drink-action/);
  assert.doesNotMatch(markup, /sheet-handle/);
  assert.match(markup, /class="sheet-close"[^>]*aria-label="关闭饮品配置"/);
  assert.match(markup, /额外加料\s*{{selectedExtraToppingCount}}\/3/);
  assert.match(markup, /wx:if="{{hasContent}}"/);
  assert.match(markup, /class="empty-state"/);
  assert.match(script, /selectedExtraToppingCount:\s*0/);
  assert.match(script, /hasContent:\s*false/);
  assert.match(styles, /\.drink-list\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\);/s);
  assert.match(styles, /\.sheet\s*{[^}]*border-radius:\s*40rpx 40rpx 0 0;/s);
});

test('custom builder uses one form surface, selection count, and fixed action bar', () => {
  const markup = read('pages/custom/custom.wxml');
  const script = read('pages/custom/custom.js');
  const styles = read('pages/custom/custom.wxss');

  assert.equal((markup.match(/class="builder-surface surface"/g) || []).length, 1);
  assert.match(markup, /加点小料\s*{{selectedToppingCount}}\/4/);
  assert.match(markup, /class="submit-bar"/);
  assert.match(script, /selectedToppingCount:\s*0/);
  assert.match(styles, /\.submit-bar\s*{[^}]*position:\s*fixed;[^}]*bottom:\s*0;/s);
});

test('result page is adaptive, accessible, and recoverable', () => {
  const config = JSON.parse(read('pages/result/result.json'));
  const markup = read('pages/result/result.wxml');
  const script = read('pages/result/result.js');
  const styles = read('pages/result/result.wxss');

  assert.equal(config.disableScroll, undefined);
  assert.match(markup, /wx:if="{{hasResult}}"/);
  assert.match(markup, /wx:else class="error-state surface"/);
  assert.match(markup, /class="equivalent-swiper"/);
  assert.match(markup, /aria-label="上一个换算"/);
  assert.match(markup, /aria-label="下一个换算"/);
  assert.match(markup, /bindtap="saveRecord"/);
  assert.match(script, /hasResult:\s*false/);
  assert.match(script, /currentEquivalentPosition:\s*1/);
  assert.match(styles, /\.result-page\s*{[^}]*min-height:\s*100vh;/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*\n\s*height:\s*100vh/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(styles, /\.actions\s*{[^}]*margin-top:\s*auto;/s);
  assert.match(styles, /\.carousel-arrow\s*{[^}]*min-height:\s*72rpx;/s);
});

test('poster uses the shared Clay-lite palette', () => {
  const poster = read('utils/poster.js');

  assert.match(poster, /ctx\.fillStyle\s*=\s*'#fff4e5'/);
  assert.match(poster, /'#b9473d'/);
  assert.match(poster, /'#2d1f18'/);
  assert.match(poster, /'#6f5d51'/);
});

test('visual follow-up keeps brand cards compact and on the shared radius scale', () => {
  const markup = read('pages/brands/brands.wxml');
  const styles = read('pages/brands/brands.wxss');
  const brands = read('data/brands.js');

  assert.match(styles, /\.brand-card\s*{[^}]*min-height:\s*220rpx;[^}]*border-radius:\s*28rpx;/s);
  assert.match(styles, /\.brand-card\s*{[^}]*background:\s*#fff9f0;/s);
  assert.match(styles, /\.brand-logo-panel\s*{[^}]*height:\s*120rpx;/s);
  assert.match(styles, /\.brand-meta\s*{[^}]*gap:\s*10rpx;[^}]*padding-bottom:\s*4rpx;/s);
  assert.match(styles, /\.brand-name,\s*\.brand-subtitle\s*{[^}]*white-space:\s*nowrap;[^}]*text-overflow:\s*ellipsis;/s);
  assert.match(styles, /\.brand-subtitle\s*{[^}]*color:\s*#6f5d51;[^}]*font-weight:\s*500;/s);
  assert.match(markup, /<text class="soft-note-copy">/);
  assert.match(styles, /\.soft-note-copy\s*{[^}]*flex:\s*1;[^}]*min-width:\s*0;[^}]*white-space:\s*normal;/s);
  assert.doesNotMatch(brands, /\s&\s/);
});

test('configuration sheet uses a circular close control and a stretched safe footer action', () => {
  const markup = read('pages/drinks/drinks.wxml');
  const styles = read('pages/drinks/drinks.wxss');

  assert.match(styles, /\.drink-card\s*{[^}]*border-radius:\s*28rpx;/s);
  assert.match(markup, /class="sheet-close"[^>]*aria-label="关闭饮品配置"[^>]*>×<\/button>/s);
  assert.match(styles, /\.sheet-head\s*{[^}]*position:\s*relative;[^}]*padding-right:\s*108rpx;/s);
  assert.match(styles, /\.sheet-close\s*{[^}]*position:\s*absolute;[^}]*width:\s*88rpx;[^}]*min-height:\s*88rpx;/s);
  assert.match(styles, /\.readonly-row\s*{[^}]*align-items:\s*center;[^}]*min-height:\s*64rpx;/s);
  assert.match(styles, /\.sheet-footer\s*{[^}]*display:\s*grid;[^}]*box-sizing:\s*border-box;/s);
  assert.match(styles, /\.sheet-button\s*{[^}]*width:\s*auto;[^}]*align-self:\s*stretch;[^}]*margin:\s*0;/s);
});

test('supporting copy stays neutral', () => {
  const customMarkup = read('pages/custom/custom.wxml');

  assert.doesNotMatch(customMarkup, /轻一点/);
  assert.match(customMarkup, /最多选 4 种，按你平时的搭配来。/);
});

test('result page promotes deliberate recording and keeps sharing available', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');

  assert.match(markup, /class="actions"[\s\S]*class="button-primary save-record-button"[\s\S]*class="button-secondary share-button"/);
  assert.match(markup, /class="button-secondary poster-button"[\s\S]*class="button-secondary recalculate-button"/);
  assert.match(styles, /\.calorie-number\s*{[^}]*font-size:\s*100rpx;/s);
  assert.match(styles, /\.equivalent-swiper\s*{[^}]*height:\s*260rpx;/s);
  assert.match(styles, /\.actions\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s);
  assert.doesNotMatch(styles, /\.actions\s*{[^}]*margin-top:\s*auto;/s);
  assert.match(styles, /\.secondary-actions\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(styles, /\.save-record-button,\s*\.own-drink-button\s*{[^}]*width:\s*100%;/s);
});

test('result page separates sections and clarifies secondary action hierarchy', () => {
  const styles = read('pages/result/result.wxss');

  assert.match(styles, /\.result-shell\s*{[^}]*gap:\s*28rpx;/s);
  assert.match(styles, /\.equivalent-stage\s*{[^}]*gap:\s*18rpx;/s);
  assert.match(styles, /\.actions\s*{[^}]*margin-top:\s*22rpx;/s);
  assert.match(styles, /\.secondary-actions \.button-secondary\s*{[^}]*border:\s*2rpx solid #d5cfc8;[^}]*font-weight:\s*600;[^}]*box-shadow:\s*none;/s);
});

test('result metric badges pagination and icon tile use distinct visual roles', () => {
  const styles = read('pages/result/result.wxss');

  assert.match(styles, /\.result-badge\s*{[^}]*background:\s*#b9473d;[^}]*color:\s*#fff;/s);
  assert.match(styles, /\.estimate-badge\s*{[^}]*background:\s*#FAEEDA;[^}]*color:\s*#8b5f3f;/s);
  assert.match(styles, /\.metric-row\s*{[^}]*gap:\s*8rpx;/s);
  assert.match(styles, /\.card-number\s*{[^}]*font-size:\s*82rpx;/s);
  assert.match(styles, /\.carousel-controls\s*{[^}]*padding:\s*0 2rpx;/s);
  assert.match(styles, /\.icon-well\s*{[^}]*background:\s*linear-gradient\(145deg,\s*#fff0d2,\s*#f2d1a8\);/s);
});
