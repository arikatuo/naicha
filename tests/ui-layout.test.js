const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../utils/data-store');
const { getCalorieLayout } = require('../utils/poster');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('home headline uses deliberate balanced lines', () => {
  const markup = read('pages/home/home.wxml');

  assert.match(markup, /<text class="title-line">这一杯快乐，<\/text>/);
  assert.match(markup, /<text class="title-line title-accent">约等于什么？<\/text>/);
  assert.doesNotMatch(markup, /像捏一杯奶茶一样/);
});

test('home teaser keeps the reveal hidden until calculation', () => {
  const markup = read('pages/home/home.wxml');

  assert.match(markup, /算完才知道/);
  assert.doesNotMatch(markup, /486 kcal/);
  assert.doesNotMatch(markup, /1\.6 包大薯/);
  assert.doesNotMatch(markup, /60g 肥肉/);
  assert.doesNotMatch(markup, /45 分钟慢跑/);
});

test('brand cards show dynamic drink counts from the current data set', () => {
  const script = read('pages/brands/brands.js');
  const markup = read('pages/brands/brands.wxml');

  assert.match(script, /drinkCount:\s*store\.getDrinksByBrandId\(brand\.id\)\.length/);
  assert.match(markup, /{{item\.drinkCount}} 款/);
  assert.doesNotMatch(markup, />10 款</);

  for (const brand of store.getBrands()) {
    assert.equal(store.getDrinksByBrandId(brand.id).length, 8);
  }
});

test('drink sheet keeps the calculate action in a fixed footer below scrollable options', () => {
  const markup = read('pages/drinks/drinks.wxml');

  assert.match(markup, /<scroll-view class="sheet-scroll" scroll-y="true">/);
  assert.match(markup, /<view class="sheet-footer">\s*<button class="button-primary sheet-button" bindtap="calculate">看看等于什么<\/button>\s*<\/view>/);
});

test('drink list uses compact display tags and result header has no cropped decoration', () => {
  const drinkMarkup = read('pages/drinks/drinks.wxml');
  const resultMarkup = read('pages/result/result.wxml');

  assert.match(drinkMarkup, /wx:for="{{item\.displayTags}}"/);
  assert.doesNotMatch(resultMarkup, /result-toy/);
});

test('drink selection uses a two-column grid instead of a narrow single column', () => {
  const styles = read('pages/drinks/drinks.wxss');

  assert.match(styles, /\.drink-list\s*{[^}]*display:\s*grid;/s);
  assert.match(styles, /grid-template-columns:\s*repeat\(2,\s*1fr\)/);
  assert.doesNotMatch(styles, /\.drink-list\s*{[^}]*flex-direction:\s*column/s);
});

test('drink cards use drink-specific artwork instead of the first generic tag icon', () => {
  const script = read('pages/drinks/drinks.js');
  const iconMap = require('../data/drink-icons');

  assert.match(script, /getDrinkIcon\(drink\)/);
  assert.doesNotMatch(script, /icon:\s*tags\[0\]\s*\?\s*tags\[0\]\.icon/);
  assert.equal(iconMap['molimilk-osmanthus-longjing'], '/assets/icons/drinks/osmanthus-tea.png');
  assert.equal(iconMap['molimilk-jasmine-mango-pomelo'], '/assets/icons/drinks/mango-pomelo.png');
  assert.ok(new Set(Object.values(iconMap)).size >= 8);
});

test('brand page gives official logos a larger dedicated visual area', () => {
  const markup = read('pages/brands/brands.wxml');
  const styles = read('pages/brands/brands.wxss');

  assert.match(markup, /class="brand-logo-panel"/);
  assert.match(markup, /class="brand-meta"/);
  assert.match(styles, /\.brand-logo-panel\s*{/);
  assert.match(styles, /\.brand-logo\s*{[^}]*width:\s*220rpx;[^}]*height:\s*96rpx;/s);
  assert.match(styles, /\.brand-card\s*{[^}]*min-height:\s*214rpx;/s);
});

test('local visual assets cover official brand logos and specific drink icons', () => {
  const sources = JSON.parse(read('assets/brands/sources.json'));
  const iconPaths = [
    'assets/icons/bike.png',
    'assets/icons/drinks/original-tea.png',
    'assets/icons/drinks/milk-tea.png',
    'assets/icons/drinks/fruit-tea.png',
    'assets/icons/drinks/cheese-foam.png',
    'assets/icons/drinks/matcha.png',
    'assets/icons/drinks/mango-pomelo.png',
    'assets/icons/drinks/coffee-float.png',
    'assets/icons/drinks/ice-cream.png',
    'assets/icons/drinks/osmanthus-tea.png',
    'assets/icons/drinks/jasmine-milk.png'
  ];

  assert.equal(Object.keys(sources).length, 8);
  for (const source of Object.values(sources)) {
    assert.match(source.url, /^https:\/\/(www\.|cn\.|web-oss\.|oss\.|g\.)?[a-z0-9.-]+\//i);
    assert.equal(source.type, 'official');
  }

  for (const iconPath of iconPaths) {
    const absolutePath = path.join(__dirname, '..', iconPath);
    assert.ok(fs.existsSync(absolutePath), `${iconPath} should exist`);
    assert.ok(fs.statSync(absolutePath).size > 1000, `${iconPath} should be a real image asset`);
  }
});

test('result page presents equivalent cards as a single-card swiper', () => {
  const markup = read('pages/result/result.wxml');

  assert.match(markup, /<swiper class="equivalent-swiper"[^>]*previous-margin="24rpx"[^>]*next-margin="24rpx"/);
  assert.match(markup, /<swiper-item wx:for="{{cards}}"/);
  assert.doesNotMatch(markup, /class="cards"/);
});

test('result page offers one-tap dynamic sharing for the current result', () => {
  const script = read('pages/result/result.js');
  const markup = read('pages/result/result.wxml');

  assert.match(markup, /open-type="share"[^>]*>分享给朋友<\/button>/);
  assert.match(script, /buildShareTitle\(/);
  assert.match(script, /你那杯呢/);
  assert.match(script, /encodePayload\(payload\)/);
  assert.match(script, /\/pages\/result\/result\?payload=/);
});

test('result page gives calorie badge and drink identity distinct hierarchy', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');

  assert.match(markup, /<text class="result-badge">{{resultCopy\.badge}}<\/text>/);
  assert.match(markup, /<view class="calorie-row">\s*<text class="calories">约 {{payload\.calories}} kcal<\/text>\s*<\/view>\s*<text class="estimate-badge">估算<\/text>/);
  assert.match(styles, /\.calories\s*{[^}]*font-size:\s*88rpx;/s);
  assert.match(styles, /\.drink-name\s*{[^}]*font-size:\s*30rpx;[^}]*font-weight:\s*800;/s);
  assert.match(styles, /\.disclaimer\s*{[^}]*font-size:\s*22rpx;/s);
}
);

test('equivalent cards use user-facing progress copy instead of internal toy wording', () => {
  const markup = read('pages/result/result.wxml');

  assert.match(markup, /{{item\.hint}}/);
  assert.doesNotMatch(markup, /换算玩具/);
});

test('poster generation previews before saving to album', () => {
  const script = read('pages/result/result.js');
  const markup = read('pages/result/result.wxml');

  assert.match(script, /posterPreviewOpen:\s*false/);
  assert.match(script, /previewPosterPath:\s*''/);
  assert.match(script, /savePoster\(\)/);
  assert.match(markup, /class="poster-preview-mask"/);
  assert.match(markup, /bindtap="savePoster">保存到相册/);
  assert.match(markup, /你的专属结果图/);
  assert.match(markup, /暂时不分享/);

  const generatePosterBody = script.slice(
    script.indexOf('generatePoster()'),
    script.indexOf('savePoster()')
  );
  assert.doesNotMatch(generatePosterBody, /saveImageToPhotosAlbum/);
});

test('poster includes a QR code asset and separates kcal from estimate badge', () => {
  const poster = read('utils/poster.js');

  assert.match(poster, /\/assets\/qrcode\.png/);
  assert.match(poster, /drawImage\('\/assets\/qrcode\.png'/);
  assert.match(poster, /你的那杯呢？扫码比一比/);
  assert.match(poster, /const calories = `\$\{payload\.calories\}`/);
  assert.match(poster, /drawText\(ctx,\s*calories,/);
  assert.match(poster, /drawText\(ctx,\s*'kcal',/);
  assert.doesNotMatch(poster, /`\$\{payload\.calories\} kcal`/);
});

test('poster calorie layout keeps number unit and estimate badge separated', () => {
  const layout = getCalorieLayout(520);

  assert.equal(layout.numberX, 92);
  assert.ok(layout.unitX >= 218);
  assert.ok(layout.badgeX >= layout.unitX + 54);
});
