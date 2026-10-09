const drinkIcons = require('../data/drink-icons');

const fallbackByTag = {
  classic: '/assets/icons/drinks/original-tea.png',
  'milk-tea': '/assets/icons/drinks/milk-tea.png',
  fruit: '/assets/icons/drinks/fruit-tea.png',
  'milk-foam': '/assets/icons/drinks/cheese-foam.png',
  fresh: '/assets/icons/drinks/original-tea.png',
  'thick-milk': '/assets/icons/drinks/milk-tea.png',
  toppings: '/assets/icons/drinks/milk-tea.png',
  coffee: '/assets/icons/drinks/coffee-float.png',
  latte: '/assets/icons/drinks/coffee-float.png',
  'black-coffee': '/assets/icons/americano.png'
};

// 没有单独配图的饮品，按名字挑最像的一张（先匹配的优先）
const nameRules = [
  [/咖啡|拿铁|美式|卡布|玛奇朵|馥芮白|澳白|摩卡|冷萃|丝慕白/, null],
  [/杨枝甘露|芒/, '/assets/icons/drinks/mango-pomelo.png'],
  [/芝士|奶盖|芝芝|岩盐|酪酪|咸法酪/, '/assets/icons/drinks/cheese-foam.png'],
  [/抹茶/, '/assets/icons/drinks/matcha.png'],
  [/桂花/, '/assets/icons/drinks/osmanthus-tea.png'],
  [/茉莉|奶绿|奶白|栀子|兰香/, '/assets/icons/drinks/jasmine-milk.png'],
  [/冰淇淋|雪顶|雪糕/, '/assets/icons/drinks/ice-cream.png'],
  [/柠|橙|柚|桃|莓|葡萄|百香|西瓜|苹果|芭乐|柑|橘|荔枝|油柑|菠萝|无花果|山楂|龙眼/, '/assets/icons/drinks/fruit-tea.png'],
  [/奶茶|牛乳|乳茶|烤奶|奶青|珍珠|波霸|波波|芋|布丁|烧仙草|脏脏/, '/assets/icons/drinks/milk-tea.png'],
  [/乌龙|红茶|绿茶|铁观音|四季春|锡兰|青山|山茶|乌漆/, '/assets/icons/drinks/original-tea.png']
];

function getDrinkIcon(drink) {
  if (drinkIcons[drink.id]) {
    return drinkIcons[drink.id];
  }

  const tags = drink.tagIds || [];
  if (tags.includes('black-coffee')) return fallbackByTag['black-coffee'];
  const isCoffee = tags.some((tag) => tag === 'coffee' || tag === 'latte' || tag === 'black-coffee');
  if (!isCoffee) {
    const rule = nameRules.find(([pattern, icon]) => icon && pattern.test(drink.displayName || ''));
    if (rule) return rule[1];
  }
  const matchedTag = tags.find((tag) => fallbackByTag[tag]);

  return matchedTag ? fallbackByTag[matchedTag] : '/assets/icons/drinks/milk-tea.png';
}

module.exports = {
  getDrinkIcon
};
