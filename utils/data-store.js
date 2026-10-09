const brands = require('../data/brands');
const brandDrinks = require('../data/brand-drinks');
const bases = require('../data/bases');
const cupSizes = require('../data/cup-sizes');
const sweetnessLevels = require('../data/sweetness-levels');
const toppings = require('../data/toppings');
const equivalents = require('../data/equivalents');
const copywriting = require('../data/copywriting');
const tags = require('../data/tags');
const { calculateBrandDrinkCalories } = require('./calculator');

function byId(items, id) {
  return items.find((item) => item.id === id) || null;
}

function getBrands() {
  return brands.slice().sort((a, b) => a.sort - b.sort);
}

function getBrandById(id) {
  return byId(brands, id);
}

function getDrinksByBrandId(brandId) {
  return brandDrinks.filter((drink) => drink.brandId === brandId);
}

function getDrinkById(id) {
  return byId(brandDrinks, id);
}

function getBaseById(id) {
  return byId(bases, id);
}

function getCupSizeById(id) {
  return byId(cupSizes, id);
}

function getSweetnessById(id) {
  return byId(sweetnessLevels, id);
}

function getToppingById(id) {
  return byId(toppings, id);
}

function getToppingsByIds(ids) {
  return ids.map(getToppingById).filter(Boolean);
}

// 小料按饮品类型分：咖啡只显示咖啡加料；奶茶不显示咖啡加料；scope 为 'all' 时全部显示（自己搭的拿铁）
// 常用的排前面，冷门的排后面；没列出的保持原来的顺序
const TOPPING_ORDER = ['pearl', 'brown-pearl', 'taro-ball', 'pudding', 'milk-foam', 'coconut-jelly', 'grass-jelly', 'red-bean', 'taro', 'sago', 'cold-foam', 'rice-ball', 'powder-strip', 'oreo', 'konjac-jelly', 'crisp-boba', 'milk-jelly', 'aiyu', 'kanten', 'aloe', 'grain', 'ice-cream'];

function orderToppings(list) {
  const rank = (topping) => {
    const index = TOPPING_ORDER.indexOf(topping.id);
    return index < 0 ? TOPPING_ORDER.length : index;
  };
  return list.map((topping, position) => ({ topping, position }))
    .sort((a, b) => rank(a.topping) - rank(b.topping) || a.position - b.position)
    .map(({ topping }) => topping);
}

function getToppingsForScope(scope) {
  if (scope === 'all') return orderToppings(toppings);
  if (scope === 'coffee') return orderToppings(toppings.filter((topping) => topping.scope === 'coffee'));
  return orderToppings(toppings.filter((topping) => topping.scope !== 'coffee'));
}

function getTagById(id) {
  return byId(tags, id);
}

function getTagsByIds(ids) {
  return ids.map(getTagById).filter(Boolean);
}

// 一杯饮品在默认杯型、默认甜度、不加料时的热量
function getDefaultCalories(drink) {
  if (!drink) return 0;
  return calculateBrandDrinkCalories({
    drink,
    size: getCupSizeById(drink.defaultSize),
    sweetness: getSweetnessById(drink.defaultSweetness),
    extraToppings: []
  });
}

// 在所有品牌的饮品里搜索：空格分隔的每个词都要命中饮品名、别名、品牌名或标签
function searchDrinks(query, limit = 20) {
  const terms = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return brandDrinks
    .map((drink, index) => {
      const brand = getBrandById(drink.brandId);
      const name = String(drink.displayName || '').toLowerCase();
      const alias = String(drink.aliasName || '').toLowerCase();
      const brandName = brand ? brand.name.toLowerCase() : '';
      const tagNames = getTagsByIds(drink.tagIds || []).map((tag) => tag.name.toLowerCase());
      let score = 0;
      for (const term of terms) {
        if (name.startsWith(term)) score += 3;
        else if (name.includes(term) || alias.includes(term)) score += 2;
        else if (brandName.includes(term) || tagNames.some((tag) => tag.includes(term))) score += 1;
        else return null;
      }
      return { drink, brand, score, index };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ drink, brand }) => ({ drink, brand }));
}

module.exports = {
  getDefaultCalories,
  searchDrinks,
  getBrands,
  getBrandById,
  getDrinksByBrandId,
  getDrinkById,
  getBaseById,
  getCupSizeById,
  getSweetnessById,
  getToppingById,
  getToppingsByIds,
  getToppingsForScope,
  getTagById,
  getTagsByIds,
  bases,
  cupSizes,
  sweetnessLevels,
  toppings,
  equivalents,
  copywriting,
  tags
};
