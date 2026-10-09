const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('global design tokens define one accent palette, two font weights and shared radii', () => {
  const appConfig = JSON.parse(read('app.json'));
  const styles = read('app.wxss');

  assert.equal(appConfig.window.navigationBarBackgroundColor, '#fbf8f3');
  assert.equal(appConfig.window.backgroundColor, '#fbf8f3');
  assert.match(styles, /page\s*{[^}]*--bg:\s*#fbf8f3;/s);
  assert.match(styles, /page\s*{[^}]*--primary:\s*#b9473d;/s);
  assert.match(styles, /page\s*{[^}]*--text:\s*#2d1f18;/s);
  assert.match(styles, /page\s*{[^}]*--r-lg:\s*32rpx;/s);
  assert.match(styles, /page\s*{[^}]*background:\s*var\(--bg\);[^}]*color:\s*var\(--text\);/s);
  assert.match(styles, /\.button-primary\s*{[^}]*background:\s*var\(--primary\);[^}]*color:\s*#fff;/s);
  assert.match(styles, /\.surface\s*{[^}]*border-radius:\s*var\(--r-lg\);/s);
  assert.doesNotMatch(styles, /font-weight:\s*(700|800|900)/);
  assert.doesNotMatch(styles, /linear-gradient/);
});

test('calendar is the first page and makes recording the primary action', () => {
  const markup = read('pages/home/home.wxml');
  const styles = read('pages/home/home.wxss');
  const appConfig = JSON.parse(read('app.json'));

  assert.equal(appConfig.pages[0], 'pages/home/home');
  assert.equal(appConfig.tabBar.list[0].text, '日历');
  assert.match(markup, /class="calendar-card surface"/);
  assert.match(markup, /class="heat-legend"/);
  assert.match(markup, /heat-dot tier-{{item\.tier}}/);
  assert.match(markup, /bindtap="startRecord"/);
  assert.match(markup, /bindtap="toggleMore"/);
  assert.doesNotMatch(markup, /disabled=/);
  assert.match(styles, /\.weekdays,\s*\.days-grid\s*{[^}]*grid-template-columns:\s*repeat\(7,/s);
  assert.match(styles, /\.record-more\s*{[^}]*min-height:\s*88rpx;/s);
});

test('record tab offers recent drinks, quick drinks, custom entry and brands', () => {
  const markup = read('pages/record/record.wxml');
  const script = read('pages/record/record.js');

  assert.match(markup, /最近喝过/);
  assert.match(markup, /按品牌找/);
  assert.match(markup, /自己搭一杯/);
  assert.match(markup, /class="date-chip"/);
  assert.match(markup, /wx:if="{{hasBrands}}"/);
  assert.match(markup, /class="empty-state surface"/);
  assert.match(script, /hasBrands:\s*false/);
  assert.match(script, /reloadBrands\(\)/);
  assert.match(script, /onTabItemTap\(\)/);
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
  assert.match(styles, /\.drink-list\s*{[^}]*flex-direction:\s*column;/s);
  assert.match(styles, /\.sheet\s*{[^}]*border-radius:\s*var\(--r-lg\) var\(--r-lg\) 0 0;/s);
});

test('custom builder uses one form surface, selection count, and fixed action bar', () => {
  const markup = read('pages/custom/custom.wxml');
  const script = read('pages/custom/custom.js');
  const styles = read('pages/custom/custom.wxss');

  assert.equal((markup.match(/class="builder-surface surface"/g) || []).length, 1);
  assert.match(markup, /加点小料[\s\S]*{{selectedToppingCount}}\/4/);
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
  assert.match(markup, /class="equivalent-card hero-equivalent"/);
  assert.match(markup, /bindtap="selectEquivalent"/);
  assert.match(markup, /bindtap="saveRecord"/);
  assert.match(script, /hasResult:\s*false/);
  assert.match(script, /currentEquivalentPosition:\s*1/);
  assert.match(styles, /\.result-page\s*{[^}]*min-height:\s*100vh;/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*\n\s*height:\s*100vh/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(styles, /\.actions\s*{[^}]*margin-top:\s*auto;/s);
  assert.match(styles, /\.equivalent-tile\s*{[^}]*min-height:\s*112rpx;/s);
});

test('poster uses the shared palette', () => {
  const poster = read('utils/poster.js');

  assert.match(poster, /ctx\.fillStyle\s*=\s*'#fbf8f3'/);
  assert.match(poster, /'#b9473d'/);
  assert.match(poster, /'#2d1f18'/);
  assert.match(poster, /'#6f5d51'/);
});

test('brand cards stay compact and use the shared tokens', () => {
  const styles = read('pages/record/record.wxss');
  const brands = read('data/brands.js');

  assert.match(styles, /\.brand-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(styles, /\.brand-card\s*{[^}]*border-radius:\s*var\(--r-md\);/s);
  assert.match(styles, /\.brand-avatar\s*{[^}]*height:\s*72rpx;/s);
  assert.match(styles, /\.brand-name,\s*\.brand-subtitle\s*{[^}]*white-space:\s*nowrap;/s);
  assert.match(styles, /\.brand-name,\s*\.brand-subtitle\s*{[^}]*text-overflow:\s*ellipsis;/s);
  assert.doesNotMatch(styles, /font-weight:\s*(700|800|900)/);
  assert.doesNotMatch(brands, /\s&\s/);
});

test('configuration sheet uses a circular close control and a stretched safe footer action', () => {
  const markup = read('pages/drinks/drinks.wxml');
  const styles = read('pages/drinks/drinks.wxss');

  assert.match(styles, /\.drink-card\s*{[^}]*border-radius:\s*var\(--r-md\);/s);
  assert.match(markup, /class="sheet-close"[^>]*aria-label="关闭饮品配置"[^>]*>×<\/view>/s);
  assert.match(styles, /\.sheet-head\s*{[^}]*position:\s*relative;[^}]*padding-right:\s*108rpx;/s);
  assert.match(styles, /\.sheet-close\s*{[^}]*position:\s*absolute;[^}]*width:\s*88rpx;[^}]*min-height:\s*88rpx;/s);
  assert.match(styles, /\.readonly-row\s*{[^}]*align-items:\s*center;[^}]*min-height:\s*64rpx;/s);
  assert.match(styles, /\.sheet-footer\s*{[^}]*display:\s*grid;[^}]*box-sizing:\s*border-box;/s);
  assert.match(styles, /\.sheet-actions\s*{[^}]*display:\s*flex;/s);
  assert.match(styles, /\.sheet-button\s*{[^}]*flex:\s*1\.3;[^}]*min-height:\s*92rpx;/s);
  assert.match(markup, /class=\"button-secondary sheet-quick\"[^>]*>直接记到/);
});

test('supporting copy stays neutral', () => {
  const customMarkup = read('pages/custom/custom.wxml');

  assert.doesNotMatch(customMarkup, /轻一点/);
  assert.match(customMarkup, /最多选 4 种，按你平时的搭配来。/);
});

test('result page keeps one fixed primary action and three equal secondary actions', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');

  assert.match(markup, /class="share-slot"[\s\S]*class="button-secondary poster-button[^"]*"[\s\S]*class="button-secondary recalculate-button"/);
  assert.match(markup, /class="actions"[\s\S]*class="button-primary save-record-button/);
  assert.match(styles, /\.calorie-number\s*{[^}]*font-size:\s*100rpx;/s);
  assert.match(styles, /\.actions\s*{[^}]*position:\s*fixed;[^}]*bottom:\s*0;/s);
  assert.match(styles, /\.secondary-actions\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(styles, /\.secondary-actions\.shared-actions\s*{[^}]*repeat\(2,/s);
  assert.match(styles, /\.share-overlay\s*{[^}]*position:\s*absolute;[^}]*opacity:\s*0;/s);
  assert.match(styles, /\.save-record-button,\s*\.own-drink-button\s*{[^}]*width:\s*100%;/s);
  assert.doesNotMatch(styles, /font-weight:\s*(700|800|900)/);
});

test('result page separates sections and keeps secondary actions quiet', () => {
  const styles = read('pages/result/result.wxss');

  assert.match(styles, /\.result-shell\s*{[^}]*gap:\s*28rpx;/s);
  assert.match(styles, /\.equivalent-stage\s*{[^}]*gap:\s*18rpx;/s);
  assert.match(styles, /\.result-page\s*{[^}]*padding-bottom:\s*calc\(260rpx/s);
  assert.match(styles, /\.secondary-actions \.button-secondary\s*{[^}]*font-weight:\s*var\(--fw-strong\);[^}]*box-shadow:\s*none;/s);
});

test('result metric badges, equivalent tiles and date chips use distinct visual roles', () => {
  const styles = read('pages/result/result.wxss');

  assert.match(styles, /\.result-badge\s*{[^}]*background:\s*var\(--primary\);[^}]*color:\s*#fff;/s);
  assert.match(styles, /\.estimate-badge\s*{[^}]*background:\s*var\(--surface\);[^}]*color:\s*var\(--text-2\);/s);
  assert.match(styles, /\.metric-row\s*{[^}]*gap:\s*8rpx;/s);
  assert.match(styles, /\.card-number\s*{[^}]*font-size:\s*92rpx;/s);
  assert.match(styles, /\.equivalent-tiles\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s);
  assert.match(styles, /\.icon-well\s*{[^}]*background:\s*var\(--surface-soft\);/s);
  assert.match(styles, /\.date-chip\.active\s*{[^}]*background:\s*var\(--primary-soft\);/s);
});
