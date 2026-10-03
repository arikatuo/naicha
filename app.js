App({
  globalData: {
    appName: '奶茶热量日历',
    focusDate: '',
    focusRecordId: '',
    recordDate: '',
    resetRecordDate: false
  },

  // 早期版本分享出去的「品牌 / 查热量」链接已经合并进「记一杯」，这里做兼容跳转。
  onPageNotFound(res) {
    const target = /pages\/(brands|lookup)\//.test((res && res.path) || '')
      ? '/pages/record/record'
      : '/pages/home/home';
    wx.switchTab({ url: target });
  }
});
