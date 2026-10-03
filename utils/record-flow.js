const diary = require('./diary-store');

// 保存一杯并回到日历，选中刚保存的那一天。结果页和「直接记到日历」共用。
function saveAndShowInCalendar({ date, mode, brandName, drinkName, calories, config }) {
  const record = diary.saveRecord({ date, mode, brandName, drinkName, calories, config });
  const app = typeof getApp === 'function' ? getApp() : null;
  if (app && app.globalData) {
    app.globalData.focusDate = date;
    app.globalData.focusRecordId = record.id;
  }
  wx.switchTab({ url: '/pages/home/home' });
  return record;
}

module.exports = { saveAndShowInCalendar };
