const store = require('../../utils/data-store');
const diary = require('../../utils/diary-store');
const { dateKey, isValidDateKey, relativeDateLabel } = require('../../utils/calendar');
const { getDrinkIcon } = require('../../utils/drink-icons');
const { repeatRecordUrl, syncTabBar } = require('../../utils/nav');

const QUICK_DRINK_IDS = [
  'mixue-pearl-milk-tea',
  'chagee-boya-juexian',
  'coco-pearl-milk-tea',
  'chabaidao-yangzhi-ganlu',
  'heytea-mango-cheese',
  'heytea-berry-cheese',
  'yidiandian-boba-milk-tea',
  'mixue-fresh-lemonade',
  'guming-super-cheese-grape',
  'heytea-roasted-brown-sugar-bobo'
];
const RECENT_LIMIT = 6;

function recentKey(record) {
  const config = record.config || {};
  return record.mode === 'brand' && config.brandId && config.drinkId
    ? `brand:${config.brandId}:${config.drinkId}`
    : `${record.mode}:${record.drinkName}`;
}

Page({
  data: {
    brands: [],
    visibleBrands: [],
    brandTabs: [],
    brandCategory: 'all',
    hasBrands: false,
    quickDrinks: [],
    recentDrinks: [],
    query: '',
    searchResults: [],
    recordDate: '',
    recordDateLabel: '今天',
    todayDate: ''
  },

  onLoad() {
    this.setDate(dateKey(new Date()));
    this.reloadBrands();
  },

  onShow() {
    syncTabBar(this, 1);
    const app = typeof getApp === 'function' ? getApp() : null;
    const globals = (app && app.globalData) || {};
    if (globals.recordDate && isValidDateKey(globals.recordDate)) {
      // 从日历选了某一天进来：只用一次
      this.setDate(globals.recordDate);
      globals.recordDate = '';
      globals.resetRecordDate = false;
    } else if (globals.resetRecordDate) {
      // 自定义底部导航不会触发 onTabItemTap，点「记一杯」时由导航栏打上标记
      this.setDate(dateKey(new Date()));
      globals.resetRecordDate = false;
    }
    this.loadRecents();
  },

  // 主动点「记一杯」标签视为重新开始，日期回到今天；从日历带日期进来不会触发这里
  onTabItemTap() {
    this.setDate(dateKey(new Date()));
  },

  setDate(date) {
    const today = dateKey(new Date());
    this.setData({ recordDate: date, recordDateLabel: relativeDateLabel(date, today), todayDate: today });
  },

  changeDate(event) {
    this.setDate(event.detail.value);
  },

  loadRecents() {
    try {
      const records = diary.getRecords().slice().sort((a, b) => b.createdAt - a.createdAt);
      const seen = new Set();
      const recentDrinks = [];
      for (const record of records) {
        const key = recentKey(record);
        if (seen.has(key)) continue;
        seen.add(key);
        recentDrinks.push({
          id: record.id,
          name: record.drinkName,
          meta: `${record.brandName || '自己搭配'} · ${record.calories} kcal`
        });
        if (recentDrinks.length >= RECENT_LIMIT) break;
      }
      this.setData({ recentDrinks, recentRecords: records });
    } catch (error) {
      this.setData({ recentDrinks: [] });
    }
  },

  reloadBrands() {
    const brands = store.getBrands();

    this.setData({
      brands,
      hasBrands: brands.length > 0,
      brandCategory: 'all',
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
    this.applyBrandView();
  },

  // 品牌分类：全部 / 奶茶果茶 / 咖啡
  applyBrandView() {
    const { brands, brandCategory } = this.data;
    const count = (category) => brands.filter((brand) => brand.category === category).length;
    this.setData({
      brandTabs: [
        { id: 'all', name: '全部', count: brands.length },
        { id: 'tea', name: '奶茶果茶', count: count('tea') },
        { id: 'coffee', name: '咖啡', count: count('coffee') }
      ].filter((tab) => tab.id === 'all' || tab.count > 0),
      visibleBrands: brandCategory === 'all' ? brands : brands.filter((brand) => brand.category === brandCategory)
    });
  },

  selectBrandCategory(event) {
    this.setData({ brandCategory: event.currentTarget.dataset.id });
    this.applyBrandView();
  },

  onSearchInput(event) {
    const query = String(event.detail.value || '');
    const searchResults = store.searchDrinks(query).map(({ drink, brand }) => ({
      id: drink.id,
      brandId: drink.brandId,
      name: drink.displayName,
      brandName: brand ? brand.name : '',
      calories: store.getDefaultCalories(drink),
      icon: getDrinkIcon(drink)
    }));
    this.setData({ query, searchResults });
  },

  clearSearch() {
    this.setData({ query: '', searchResults: [] });
  },

  openSearchResult(event) {
    const result = this.data.searchResults.find((item) => item.id === event.currentTarget.dataset.id);
    if (!result) return;
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${result.brandId}&drinkId=${result.id}&recordDate=${this.data.recordDate}` });
  },

  openRecent(event) {
    const record = (this.data.recentRecords || []).find((item) => item.id === event.currentTarget.dataset.id);
    if (!record) return;
    wx.navigateTo({ url: repeatRecordUrl(record, this.data.recordDate) });
  },

  openBrand(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${id}&recordDate=${this.data.recordDate}` });
  },

  openQuickDrink(event) {
    const drink = this.data.quickDrinks.find((item) => item.id === event.currentTarget.dataset.id);
    if (!drink) return;
    wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${drink.brandId}&drinkId=${drink.id}&recordDate=${this.data.recordDate}` });
  },

  goCustom() {
    wx.navigateTo({ url: `/pages/custom/custom?recordDate=${this.data.recordDate}` });
  },

  onShareAppMessage() {
    return {
      title: store.copywriting.shareTitle,
      path: '/pages/record/record'
    };
  }
});
