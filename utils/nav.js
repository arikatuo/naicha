function encodePayload(payload) {
  return encodeURIComponent(JSON.stringify(payload));
}

function decodePayload(encoded) {
  if (!encoded) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch (error) {
    return null;
  }
}

// 「再喝一杯」的目标页面：品牌饮品和自己搭配的会带着上次的配置直接打开。
function repeatRecordUrl(record, recordDate) {
  const config = (record && record.config) || {};
  const dateQuery = recordDate ? `&recordDate=${recordDate}` : '';
  if (record && record.mode === 'brand' && config.brandId && config.drinkId) {
    return `/pages/drinks/drinks?brandId=${config.brandId}&drinkId=${config.drinkId}&prefill=${encodePayload(config)}${dateQuery}`;
  }
  if (record && record.mode === 'custom' && config.baseId) {
    return `/pages/custom/custom?prefill=${encodePayload(config)}${dateQuery}`;
  }
  return `/pages/result/result?payload=${encodePayload(record)}`;
}

// 自定义 tabBar 高亮：0 日历，1 记一杯，2 统计
function syncTabBar(page, selected) {
  if (!page || typeof page.getTabBar !== 'function') return;
  const tabBar = page.getTabBar();
  if (tabBar && typeof tabBar.setData === 'function') tabBar.setData({ selected });
}

module.exports = {
  encodePayload,
  decodePayload,
  repeatRecordUrl,
  syncTabBar
};
