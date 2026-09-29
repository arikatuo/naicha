const diary = require('../../utils/diary-store');
const { dateKey } = require('../../utils/calendar');
const { getPeriodStats } = require('../../utils/diary-stats');

const PERIODS = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' }
];

function chartBars(buckets) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  return buckets.map((bucket) => ({
    ...bucket,
    height: bucket.count ? Math.max(24, Math.round(bucket.count / max * 150)) : 6
  }));
}

Page({
  data: {
    periods: PERIODS,
    activePeriod: 'month',
    periodLabel: '',
    cups: 0,
    days: 0,
    calories: 0,
    buckets: [],
    chartTitle: '',
    hasPeriodRecords: false,
    storageError: false
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const stats = getPeriodStats(diary.getRecords(), this.data.activePeriod, new Date());
      const chartTitle = { week: '每天已记录杯数', month: '每周已记录杯数', year: '每月已记录杯数' }[this.data.activePeriod];
      this.setData({
        periodLabel: stats.label,
        cups: stats.cups,
        days: stats.days,
        calories: stats.calories,
        buckets: chartBars(stats.buckets),
        chartTitle,
        hasPeriodRecords: stats.cups > 0,
        storageError: false
      });
    } catch (error) {
      this.setData({ storageError: true });
    }
  },

  changePeriod(event) {
    const period = event.currentTarget.dataset.period;
    if (!PERIODS.some((item) => item.key === period) || period === this.data.activePeriod) return;
    this.setData({ activePeriod: period });
    this.refresh();
  },

  openBucket(event) {
    const bucket = this.data.buckets[event.currentTarget.dataset.index];
    if (!bucket || !bucket.count) return;
    this.openCalendar(bucket.focusDate);
  },

  openCalendar(focusDate) {
    const app = getApp();
    if (app && app.globalData) app.globalData.focusDate = focusDate || dateKey(new Date());
    wx.switchTab({ url: '/pages/home/home' });
  },

  goToCalendar() {
    this.openCalendar();
  },

  startRecord() {
    wx.navigateTo({ url: '/pages/brands/brands' });
  }
});
