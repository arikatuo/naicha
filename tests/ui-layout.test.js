const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../utils/data-store');
const { drawPoster, getCalorieLayout, loadCanvasImage } = require('../utils/poster');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('calendar home keeps the first action clear without explanatory copy', () => {
  const markup = read('pages/home/home.wxml');

  assert.match(markup, /class="calendar-card surface"/);
  assert.match(markup, /class="day-panel"/);
  assert.match(markup, /recordButtonLabel/);
  assert.doesNotMatch(markup, /选一杯看估算热量|选好饮品|记录示例|记下后/);
});

test('record tab exposes brand, quick, recent and custom routes', () => {
  const markup = read('pages/record/record.wxml');
  const script = read('pages/record/record.js');

  assert.match(markup, /bindtap="openBrand"/);
  assert.match(markup, /bindtap="openQuickDrink"/);
  assert.match(markup, /bindtap="openRecent"/);
  assert.match(markup, /bindtap="goCustom"/);
  assert.match(script, /\/pages\/drinks\/drinks/);
  assert.match(script, /\/pages\/custom\/custom/);
});

test('brand data remains complete and brand cards keep differentiated flavor copy', () => {
  const markup = read('pages/record/record.wxml');
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
  const markup = read('pages/record/record.wxml');
  const script = read('pages/record/record.js');

  assert.match(markup, /wx:if="{{hasBrands}}"/);
  assert.match(markup, /class="empty-state surface"/);
  assert.match(script, /reloadBrands\(\)/);
});

test('drink rows are a compact single column with drink-specific artwork', () => {
  const script = read('pages/drinks/drinks.js');
  const styles = read('pages/drinks/drinks.wxss');
  const iconMap = require('../data/drink-icons');

  assert.match(styles, /\.drink-list\s*{[^}]*flex-direction:\s*column;/s);
  assert.match(styles, /\.drink-icon-shell\s*{[^}]*width:\s*96rpx;/s);
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

test('result page keeps the kcal summary as the leading card', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');
  const summaryIndex = markup.indexOf('<view class="summary result-surface"');
  const equivalentIndex = markup.indexOf('<view class="equivalent-stage">');

  assert.ok(summaryIndex > -1);
  assert.ok(summaryIndex < equivalentIndex);
  assert.match(markup, /class="result-badge"/);
  assert.match(styles, /\.calorie-number\s*{[^}]*font-size:\s*100rpx;/s);
  assert.match(styles, /\.summary-footer\s*{[^}]*flex-direction:\s*column;/s);
});

test('result page keeps light badge styling', () => {
  const styles = read('pages/result/result.wxss');

  assert.match(styles, /\.result-badge\s*{[^}]*background:\s*var\(--primary\);/s);
  assert.match(styles, /\.estimate-badge\s*{[^}]*background:\s*var\(--surface\);/s);
  assert.doesNotMatch(styles, /\.result-page\s*{[^}]*background:\s*#0/s);
});

test('result equivalents show one hero card and tappable tiles for the rest', () => {
  const markup = read('pages/result/result.wxml');
  const styles = read('pages/result/result.wxss');
  const script = read('pages/result/result.js');

  assert.match(markup, /class="equivalent-card hero-equivalent"/);
  assert.match(markup, /class="equivalent-tile"/);
  assert.match(styles, /\.equivalent-tiles\s*{[^}]*display:\s*grid;/s);
  assert.match(script, /setEquivalentIndex\(/);
  assert.match(script, /selectEquivalent\(/);
});

test('result page provides a visible recovery state for malformed payloads', () => {
  const markup = read('pages/result/result.wxml');
  const script = read('pages/result/result.js');

  assert.match(markup, /wx:else class="error-state surface"/);
  assert.match(markup, /bindtap="recalculate">重新计算/);
  assert.match(script, /hasResult:\s*false/);
  assert.match(script, /Number\.isFinite\(payload\.calories\)/);
});

test('result page offers deliberate recording, sharing, and a fresh calculation', () => {
  const markup = read('pages/result/result.wxml');
  const script = read('pages/result/result.js');

  assert.match(markup, /bindtap="saveRecord"/);
  assert.match(markup, /<button class="share-overlay" open-type="share"/);
  assert.match(markup, /class="button-secondary share-button"[^>]*>分享给朋友<\/view>/);
  assert.match(markup, /bindtap="generatePoster"/);
  assert.match(markup, /class="button-secondary recalculate-button"/);
  assert.match(script, /buildShareTitle\(/);
  assert.match(script, /encodePayload\(\{/);
  assert.match(script, /wx\.switchTab\(\{\s*url:\s*'\/pages\/record\/record'\s*\}\)/s);
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

  assert.match(markup, /{{currentCard\.hint}}/);
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

test('poster generation uses Canvas 2D and waits for image objects before export', () => {
  const markup = read('pages/result/result.wxml');
  const script = read('pages/result/result.js');

  assert.match(markup, /<canvas id="posterCanvas" type="2d" class="poster-canvas"><\/canvas>/);
  assert.doesNotMatch(markup, /canvas-id="posterCanvas"/);
  assert.match(script, /select\('#posterCanvas'\)/);
  assert.match(script, /getContext\('2d'\)/);
  assert.match(script, /Promise\.all\(/);
  assert.match(script, /loadCanvasImage\(canvas,\s*POSTER_QRCODE_SRC\)/);
  assert.match(script, /canvas:\s*canvas/);
  assert.doesNotMatch(script, /wx\.createCanvasContext/);
  assert.doesNotMatch(script, /wx\.getImageInfo/);
  assert.doesNotMatch(script, /canvasId:\s*'posterCanvas'/);
});

test('canvas image loading resolves only after the image onload callback', async () => {
  const image = {};
  const canvas = {
    createImage() {
      return image;
    }
  };

  let resolved = false;
  const loading = loadCanvasImage(canvas, '/assets/qrcode.png').then((result) => {
    resolved = true;
    return result;
  });

  await Promise.resolve();
  assert.equal(resolved, false);
  assert.equal(image.src, '/assets/qrcode.png');

  image.onload();

  assert.equal(await loading, image);
  assert.equal(resolved, true);
});

test('poster draws preloaded image objects and keeps the calorie number and unit separate', () => {
  const poster = read('utils/poster.js');
  const layout = getCalorieLayout(520);
  const longLayout = getCalorieLayout(1520);
  const imageDraws = [];
  const texts = [];
  const ctx = {
    beginPath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    closePath() {},
    fill() {},
    fillRect() {},
    clearRect() {},
    fillText(text, x, y) { texts.push({ text, x, y, align: this.textAlign }); },
    drawImage(image) {
      imageDraws.push(image);
    }
  };
  const images = {
    cup: { id: 'cup' },
    equivalent: { id: 'equivalent' },
    qrcode: { id: 'qrcode' }
  };

  drawPoster({
    ctx,
    payload: { calories: 520, drinkName: '测试奶茶' },
    cards: [{ numberMain: '64', numberUnit: 'g', label: '肥肉' }],
    highlightCard: { numberMain: '64', numberUnit: 'g', label: '肥肉' },
    resultCopy: { title: '测试结果' },
    width: 360,
    height: 640,
    images
  });

  assert.deepEqual(imageDraws, [images.cup, images.equivalent, images.qrcode]);
  assert.doesNotMatch(poster, /ctx\.drawImage\(\s*['"`]\//);
  assert.match(poster, /drawText\(ctx,\s*calories,/);
  assert.match(poster, /drawText\(ctx,\s*'kcal',/);
  assert.doesNotMatch(poster, /`\$\{payload\.calories\} kcal`/);
  assert.ok(layout.numberSize > longLayout.numberSize, 'four-digit numbers shrink');
  const number = texts.find((item) => item.text === '520');
  const unit = texts.find((item) => item.text === 'kcal');
  assert.equal(number.align, 'center');
  assert.equal(unit.align, 'center');
  assert.ok(unit.y > number.y, 'unit sits below the number');
  assert.ok(texts.every((item) => item.x >= 0 && item.x <= 360 && item.y > 0 && item.y <= 640));
});
