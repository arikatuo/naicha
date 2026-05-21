const store = require('../../utils/data-store');

Page({
  data: {
    brands: []
  },

  onLoad() {
    this.setData({ brands: store.getBrands() });
  },

  openBrand(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${id}` });
  }
});
