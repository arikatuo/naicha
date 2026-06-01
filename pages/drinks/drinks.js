const store = require('../../utils/data-store');
const { calculateBrandDrinkCalories } = require('../../utils/calculator');
const { encodePayload } = require('../../utils/nav');

Page({
  data: {
    brand: null,
    drinks: [],
    selectedDrink: null,
    selectedSizeId: '',
    selectedSweetnessId: '',
    selectedExtraToppingIds: [],
    cupSizes: store.cupSizes,
    sweetnessLevels: store.sweetnessLevels,
    toppings: store.toppings,
    defaultToppings: [],
    sizeOptions: [],
    toppingOptions: [],
    panelOpen: false
  },

  onLoad(options) {
    const brand = store.getBrandById(options.brandId);
    const drinks = store.getDrinksByBrandId(options.brandId).map((drink) => {
      const tags = store.getTagsByIds(drink.tagIds || []);
      return {
        ...drink,
        tags,
        displayTags: tags.slice(0, 2),
        icon: tags[0] ? tags[0].icon : '/assets/icons/milk-tea-cup.png'
      };
    });
    this.setData({ brand, drinks });
  },

  openDrink(event) {
    const drink = store.getDrinkById(event.currentTarget.dataset.id);
    const defaultToppings = store.getToppingsByIds(drink.defaultToppingIds || []);
    const sizeOptions = store.cupSizes
      .filter((size) => drink.availableSizes.includes(size.id))
      .map((size) => ({ ...size, selected: size.id === drink.defaultSize }));
    const toppingOptions = store.toppings.map((topping) => ({ ...topping, selected: false }));

    this.setData({
      selectedDrink: drink,
      selectedSizeId: drink.defaultSize,
      selectedSweetnessId: drink.defaultSweetness,
      selectedExtraToppingIds: [],
      defaultToppings,
      sizeOptions,
      toppingOptions,
      panelOpen: true
    });
  },

  closePanel() {
    this.setData({ panelOpen: false });
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
        toppingOptions: this.data.toppingOptions.map((topping) => ({
          ...topping,
          selected: next.includes(topping.id)
        }))
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
      toppingOptions: this.data.toppingOptions.map((topping) => ({
        ...topping,
        selected: selected.includes(topping.id)
      }))
    });
  },

  calculate() {
    const drink = this.data.selectedDrink;
    const size = store.getCupSizeById(this.data.selectedSizeId);
    const sweetness = store.getSweetnessById(this.data.selectedSweetnessId);
    const extraToppings = store.getToppingsByIds(this.data.selectedExtraToppingIds);
    const calories = calculateBrandDrinkCalories({ drink, size, sweetness, extraToppings });
    const payload = {
      mode: 'brand',
      drinkName: drink.displayName,
      brandName: this.data.brand.name,
      calories
    };

    wx.navigateTo({ url: `/pages/result/result?payload=${encodePayload(payload)}` });
  }
});
