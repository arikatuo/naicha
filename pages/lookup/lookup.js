const store = require('../../utils/data-store');

Page({
  goBrands() {
    wx.navigateTo({ url: '/pages/brands/brands' });
  },

  goCustom() {
    wx.navigateTo({ url: '/pages/custom/custom' });
  },

  onShareAppMessage() {
    return {
      title: store.copywriting.shareTitle,
      path: '/pages/lookup/lookup'
    };
  }
});
