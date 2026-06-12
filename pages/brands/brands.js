const store = require('../../utils/data-store');

Page({
  data: {
    brands: [],
    hasBrands: false
  },

  onLoad() {
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
      hasBrands: brands.length > 0
    });
  },

  onLogoError(event) {
    const { index } = event.currentTarget.dataset;
    this.setData({ [`brands[${index}].logoFailed`]: true });
  },

  openBrand(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${id}` });
  },

  goHome() {
    wx.reLaunch({ url: '/pages/home/home' });
  }
});
