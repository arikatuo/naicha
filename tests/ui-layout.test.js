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

test('brand cards use brand-specific flavor labels instead of repeated generic subtitles', () => {
  const markup = read('pages/brands/brands.wxml');
  const brands = require('../data/brands');

  assert.match(markup, /<text class="brand-subtitle">{{item\.subtitle}}<\/text>/);
  assert.doesNotMatch(markup, /热门饮品入口/);

  const subtitles = brands.map((brand) => brand.subtitle);
  assert.equal(new Set(subtitles).size, brands.length);
  assert.deepEqual(subtitles, [
    '平价清爽，果茶为主',
    '新中式茶饮，低糖系',
    '芝士奶盖 & 鲜果茶',
    '水果系 & 经典奶茶',
    '厚乳 & 多料',
    '奶茶经典款',
    '台式奶茶定番',
    '茉莉 & 轻奶茶'
  ]);
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

test('custom builder option buttons stay inside their cards', () => {
  const markup = read('pages/custom/custom.wxml');
  const styles = read('pages/custom/custom.wxss');

  assert.match(markup, /<view class="option-grid">/);
  assert.match(styles, /\.option-group\s*{[^}]*overflow:\s*hidden;/s);
  assert.match(styles, /\.option-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /\.option\s*{[^}]*width:\s*100%;[^}]*box-sizing:\s*border-box;[^}]*margin:\s*0;/s);
  assert.match(styles, /\.option\s*{[^}]*overflow:\s*hidden;/s);
  assert.doesNotMatch(styles, /\.option-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,/s);
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
  assert.doesNotMatch(styles, /\.brand-logo-panel\s*{[^}]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.78\)/s);
  assert.match(styles, /\.brand-logo\s*{[^}]*width:\s*252rpx;[^}]*height:\s*92rpx;/s);
  assert.match(styles, /\.brand-card\s*{[^}]*min-height:\s*214rpx;/s);
});

test('result page is a compact no-scroll reveal screen', () => {
  const config = JSON.parse(read('pages/result/result.json'));
  const styles = read('pages/result/result.wxss');
  const markup = read('pages/result/result.wxml');

  assert.equal(config.disableScroll, true);
  assert.match(markup, /<view class="result-shell">/);
  assert.match(styles, /\.result-page\s*{[^}]*height:\s*calc\(100vh - 110rpx\);[^}]*justify-content:\s*flex-start;[^}]*overflow:\s*hidden;/s);
  assert.match(styles, /\.result-shell\s*{[^}]*display:\s*flex;[^}]*max-height:\s*100%;/s);
  assert.match(styles, /\.result-shell\s*{[^}]*padding-top:\s*10rpx;/s);
  assert.match(markup, /<view class="secondary-actions">\s*<button class="button-secondary" loading="{{posterGenerating}}" bindtap="generatePoster">生成分享图<\/button>\s*<button class="button-secondary" bindtap="recalculate">再算一杯<\/button>\s*<\/view>/);
  assert.match(styles, /\.equivalent-swiper\s*{[^}]*height:\s*248rpx;[^}]*flex:\s*0 0 auto;/s);
  assert.match(styles, /\.equivalent-card\s*{[^}]*height:\s*228rpx;/s);
  assert.match(styles, /\.actions\s*{[^}]*display:\s*flex;[^}]*flex-direction:\s*column/s);
  assert.match(styles, /\.actions button\s*{[^}]*width:\s*100%;[^}]*margin:\s*0;/s);
  assert.match(styles, /\.secondary-actions\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/s);
  assert.doesNotMatch(styles, /\.actions\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*justify-content:\s*space-between/s);
  assert.doesNotMatch(styles, /background:\s*#160c05/);
});

test('result page centers a compact stack instead of stretching the comparison card', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');

  assert.match(markup, /<text class="calorie-prefix">约<\/text>\s*<text class="calorie-number">{{payload\.calories}}<\/text>\s*<text class="calorie-unit">kcal<\/text>/);
  assert.match(markup, /<view class="badge-row">\s*<text class="result-badge">{{resultCopy\.badge}}<\/text>\s*<text class="estimate-badge">估算<\/text>\s*<\/view>/);
  assert.doesNotMatch(markup, /<text class="calories">约 {{payload\.calories}} kcal<\/text>/);
  assert.match(styles, /\.calorie-number\s*{[^}]*font-size:\s*92rpx;/s);
  assert.match(styles, /\.calorie-unit\s*{[^}]*font-size:\s*50rpx;/s);
  assert.match(styles, /\.summary\s*{[^}]*border-radius:\s*38rpx;/s);
  assert.match(styles, /\.summary\s*{[^}]*gap:\s*0;/s);
  assert.match(styles, /\.badge-row\s*{[^}]*display:\s*flex;[^}]*gap:\s*10rpx;/s);
  assert.match(styles, /\.equivalent-stage\s*{[^}]*flex:\s*0 0 auto;/s);
  assert.match(styles, /\.equivalent-stage\s*{[^}]*min-height:\s*0;/s);
  assert.match(styles, /\.actions\s*{[^}]*align-self:\s*stretch;[^}]*margin-top:\s*4rpx;/s);
  assert.doesNotMatch(styles, /\.equivalent-stage\s*{[^}]*flex:\s*1 1 auto;/s);
  assert.doesNotMatch(styles, /height:\s*calc\(100% - 18rpx\)/);
});

test('result equivalent card uses a framed hero comparison with carousel controls', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');

  assert.match(markup, /<view class="equivalent-frame">/);
  assert.match(markup, /<swiper class="equivalent-swiper"[^>]*current="{{currentEquivalentIndex}}"/);
  assert.match(markup, /<view class="icon-well">\s*<image class="icon" src="{{item\.icon}}" mode="aspectFit"><\/image>\s*<\/view>/);
  assert.match(markup, /<view class="metric-row">\s*<text class="card-number">{{item\.numberMain}}<\/text>\s*<text class="card-unit">{{item\.numberUnit}}<\/text>\s*<\/view>/);
  assert.match(markup, /<view class="carousel-controls">\s*<view class="carousel-arrow" bindtap="previousEquivalent">‹<\/view>/);
  assert.match(markup, /<view class="carousel-arrow" bindtap="nextEquivalent">›<\/view>/);
  assert.match(styles, /\.equivalent-frame\s*{[^}]*border-radius:\s*34rpx;[^}]*background:\s*linear-gradient\(145deg,\s*#fffaf1,\s*#f9d9b4\)/s);
  assert.match(styles, /\.equivalent-card\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*122rpx minmax\(0,\s*1fr\)/s);
  assert.match(styles, /\.icon-well\s*{[^}]*width:\s*104rpx;[^}]*height:\s*104rpx;/s);
  assert.match(styles, /\.card-number\s*{[^}]*font-size:\s*72rpx;[^}]*font-weight:\s*900;/s);
  assert.match(styles, /\.carousel-controls\s*{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/s);
  assert.match(styles, /\.carousel-arrow\s*{[^}]*flex:\s*0 0 58rpx;[^}]*width:\s*58rpx;/s);
  assert.doesNotMatch(markup, /<text class="card-text">{{item\.text}}<\/text>/);
});

test('local visual assets cover official brand logos and specific drink icons', () => {
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
  const script = read('pages/result/result.js');

  assert.match(markup, /<swiper class="equivalent-swiper"[^>]*current="{{currentEquivalentIndex}}"/);
  assert.match(markup, /<swiper-item wx:for="{{cards}}"/);
  assert.match(markup, /class="carousel-controls"/);
  assert.match(script, /previousEquivalent\(\)/);
  assert.match(script, /nextEquivalent\(\)/);
  assert.match(script, /cards\.length/);
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

test('result recalculation starts a fresh flow from home instead of stepping back', () => {
  const script = read('pages/result/result.js');
  const recalculateBody = script.slice(
    script.indexOf('recalculate()'),
    script.indexOf('onEquivalentChange')
  );

  assert.match(recalculateBody, /wx\.reLaunch\(\{\s*url:\s*'\/pages\/home\/home'\s*\}\)/s);
  assert.doesNotMatch(recalculateBody, /navigateBack/);
});

test('result page gives calorie badge and drink identity distinct hierarchy', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');
  const calorieIndex = markup.indexOf('<view class="calorie-row">');
  const titleIndex = markup.indexOf('<text class="result-title">');
  const badgeIndex = markup.indexOf('<view class="badge-row">');
  const estimateIndex = markup.indexOf('<text class="estimate-badge">估算</text>');

  assert.match(markup, /<text class="result-badge">{{resultCopy\.badge}}<\/text>/);
  assert.ok(calorieIndex > -1);
  assert.ok(titleIndex > -1);
  assert.ok(badgeIndex > -1);
  assert.ok(estimateIndex > -1);
  assert.ok(calorieIndex < titleIndex, 'calorie number should appear before result title');
  assert.ok(calorieIndex < badgeIndex, 'badge row should follow the calorie reveal');
  assert.ok(badgeIndex < titleIndex, 'result title should follow compact status badges');
  assert.ok(estimateIndex < titleIndex, 'estimate badge should stay in the compact badge row');
  assert.doesNotMatch(markup, /约 {{payload\.calories}} kcal/);
  assert.match(styles, /\.calorie-number\s*{[^}]*font-size:\s*92rpx;/s);
  assert.match(styles, /\.drink-name\s*{[^}]*color:\s*#4a3328;[^}]*font-size:\s*25rpx;[^}]*font-weight:\s*800;/s);
  assert.match(styles, /\.disclaimer\s*{[^}]*font-size:\s*20rpx;/s);
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
