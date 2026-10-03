Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/home/home', text: '日历', icon: '/assets/tabs/calendar.png', activeIcon: '/assets/tabs/calendar-active.png' },
      { pagePath: '/pages/record/record', text: '记一杯', center: true },
      { pagePath: '/pages/stats/stats', text: '统计', icon: '/assets/tabs/stats.png', activeIcon: '/assets/tabs/stats-active.png' }
    ]
  },

  methods: {
    switchTab(event) {
      const { path, index } = event.currentTarget.dataset;
      if (index === this.data.selected) return;
      const app = typeof getApp === 'function' ? getApp() : null;
      if (app && app.globalData && path === '/pages/record/record') app.globalData.resetRecordDate = true;
      wx.switchTab({ url: path });
    }
  }
});
