const test = require('node:test');
const assert = require('node:assert/strict');
const { getResultCopy } = require('../utils/copy');

const copywriting = {
  resultTitles: [
    { min: 0, max: 299, title: '这杯快乐还算克制。', theme: 'fresh' },
    { min: 300, max: 499, title: '这杯快乐有点认真。', theme: 'milkTea' },
    { min: 500, max: 699, title: '快乐开始有分量了。', theme: 'warm' },
    { min: 700, max: 9999, title: '这杯可以算正餐嘉宾了。', theme: 'cocoa' }
  ]
};

test('getResultCopy chooses title and theme by calorie range', () => {
  assert.deepEqual(getResultCopy(486, copywriting), {
    title: '这杯快乐有点认真。',
    theme: 'milkTea'
  });
});
