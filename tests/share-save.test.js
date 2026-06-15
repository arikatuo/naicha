const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

function loadPage(relativePath) {
  const pagePath = path.resolve(__dirname, '..', relativePath);
  const previousPage = global.Page;
  let definition;

  global.Page = (config) => {
    definition = config;
  };

  try {
    delete require.cache[require.resolve(pagePath)];
    require(pagePath);
  } finally {
    global.Page = previousPage;
  }

  return definition;
}

test('every page registers a share-to-friend handler', () => {
  const pages = [
    'pages/home/home.js',
    'pages/brands/brands.js',
    'pages/drinks/drinks.js',
    'pages/custom/custom.js',
    'pages/result/result.js'
  ];

  pages.forEach((pagePath) => {
    const definition = loadPage(pagePath);
    assert.equal(
      typeof definition.onShareAppMessage,
      'function',
      `${pagePath} should define onShareAppMessage`
    );
  });
});

test('list and form pages share stable entry paths', () => {
  assert.equal(
    loadPage('pages/home/home.js').onShareAppMessage().path,
    '/pages/home/home'
  );
  assert.equal(
    loadPage('pages/brands/brands.js').onShareAppMessage().path,
    '/pages/brands/brands'
  );
  assert.equal(
    loadPage('pages/custom/custom.js').onShareAppMessage().path,
    '/pages/custom/custom'
  );
});

test('drinks page keeps the selected brand in its share path', () => {
  const definition = loadPage('pages/drinks/drinks.js');

  assert.equal(
    definition.onShareAppMessage.call({ data: { brandId: 'brand-1' } }).path,
    '/pages/drinks/drinks?brandId=brand-1'
  );
  assert.equal(
    definition.onShareAppMessage.call({ data: { brandId: '' } }).path,
    '/pages/brands/brands'
  );
});
