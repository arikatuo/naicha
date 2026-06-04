const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

test('home headline uses deliberate balanced lines', () => {
  const markup = read('pages/home/home.wxml');

  assert.match(markup, /<text class="title-line">这一杯快乐，<\/text>/);
  assert.match(markup, /<text class="title-line title-accent">约等于什么？<\/text>/);
  assert.doesNotMatch(markup, /像捏一杯奶茶一样/);
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

test('result page presents equivalent cards as a single-card swiper', () => {
  const markup = read('pages/result/result.wxml');

  assert.match(markup, /<swiper class="equivalent-swiper"/);
  assert.match(markup, /<swiper-item wx:for="{{cards}}"/);
  assert.doesNotMatch(markup, /class="cards"/);
});

test('poster generation previews before saving to album', () => {
  const script = read('pages/result/result.js');
  const markup = read('pages/result/result.wxml');

  assert.match(script, /posterPreviewOpen:\s*false/);
  assert.match(script, /previewPosterPath:\s*''/);
  assert.match(script, /savePoster\(\)/);
  assert.match(markup, /class="poster-preview-mask"/);
  assert.match(markup, /bindtap="savePoster">保存到相册/);

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
  assert.match(poster, /const calories = `\$\{payload\.calories\}`/);
  assert.match(poster, /drawText\(ctx,\s*calories,/);
  assert.match(poster, /drawText\(ctx,\s*'kcal',/);
  assert.doesNotMatch(poster, /`\$\{payload\.calories\} kcal`/);
});
