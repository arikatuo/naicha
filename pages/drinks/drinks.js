const store = require('../../utils/data-store');
const { calculateBrandDrinkCalories } = require('../../utils/calculator');
const { getDrinkIcon } = require('../../utils/drink-icons');
const { encodePayload, decodePayload } = require('../../utils/nav');
const { dateKey, isValidDateKey, relativeDateLabel } = require('../../utils/calendar');
const { saveAndShowInCalendar } = require('../../utils/record-flow');

function mapDrink(drink) {
  const tagColorMap = {
    fruit: 'tag-fruit',
    'milk-tea': 'tag-milktea',
    fresh: 'tag-fresh',
    toppings: 'tag-toppings',
    classic: 'tag-milktea',
    'milk-foam': 'tag-milktea',
    'thick-milk': 'tag-milktea',
    coffee: 'tag-coffee',
    latte: 'tag-coffee',
    'black-coffee': 'tag-coffee'
  };
  const tags = store.getTagsByIds(drink.tagIds || []);
  return {
    ...drink,
    tags,
    displayTags: tags.slice(0, 2).map(t => ({
      ...t,
      tagClass: tagColorMap[t.id] || ''
    })),
    icon: getDrinkIcon(drink),
    defaultCalories: store.getDefaultCalories(drink)
  };
}

// 筛选条：只列出这家店实际出现过的标签，最多 5 个
function buildFilters(drinks) {
  const counts = new Map();
  drinks.forEach((drink) => drink.tags.forEach((tag) => counts.set(tag.id, { id: tag.id, name: tag.name, count: ((counts.get(tag.id) || {}).count || 0) + 1 })));
  const tags = [...counts.values()].filter((tag) => tag.count < drinks.length).sort((a, b) => b.count - a.count).slice(0, 5);
  return tags.length ? [{ id: 'all', name: '全部' }, ...tags.map(({ id, name }) => ({ id, name }))] : [];
}

// 当前品牌的小料范围：咖啡品牌只显示咖啡加料，其余显示奶茶小料
let toppingScope = 'tea';

const COLLAPSED_TOPPINGS = 10;

// 小料列表：常用的先显示，已选中的永远可见，其余折叠
function toppingView(selectedIds = [], showAll = false) {
  const all = store.getToppingsForScope(toppingScope).map((topping) => ({
    ...topping,
    selected: selectedIds.includes(topping.id)
  }));
  const visible = showAll ? all : all.filter((topping, index) => index < COLLAPSED_TOPPINGS || topping.selected);
  return {
    toppingOptions: all,
    visibleToppingOptions: visible,
    hiddenToppingCount: all.length - visible.length,
    canCollapseToppings: all.length > COLLAPSED_TOPPINGS
  };
}

Page({
  data: {
    brandId: '',
    recordDate: '',
    recordDateLabel: '今天',
    liveCalories: 0,
    brand: null,
    brandName: '饮品选择',
    drinks: [],
    visibleDrinks: [],
    filters: [],
    activeFilter: 'all',
    sortByCalories: false,
    hasContent: false,
    emptyTitle: '',
    emptyMessage: '',
    selectedDrink: null,
    selectedSizeId: '',
    selectedSweetnessId: '',
    selectedExtraToppingIds: [],
    selectedExtraToppingCount: 0,
    cupSizes: store.cupSizes,
    sweetnessLevels: store.sweetnessLevels,
    toppings: store.toppings,
    defaultToppings: [],
    sizeOptions: [],
    toppingOptions: [],
    visibleToppingOptions: [],
    hiddenToppingCount: 0,
    canCollapseToppings: false,
    showAllToppings: false,
    panelOpen: false
  },

  onLoad(options) {
    const recordDate = options && isValidDateKey(options.recordDate) ? options.recordDate : '';
    this.setData({
      recordDate,
      recordDateLabel: recordDate ? relativeDateLabel(recordDate, dateKey(new Date())) : '今天'
    });
    this.loadContent((options && options.brandId) || '');
    if (options && options.drinkId) {
      this.openDrinkById(options.drinkId, decodePayload(options.prefill));
    }
  },

  // 按当前筛选和排序生成列表
  applyView() {
    const { drinks, activeFilter, sortByCalories } = this.data;
    let list = activeFilter === 'all' ? drinks.slice() : drinks.filter((drink) => drink.tagIds && drink.tagIds.includes(activeFilter));
    if (sortByCalories) list = list.sort((a, b) => a.defaultCalories - b.defaultCalories);
    this.setData({ visibleDrinks: list });
  },

  selectFilter(event) {
    this.setData({ activeFilter: event.currentTarget.dataset.id });
    this.applyView();
  },

  toggleSort() {
    this.setData({ sortByCalories: !this.data.sortByCalories });
    this.applyView();
  },

  loadContent(brandId) {
    const brand = store.getBrandById(brandId);
    toppingScope = brand && brand.category === 'coffee' ? 'coffee' : 'tea';
    const drinks = brand ? store.getDrinksByBrandId(brandId).map(mapDrink) : [];
    const hasContent = Boolean(brand && drinks.length);

    this.setData({
      brandId,
      brand,
      brandName: brand ? brand.name : '饮品选择',
      drinks,
      filters: buildFilters(drinks),
      activeFilter: 'all',
      sortByCalories: false,
      hasContent,
      emptyTitle: brand ? '这家店的饮品还在整理中' : '没有找到这家品牌',
      emptyMessage: brand
        ? '先返回品牌列表看看别家，或者再试一次。'
        : '可能是入口过期了，返回品牌列表重新选一家就好。',
      selectedDrink: null,
      selectedSizeId: '',
      selectedSweetnessId: '',
      selectedExtraToppingIds: [],
      selectedExtraToppingCount: 0,
      defaultToppings: [],
      sizeOptions: [],
      ...toppingView([], false),
      showAllToppings: false,
      panelOpen: false
    });
    this.applyView();
    if (brand && typeof wx !== 'undefined' && typeof wx.setNavigationBarTitle === 'function') {
      wx.setNavigationBarTitle({ title: brand.name });
    }
  },

  reloadContent() {
    this.loadContent(this.data.brandId);
  },

  backToBrands() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/record/record' });
      }
    });
  },

  openDrink(event) {
    this.openDrinkById(event.currentTarget.dataset.id);
  },

  openDrinkById(id, prefill) {
    const drink = store.getDrinkById(id);
    if (drink && drink.brandId !== this.data.brandId) return;
    if (!drink) {
      wx.showToast({ title: '这杯暂时打不开，换一杯试试', icon: 'none' });
      return;
    }

    const defaultToppings = store.getToppingsByIds(drink.defaultToppingIds || []);
    const sizeOptions = store.cupSizes
      .filter((size) => drink.availableSizes.includes(size.id))
      .map((size) => ({ ...size, selected: size.id === drink.defaultSize }));

    const selectedSizeId = prefill && drink.availableSizes.includes(prefill.sizeId) ? prefill.sizeId : drink.defaultSize;
    const selectedSweetnessId = prefill && store.getSweetnessById(prefill.sweetnessId) ? prefill.sweetnessId : drink.defaultSweetness;
    // 只保留这家店能加的小料，避免咖啡带着珍珠
    const allowedToppingIds = store.getToppingsForScope(toppingScope).map((topping) => topping.id);
    const selectedExtraToppingIds = prefill && Array.isArray(prefill.toppingIds)
      ? prefill.toppingIds.filter((toppingId) => allowedToppingIds.includes(toppingId)).slice(0, 3)
      : [];
    this.setData({
      selectedDrink: drink,
      selectedSizeId,
      selectedSweetnessId,
      selectedExtraToppingIds,
      selectedExtraToppingCount: selectedExtraToppingIds.length,
      defaultToppings,
      sizeOptions: sizeOptions.map((size) => ({ ...size, selected: size.id === selectedSizeId })),
      ...toppingView(selectedExtraToppingIds, false),
      showAllToppings: false,
      panelOpen: true
    });
    this.updateLiveCalories();
  },

  closePanel() {
    this.setData({
      panelOpen: false,
      selectedDrink: null,
      selectedSizeId: '',
      selectedSweetnessId: '',
      selectedExtraToppingIds: [],
      selectedExtraToppingCount: 0,
      defaultToppings: [],
      sizeOptions: [],
      ...toppingView([], false),
      showAllToppings: false,
      liveCalories: 0
    });
  },

  selectSize(event) {
    const selectedSizeId = event.currentTarget.dataset.id;
    this.setData({
      selectedSizeId,
      sizeOptions: this.data.sizeOptions.map((size) => ({
        ...size,
        selected: size.id === selectedSizeId
      }))
    });
    this.updateLiveCalories();
  },

  selectSweetness(event) {
    this.setData({ selectedSweetnessId: event.currentTarget.dataset.id });
    this.updateLiveCalories();
  },

  toggleAllToppings() {
    const showAllToppings = !this.data.showAllToppings;
    this.setData({ showAllToppings, ...toppingView(this.data.selectedExtraToppingIds, showAllToppings) });
  },

  toggleExtraTopping(event) {
    const id = event.currentTarget.dataset.id;
    const selected = this.data.selectedExtraToppingIds.slice();
    const exists = selected.includes(id);

    if (exists) {
      const next = selected.filter((item) => item !== id);
      this.setData({
        selectedExtraToppingIds: next,
        selectedExtraToppingCount: next.length,
        ...toppingView(next, this.data.showAllToppings)
      });
      this.updateLiveCalories();
      return;
    }

    if (selected.length >= 3) {
      wx.showToast({ title: '这杯已经很有料啦，最多加 3 种', icon: 'none' });
      return;
    }

    selected.push(id);
    this.setData({
      selectedExtraToppingIds: selected,
      selectedExtraToppingCount: selected.length,
      ...toppingView(selected, this.data.showAllToppings)
    });
    this.updateLiveCalories();
  },

  // 当前配置对应的热量；配置每变一次就刷新底部的实时热量条
  currentCalories() {
    const drink = this.data.selectedDrink;
    const size = store.getCupSizeById(this.data.selectedSizeId);
    const sweetness = store.getSweetnessById(this.data.selectedSweetnessId);
    if (!drink || !size || !sweetness) return null;
    const extraToppings = store.getToppingsByIds(this.data.selectedExtraToppingIds);
    return calculateBrandDrinkCalories({ drink, size, sweetness, extraToppings });
  },

  updateLiveCalories() {
    const calories = this.currentCalories();
    this.setData({ liveCalories: calories === null ? 0 : calories });
  },

  buildPayload() {
    const calories = this.currentCalories();
    if (calories === null) {
      wx.showToast({ title: '先把这杯配置完整吧', icon: 'none' });
      return null;
    }
    return {
      mode: 'brand',
      drinkName: this.data.selectedDrink.displayName,
      brandName: this.data.brand.name,
      calories,
      recordDate: this.data.recordDate,
      config: {
        brandId: this.data.brandId,
        drinkId: this.data.selectedDrink.id,
        sizeId: this.data.selectedSizeId,
        sweetnessId: this.data.selectedSweetnessId,
        toppingIds: this.data.selectedExtraToppingIds
      }
    };
  },

  calculate() {
    const payload = this.buildPayload();
    if (!payload) return;
    wx.navigateTo({ url: `/pages/result/result?payload=${encodePayload(payload)}` });
  },

  // 常喝的一杯不用再看结果页，直接记到日历
  saveNow() {
    const payload = this.buildPayload();
    if (!payload) return;
    try {
      saveAndShowInCalendar({
        date: payload.recordDate || dateKey(new Date()),
        mode: payload.mode,
        brandName: payload.brandName,
        drinkName: payload.drinkName,
        calories: payload.calories,
        config: payload.config
      });
    } catch (error) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  onShareAppMessage() {
    const brandId = this.data.brandId;
    return {
      title: store.copywriting.shareTitle,
      path: brandId
        ? `/pages/drinks/drinks?brandId=${encodeURIComponent(brandId)}`
        : '/pages/record/record'
    };
  }
});
