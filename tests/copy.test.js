const test = require('node:test');
const assert = require('node:assert/strict');
const { getResultCopy } = require('../utils/copy');

const copywriting = {
  resultTitles: [
    { min: 0, max: 199, title: '轻轻一杯，快乐刚刚好。', badge: '清爽小口', theme: 'fresh' },
    { min: 200, max: 299, title: '还算克制，今天挺会选。', badge: '理智派', theme: 'fresh' },
    { min: 300, max: 399, title: '快乐上线，分量刚好有感。', badge: '快乐常驻', theme: 'milkTea' },
    { min: 400, max: 499, title: '这杯认真了，甜蜜有存在感。', badge: '甜蜜加码', theme: 'milkTea' },
    { min: 500, max: 599, title: '这一杯有点顶，快乐很扎实。', badge: '快乐实心', theme: 'warm' },
    { min: 600, max: 699, title: '今天这杯，已经够撑场面。', badge: '分量担当', theme: 'warm' },
    { min: 700, max: 849, title: '可以当正餐嘉宾登场了。', badge: '正餐嘉宾', theme: 'cocoa' },
    { min: 850, max: 9999, title: '快乐满杯，今天很会犒劳自己。', badge: '满杯选手', theme: 'cocoa' }
  ]
};

test('getResultCopy chooses title badge and theme across detailed calorie ranges', () => {
  const expectations = [
    [160, '轻轻一杯，快乐刚刚好。', '清爽小口', 'fresh'],
    [260, '还算克制，今天挺会选。', '理智派', 'fresh'],
    [360, '快乐上线，分量刚好有感。', '快乐常驻', 'milkTea'],
    [460, '这杯认真了，甜蜜有存在感。', '甜蜜加码', 'milkTea'],
    [560, '这一杯有点顶，快乐很扎实。', '快乐实心', 'warm'],
    [660, '今天这杯，已经够撑场面。', '分量担当', 'warm'],
    [760, '可以当正餐嘉宾登场了。', '正餐嘉宾', 'cocoa'],
    [900, '快乐满杯，今天很会犒劳自己。', '满杯选手', 'cocoa']
  ];

  for (const [calories, title, badge, theme] of expectations) {
    assert.deepEqual(getResultCopy(calories, copywriting), { title, badge, theme });
  }
});

test('getResultCopy returns a complete playful fallback', () => {
  assert.deepEqual(getResultCopy(-1, copywriting), {
    title: '快乐上线，分量刚好有感。',
    badge: '快乐常驻',
    theme: 'milkTea'
  });
});
