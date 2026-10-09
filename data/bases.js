// category：tea = 奶茶果茶，coffee = 咖啡。咖啡基底没有甜度选项，只能加咖啡类加料。
module.exports = [
  { id: 'milk-tea', name: '经典奶茶', calories: 320, sweetnessCalorieImpact: 'medium', category: 'tea' },
  { id: 'fruit-tea', name: '水果茶', calories: 260, sweetnessCalorieImpact: 'high', category: 'tea' },
  { id: 'lemon-tea', name: '柠檬茶', calories: 180, sweetnessCalorieImpact: 'high', category: 'tea' },
  { id: 'latte', name: '奶茶拿铁', calories: 300, sweetnessCalorieImpact: 'medium', category: 'tea' },
  { id: 'coconut', name: '椰乳', calories: 340, sweetnessCalorieImpact: 'medium', category: 'tea' },
  { id: 'pure-tea', name: '纯茶', calories: 90, sweetnessCalorieImpact: 'low', category: 'tea' },
  { id: 'cheese-tea', name: '芝士奶盖茶', calories: 390, sweetnessCalorieImpact: 'medium', category: 'tea' },
  { id: 'coffee-latte', name: '咖啡拿铁', calories: 190, sweetnessCalorieImpact: 'low', category: 'coffee', sweetnessAdjustable: false },
  { id: 'americano', name: '美式咖啡', calories: 10, sweetnessCalorieImpact: 'low', category: 'coffee', sweetnessAdjustable: false }
];
