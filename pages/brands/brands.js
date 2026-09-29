const store = require('../../utils/data-store');
const { isValidDateKey } = require('../../utils/calendar');
const { getDrinkIcon } = require('../../utils/drink-icons');

const QUICK_DRINK_IDS = [
  'mixue-pearl-milk-tea',
  'chagee-boya-juexian',
  'coco-pearl-milk-tea'
];

Page({
  data: {
    brands: [],
    hasBrands: false,
    quickDrinks: [],
    recordDate: ''
  },

  onLoad(options) {
    this.setData({ recordDate: options && isValidDateKey(options.recordDate) ? options.recordDate : '' });
    this.reloadBrands();
  },

  reloadBrands() {
    const brands = store.getBrands().map(b => ({
      ...b,
      firstChar: b.name.charAt(0),
      logoFailed: false
    }));

    this.setData({
      brands,
      hasBrands: brands.length > 0,
      quickDrinks: QUICK_DRINK_IDS.map((id) => {
        const drink = store.getDrinkById(id);
        const brand = drink && store.getBrandById(drink.brandId);
        return drink && brand ? {
          id: drink.id,
          brandId: brand.id,
          brandName: brand.name,
          name: drink.displayName,
          icon: getDrinkIcon(drink)
        } : null;
      }).filter(Boolean)
    });
  },

  onLogoError(event) {
    const { index } = event.currentTarget.dataset;
    this.setData({ [`brands[${index}].logoFailed`]: true });
  },

  openBrand(event) {
    const { id } = event.currentTarget.dataset;
    const recordDate = this.data.recordDate ? `&recordDate=${this.data.recordDate}` : '';
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${id}${recordDate}` });
  },

  openQuickDrink(event) {
    const drink = this.data.quickDrinks.find((item) => item.id === event.currentTarget.dataset.id);
    if (!drink) return;
    const recordDate = this.data.recordDate ? `&recordDate=${this.data.recordDate}` : '';
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${drink.brandId}&drinkId=${drink.id}${recordDate}` });
  },

  goCustom() {
    const recordDate = this.data.recordDate ? `?recordDate=${this.data.recordDate}` : '';
    wx.navigateTo({ url: `/pages/custom/custom${recordDate}` });
  },

  goHome() {
    wx.reLaunch({ url: '/pages/home/home' });
  },

  onShareAppMessage() {
    return {
      title: store.copywriting.shareTitle,
      path: '/pages/brands/brands'
    };
  }
});
