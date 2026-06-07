const store = require('../../utils/data-store');

Page({
  data: {
    brands: []
  },

  onLoad() {
    const brands = store.getBrands().map((brand) => ({
      ...brand,
      drinkCount: store.getDrinksByBrandId(brand.id).length
    }));

    this.setData({ brands });
  },

  openBrand(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${id}` });
  }
});
