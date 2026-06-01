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
