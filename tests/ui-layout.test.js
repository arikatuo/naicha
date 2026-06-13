const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../utils/data-store');
const { getCalorieLayout } = require('../utils/poster');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('home keeps the reveal hidden behind a balanced headline', () => {
  const markup = read('pages/home/home.wxml');

  assert.match(markup, /这一杯快乐/);
  assert.match(markup, /约等于什么/);
  assert.match(markup, /算完才知道/);
  assert.doesNotMatch(markup, /\d+\s*kcal/);
  assert.doesNotMatch(markup, /趣味估算工具/);
});

test('home exposes the two existing calculation routes', () => {
  const markup = read('pages/home/home.wxml');
  const script = read('pages/home/home.js');

  assert.match(markup, /bindtap="goBrands"[^>]*>选品牌热门款<\/button>/);
  assert.match(markup, /bindtap="goCustom"[^>]*>自己搭一杯<\/button>/);
  assert.match(script, /\/pages\/brands\/brands/);
  assert.match(script, /\/pages\/custom\/custom/);
});

test('brand data remains complete and brand cards keep differentiated flavor copy', () => {
  const markup = read('pages/brands/brands.wxml');
  const brands = require('../data/brands');

  assert.match(markup, /{{item\.subtitle}}/);
  assert.doesNotMatch(markup, /热门饮品入口/);
  assert.doesNotMatch(markup, /{{item\.drinkCount}}/);
  assert.equal(new Set(brands.map((brand) => brand.subtitle)).size, brands.length);

  for (const brand of store.getBrands()) {
    assert.equal(store.getDrinksByBrandId(brand.id).length, 8);
  }
});

test('brand page provides a retryable empty state', () => {
  const markup = read('pages/brands/brands.wxml');
  const script = read('pages/brands/brands.js');

  assert.match(markup, /wx:if="{{hasBrands}}"/);
  assert.match(markup, /class="empty-state"/);
  assert.match(script, /reloadBrands\(\)/);
});

test('drink cards use a two-column grid and drink-specific artwork', () => {
  const script = read('pages/drinks/drinks.js');
  const styles = read('pages/drinks/drinks.wxss');
  const iconMap = require('../data/drink-icons');

  assert.match(styles, /\.drink-list\s*{[^}]*display:\s*grid;/s);
  assert.match(styles, /grid-template-columns:\s*repeat\(2,\s*1fr\)/);
  assert.match(script, /getDrinkIcon\(drink\)/);
  assert.ok(new Set(Object.values(iconMap)).size >= 8);
});

test('drink configuration keeps scrolling options above a fixed action footer', () => {
  const markup = read('pages/drinks/drinks.wxml');
  const styles = read('pages/drinks/drinks.wxss');

  assert.match(markup, /<scroll-view class="sheet-scroll" scroll-y="true">/);
  assert.match(markup, /class="sheet-footer"/);
  assert.match(markup, /class="sheet-close"[^>]*aria-label="关闭饮品配置"/s);
  assert.match(markup, /{{selectedExtraToppingCount}}\/3/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
});

test('custom builder keeps options bounded and exposes topping progress', () => {
  const markup = read('pages/custom/custom.wxml');
  const styles = read('pages/custom/custom.wxss');

  assert.equal((markup.match(/class="builder-surface surface"/g) || []).length, 1);
  assert.match(markup, /{{selectedToppingCount}}\/4/);
  assert.match(styles, /\.option-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /\.submit-bar\s*{[^}]*position:\s*fixed;/s);
});

test('result page allows adaptive scrolling instead of forcing a clipped viewport', () => {
  const config = JSON.parse(read('pages/result/result.json'));
  const styles = read('pages/result/result.wxss');

  assert.equal(config.disableScroll, undefined);
  assert.match(styles, /\.result-page\s*{[^}]*min-height:\s*100vh;/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*\n\s*height:\s*100vh/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(styles, /\.actions\s*{[^}]*margin-top:\s*auto;/s);
});

test('result page puts calories before badges and copy', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');
  const calorieIndex = markup.indexOf('<view class="calorie-row">');
  const badgeIndex = markup.indexOf('<view class="badge-row">');
  const titleIndex = markup.indexOf('<text class="result-title">');

  assert.ok(calorieIndex > -1);
  assert.ok(calorieIndex < badgeIndex);
  assert.ok(badgeIndex < titleIndex);
  assert.doesNotMatch(markup, /揭晓结果/);
  assert.match(styles, /\.calorie-number\s*{[^}]*font-size:\s*104rpx;/s);
  assert.match(styles, /\.summary-footer\s*{[^}]*flex-direction:\s*column;/s);
});

test('result page gives status and estimate tags different semantic styling', () => {
  const styles = read('pages/result/result.wxss');

  assert.match(styles, /\.result-badge\s*{[^}]*background:\s*#f4d4b5;/s);
  assert.match(styles, /\.estimate-badge\s*{[^}]*background:\s*#f2efeb;/s);
  assert.doesNotMatch(styles, /\.estimate-badge\s*{[^}]*background:\s*rgba\(255,\s*249,\s*240/s);
});

test('result equivalents use a single-card swiper with semantic controls', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');

  assert.match(markup, /<swiper\s+[^>]*class="equivalent-swiper"[^>]*current="{{currentEquivalentIndex}}"/s);
  assert.match(markup, /<swiper-item wx:for="{{cards}}"/);
  assert.match(markup, /<button\s+[^>]*class="carousel-arrow"[^>]*aria-label="上一个换算"/s);
  assert.match(markup, /<button\s+[^>]*class="carousel-arrow"[^>]*aria-label="下一个换算"/s);
  assert.match(markup, /{{currentEquivalentPosition}} \/ {{cards.length}}/);
  assert.doesNotMatch(markup, /equivalent-top-bar/);
  assert.match(styles, /\.carousel-arrow\s*{[^}]*min-height:\s*88rpx;/s);
});

test('result page provides a visible recovery state for malformed payloads', () => {
  const markup = read('pages/result/result.wxml');
  const script = read('pages/result/result.js');

  assert.match(markup, /wx:else class="error-state surface"/);
  assert.match(markup, /bindtap="recalculate">重新计算/);
  assert.match(script, /hasResult:\s*false/);
  assert.match(script, /Number\.isFinite\(payload\.calories\)/);
});

test('result page offers direct sharing, poster generation, and a fresh calculation', () => {
  const markup = read('pages/result/result.wxml');
  const script = read('pages/result/result.js');

  assert.match(markup, /open-type="share"[^>]*>分享给朋友<\/button>/);
  assert.match(markup, /bindtap="generatePoster"/);
  assert.match(markup, /class="button-secondary recalculate-button"/);
  assert.match(script, /buildShareTitle\(/);
  assert.match(script, /encodePayload\(payload\)/);
  assert.match(script, /wx\.reLaunch\(\{\s*url:\s*'\/pages\/home\/home'\s*\}\)/s);
});

test('local visual assets cover brand logos and distinct result icons', () => {
  const sources = JSON.parse(read('assets/brands/sources.json'));
  const iconPaths = [
    'assets/icons/bike.png',
    'assets/icons/americano.png',
    'assets/icons/ice-cream.png',
    'assets/icons/apple.png',
    'assets/icons/drinks/original-tea.png',
    'assets/icons/drinks/milk-tea.png',
    'assets/icons/drinks/fruit-tea.png',
    'assets/icons/drinks/cheese-foam.png',
    'assets/icons/drinks/matcha.png',
    'assets/icons/drinks/mango-pomelo.png',
    'assets/icons/drinks/coffee-float.png',
    'assets/icons/drinks/osmanthus-tea.png',
    'assets/icons/drinks/jasmine-milk.png'
  ];

  assert.equal(Object.keys(sources).length, 8);
  for (const source of Object.values(sources)) {
    assert.match(source.url, /^https:\/\//);
    assert.equal(source.type, 'official');
  }

  for (const iconPath of iconPaths) {
    const absolutePath = path.join(__dirname, '..', iconPath);
    assert.ok(fs.existsSync(absolutePath), `${iconPath} should exist`);
    assert.ok(fs.statSync(absolutePath).size > 1000, `${iconPath} should be a real image asset`);
  }
});

test('equivalent cards use reference details instead of instructions', () => {
  const markup = read('pages/result/result.wxml');

  assert.match(markup, /{{item\.hint}}/);
  assert.doesNotMatch(read('utils/equivalents.js'), /左右滑动|换算玩具/);
});

test('poster generation previews before saving to album', () => {
  const script = read('pages/result/result.js');
  const markup = read('pages/result/result.wxml');

  assert.match(script, /posterPreviewOpen:\s*false/);
  assert.match(script, /savePoster\(\)/);
  assert.match(markup, /class="poster-preview-mask"/);
  assert.match(markup, /bindtap="savePoster">保存到相册/);
  assert.match(markup, /关闭/);

  const generatePosterBody = script.slice(
    script.indexOf('generatePoster()'),
    script.indexOf('savePoster()')
  );
  assert.doesNotMatch(generatePosterBody, /saveImageToPhotosAlbum/);
});

test('poster includes QR artwork and separates calorie units from the estimate badge', () => {
  const poster = read('utils/poster.js');
  const layout = getCalorieLayout(520);

  assert.match(poster, /\/assets\/qrcode\.png/);
  assert.match(poster, /drawText\(ctx,\s*calories,/);
  assert.match(poster, /drawText\(ctx,\s*'kcal',/);
  assert.doesNotMatch(poster, /`\$\{payload\.calories\} kcal`/);
  assert.equal(layout.numberX, 92);
  assert.ok(layout.unitX >= 218);
  assert.ok(layout.badgeX >= layout.unitX + 54);
});