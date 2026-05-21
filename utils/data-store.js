const brands = require('../data/brands');
const brandDrinks = require('../data/brand-drinks');
const bases = require('../data/bases');
const cupSizes = require('../data/cup-sizes');
const sweetnessLevels = require('../data/sweetness-levels');
const toppings = require('../data/toppings');
const equivalents = require('../data/equivalents');
const copywriting = require('../data/copywriting');

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

module.exports = {
  getBrands,
  getBrandById,
  getDrinksByBrandId,
  getDrinkById,
  getBaseById,
  getCupSizeById,
  getSweetnessById,
  getToppingById,
  getToppingsByIds,
  bases,
  cupSizes,
  sweetnessLevels,
  toppings,
  equivalents,
  copywriting
};
