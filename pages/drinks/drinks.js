const store = require('../../utils/data-store');
const { calculateBrandDrinkCalories } = require('../../utils/calculator');
const { getDrinkIcon } = require('../../utils/drink-icons');
const { encodePayload, decodePayload } = require('../../utils/nav');
const { isValidDateKey } = require('../../utils/calendar');

function mapDrink(drink) {
  const tagColorMap = {
    fruit: 'tag-fruit',
    'milk-tea': 'tag-milktea',
    fresh: 'tag-fresh',
    toppings: 'tag-toppings',
    classic: 'tag-milktea',
    'milk-foam': 'tag-milktea',
    'thick-milk': 'tag-milktea'
  };
  const tags = store.getTagsByIds(drink.tagIds || []);
  return {
    ...drink,
    tags,
    displayTags: tags.slice(0, 2).map(t => ({
      ...t,
      tagClass: tagColorMap[t.id] || ''
    })),
    icon: getDrinkIcon(drink)
  };
}

function createToppingOptions(selectedIds = []) {
  return store.toppings.map((topping) => ({
    ...topping,
    selected: selectedIds.includes(topping.id)
  }));
}

Page({
  data: {
    brandId: '',
    recordDate: '',
    brand: null,
    brandName: '饮品选择',
    drinks: [],
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
    toppingOptions: createToppingOptions(),
    panelOpen: false
  },

  onLoad(options) {
    this.setData({ recordDate: options && isValidDateKey(options.recordDate) ? options.recordDate : '' });
    this.loadContent((options && options.brandId) || '');
    if (options && options.drinkId) {
      this.openDrinkById(options.drinkId, decodePayload(options.prefill));
    }
  },

  loadContent(brandId) {
    const brand = store.getBrandById(brandId);
    const drinks = brand ? store.getDrinksByBrandId(brandId).map(mapDrink) : [];
    const hasContent = Boolean(brand && drinks.length);

    this.setData({
      brandId,
      brand,
      brandName: brand ? brand.name : '饮品选择',
      drinks,
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
      toppingOptions: createToppingOptions(),
      panelOpen: false
    });
  },

  reloadContent() {
    this.loadContent(this.data.brandId);
  },

  backToBrands() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: '/pages/brands/brands' });
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
    const selectedExtraToppingIds = prefill && Array.isArray(prefill.toppingIds)
      ? prefill.toppingIds.filter((toppingId) => store.getToppingById(toppingId)).slice(0, 3)
      : [];
    this.setData({
      selectedDrink: drink,
      selectedSizeId,
      selectedSweetnessId,
      selectedExtraToppingIds,
      selectedExtraToppingCount: selectedExtraToppingIds.length,
      defaultToppings,
      sizeOptions: sizeOptions.map((size) => ({ ...size, selected: size.id === selectedSizeId })),
      toppingOptions: createToppingOptions(selectedExtraToppingIds),
      panelOpen: true
    });
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
      toppingOptions: createToppingOptions()
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
  },

  selectSweetness(event) {
    this.setData({ selectedSweetnessId: event.currentTarget.dataset.id });
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
        toppingOptions: createToppingOptions(next)
      });
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
      toppingOptions: createToppingOptions(selected)
    });
  },

  calculate() {
    const drink = this.data.selectedDrink;
    const size = store.getCupSizeById(this.data.selectedSizeId);
    const sweetness = store.getSweetnessById(this.data.selectedSweetnessId);
    if (!drink || !size || !sweetness) {
      wx.showToast({ title: '先把这杯配置完整吧', icon: 'none' });
      return;
    }

    const extraToppings = store.getToppingsByIds(this.data.selectedExtraToppingIds);
    const calories = calculateBrandDrinkCalories({ drink, size, sweetness, extraToppings });
    const payload = {
      mode: 'brand',
      drinkName: drink.displayName,
      brandName: this.data.brand.name,
      calories,
      recordDate: this.data.recordDate,
      config: {
        brandId: this.data.brandId,
        drinkId: drink.id,
        sizeId: this.data.selectedSizeId,
        sweetnessId: this.data.selectedSweetnessId,
        toppingIds: this.data.selectedExtraToppingIds
      }
    };

    wx.navigateTo({ url: `/pages/result/result?payload=${encodePayload(payload)}` });
  },

  onShareAppMessage() {
    const brandId = this.data.brandId;
    return {
      title: store.copywriting.shareTitle,
      path: brandId
        ? `/pages/drinks/drinks?brandId=${encodeURIComponent(brandId)}`
        : '/pages/brands/brands'
    };
  }
});
