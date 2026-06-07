function drink(brandId, slug, displayName, calories, options = {}) {
  const sizeCalories = options.sizeCalories || null;

  return {
    id: `${brandId}-${slug}`,
    brandId,
    displayName,
    aliasName: options.aliasName || '',
    baseCalories: calories,
    sizeCalories,
    defaultSize: options.defaultSize || (sizeCalories && sizeCalories.large ? 'large' : 'medium'),
    availableSizes: options.availableSizes || (sizeCalories ? Object.keys(sizeCalories) : ['medium', 'large']),
    defaultSweetness: options.defaultSweetness || 'half',
    sweetnessAdjustable: options.sweetnessAdjustable !== false,
    sweetnessCalorieImpact: options.sweetnessCalorieImpact || 'medium',
    defaultToppingIds: options.defaultToppingIds || [],
    tagIds: options.tagIds || ['classic'],
    sourceType: options.sourceType || 'document_reference',
    sourceNote: options.sourceNote || '奶茶热门饮品_杯型与小料热量_中国大陆口径.docx'
  };
}

module.exports = [
  drink('mixue', 'fresh-lemonade', '冰鲜柠檬水', 160, {
    sizeCalories: { large: 160 },
    availableSizes: ['large'],
    defaultSize: 'large',
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'fresh']
  }),
  drink('mixue', 'ice-cream', '新鲜冰淇淋', 180, {
    sizeCalories: { large: 180 },
    availableSizes: ['large'],
    defaultSize: 'large',
    defaultSweetness: 'normal',
    sweetnessAdjustable: false,
    tagIds: ['classic']
  }),
  drink('mixue', 'strawberry-shake', '草莓摇摇奶昔', 360, {
    sizeCalories: { large: 360 },
    availableSizes: ['large'],
    defaultSize: 'large',
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['ice-cream'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('mixue', 'jasmine-milk-green', '茉莉奶绿', 280, {
    sizeCalories: { large: 280 },
    availableSizes: ['large'],
    defaultSize: 'large',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('mixue', 'snow-king-coffee', '雪王雪顶咖啡', 330, {
    sizeCalories: { large: 330 },
    availableSizes: ['large'],
    defaultSize: 'large',
    defaultToppingIds: ['ice-cream'],
    tagIds: ['classic', 'toppings']
  }),
  drink('mixue', 'pearl-milk-tea', '珍珠奶茶', 460, {
    sizeCalories: { large: 460 },
    availableSizes: ['large'],
    defaultSize: 'large',
    defaultSweetness: 'normal',
    defaultToppingIds: ['pearl'],
    tagIds: ['classic', 'milk-tea', 'toppings']
  }),
  drink('mixue', 'orange-smash', '棒打鲜橙', 240, {
    sizeCalories: { large: 240 },
    availableSizes: ['large'],
    defaultSize: 'large',
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'fresh']
  }),
  drink('mixue', 'passion-fruit-cup', '满杯百香果', 360, {
    sizeCalories: { large: 360 },
    availableSizes: ['large'],
    defaultSize: 'large',
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'toppings']
  }),

  drink('chagee', 'boya-juexian', '伯牙绝弦', 130, {
    sizeCalories: { medium: 130, large: 170 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['classic', 'milk-tea', 'fresh']
  }),
  drink('chagee', 'ceylon-black-tea', '锡兰红茶', 150, {
    sizeCalories: { medium: 150, large: 195 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('chagee', 'qingmo-guanyin', '青沫观音', 145, {
    sizeCalories: { medium: 145, large: 190 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('chagee', 'qingqing-nuoshan', '青青糯山', 155, {
    sizeCalories: { medium: 155, large: 205 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('chagee', 'guifu-lanxiang', '桂馥兰香', 145, {
    sizeCalories: { medium: 145, large: 190 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('chagee', 'baiwu-hongchen', '白雾红尘', 150, {
    sizeCalories: { medium: 150, large: 200 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('chagee', 'rose-puer', '去云南·玫瑰普洱', 150, {
    sizeCalories: { medium: 150, large: 200 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('chagee', 'wanshanhong', '万山红·金丝小种', 150, {
    sizeCalories: { medium: 150, large: 200 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),

  drink('heytea', 'grape-jelly', '多肉葡萄冻', 140, {
    sizeCalories: { medium: 140 },
    availableSizes: ['medium'],
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['milk-jelly'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('heytea', 'berry-cheese', '芝芝莓莓', 430, {
    sizeCalories: { medium: 430 },
    availableSizes: ['medium'],
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['fruit', 'milk-foam']
  }),
  drink('heytea', 'mango-cheese', '芝芝芒芒', 470, {
    sizeCalories: { medium: 470 },
    availableSizes: ['medium'],
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['fruit', 'milk-foam']
  }),
  drink('heytea', 'green-grape', '多肉青提', 330, {
    sizeCalories: { medium: 330 },
    availableSizes: ['medium'],
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['milk-jelly'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('heytea', 'roasted-brown-sugar-bobo', '烤黑糖波波牛乳茶', 560, {
    sizeCalories: { medium: 560 },
    availableSizes: ['medium'],
    defaultSweetness: 'normal',
    defaultToppingIds: ['pearl'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('heytea', 'light-mango-pomelo', '轻芒芒甘露', 330, {
    sizeCalories: { medium: 330 },
    availableSizes: ['medium'],
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['sago'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('heytea', 'cheese-green-tea', '芝芝绿妍茶后', 260, {
    sizeCalories: { medium: 260 },
    availableSizes: ['medium'],
    defaultSweetness: 'half',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['fresh', 'milk-foam']
  }),
  drink('heytea', 'yueguan', '月观', 103, {
    sizeCalories: { medium: 103 },
    availableSizes: ['medium'],
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh']
  }),

  drink('chabaidao', 'yangzhi-ganlu', '杨枝甘露', 390, {
    sizeCalories: { medium: 390, large: 520 },
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['sago'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('chabaidao', 'green-grape-jasmine', '青提茉莉', 210, {
    sizeCalories: { medium: 210, large: 280 },
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'fresh']
  }),
  drink('chabaidao', 'watermelon-bobo', '西瓜啵啵', 240, {
    sizeCalories: { medium: 240, large: 320 },
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['crisp-boba'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('chabaidao', 'sunshine-green-grape-milk', '阳光青提冰奶', 310, {
    sizeCalories: { medium: 310, large: 420 },
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'milk-tea']
  }),
  drink('chabaidao', 'pink-guava', '粉上芭乐提', 230, {
    sizeCalories: { medium: 230, large: 310 },
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'fresh']
  }),
  drink('chabaidao', 'soy-jade-kylin', '豆乳玉麒麟', 330, {
    sizeCalories: { medium: 330, large: 450 },
    defaultSweetness: 'half',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('chabaidao', 'signature-taro-ball-milk-tea', '招牌芋圆奶茶', 470, {
    sizeCalories: { medium: 470, large: 620 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['taro-ball'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('chabaidao', 'jasmine-milk-green', '茉莉奶绿', 270, {
    sizeCalories: { medium: 270, large: 360 },
    defaultSweetness: 'half',
    tagIds: ['fresh', 'milk-tea']
  }),

  drink('guming', 'yangzhi-ganlu', '杨枝甘露', 390, {
    sizeCalories: { medium: 390, large: 520 },
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['sago'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('guming', 'super-cheese-grape', '超A芝士葡萄', 360, {
    sizeCalories: { medium: 360, large: 500 },
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['fruit', 'milk-foam']
  }),
  drink('guming', 'yunling-jasmine-white', '云岭茉莉白', 240, {
    sizeCalories: { medium: 240, large: 330 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('guming', 'brulee-crunch-milk', '布蕾脆脆奶芙', 520, {
    sizeCalories: { medium: 520, large: 700 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['pudding'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('guming', 'taro-grain-milk', '芋泥青稞牛奶', 500, {
    sizeCalories: { medium: 500, large: 670 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['taro', 'grain'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('guming', 'whole-lemon', '一颗大柠檬', 150, {
    sizeCalories: { medium: 150, large: 220 },
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'fresh']
  }),
  drink('guming', 'passion-duet', '百香双重奏', 330, {
    sizeCalories: { medium: 330, large: 450 },
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'toppings']
  }),
  drink('guming', 'classic-milk-tea', '古茗奶茶', 280, {
    sizeCalories: { medium: 280, large: 390 },
    defaultSweetness: 'half',
    tagIds: ['classic', 'milk-tea']
  }),

  drink('yidiandian', 'black-tea-macchiato', '红茶玛奇朵', 270, {
    sizeCalories: { medium: 270, large: 380 },
    defaultSweetness: 'half',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['classic', 'milk-foam']
  }),
  drink('yidiandian', 'boba-milk-tea', '波霸奶茶', 460, {
    sizeCalories: { medium: 460, large: 620 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['pearl'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('yidiandian', 'four-seasons-three-toppings', '四季春+珍波椰', 330, {
    sizeCalories: { medium: 330, large: 450 },
    defaultSweetness: 'half',
    defaultToppingIds: ['pearl', 'coconut-jelly'],
    tagIds: ['fresh', 'toppings']
  }),
  drink('yidiandian', 'milk-black-tea', '牛乳红茶', 220, {
    sizeCalories: { medium: 220, large: 320 },
    defaultSweetness: 'half',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('yidiandian', 'qingxiang-oolong', '清香乌龙茶', 60, {
    sizeCalories: { medium: 60, large: 90 },
    defaultSweetness: 'none',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh']
  }),
  drink('yidiandian', 'ice-cream-black-tea', '冰淇淋红茶', 260, {
    sizeCalories: { medium: 260, large: 380 },
    defaultSweetness: 'half',
    defaultToppingIds: ['ice-cream'],
    tagIds: ['fresh', 'toppings']
  }),
  drink('yidiandian', 'yakult-green-tea', '多多绿', 220, {
    sizeCalories: { medium: 220, large: 330 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fresh']
  }),
  drink('yidiandian', 'grapefruit-green-tea', '葡萄柚绿', 200, {
    sizeCalories: { medium: 200, large: 300 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'fresh']
  }),

  drink('coco', 'pearl-milk-tea', '珍珠奶茶', 450, {
    sizeCalories: { medium: 450, large: 620 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['pearl'],
    tagIds: ['classic', 'milk-tea', 'toppings']
  }),
  drink('coco', 'three-brothers', '奶茶三兄弟', 560, {
    sizeCalories: { medium: 560, large: 760 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['pearl', 'pudding', 'grass-jelly'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('coco', 'passion-fruit-double', '鲜百香双响炮', 380, {
    sizeCalories: { medium: 380, large: 520 },
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['pearl', 'coconut-jelly'],
    tagIds: ['fruit', 'toppings']
  }),
  drink('coco', 'taro-grain-milk', '鲜芋青稞牛奶', 510, {
    sizeCalories: { medium: 510, large: 680 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['taro', 'grain'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('coco', 'jasmine-milk-green', '茉莉奶绿', 300, {
    sizeCalories: { medium: 300, large: 420 },
    defaultSweetness: 'half',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('coco', 'taro-milk-tea', '芋头奶茶', 400, {
    sizeCalories: { medium: 400, large: 560 },
    defaultSweetness: 'normal',
    tagIds: ['milk-tea']
  }),
  drink('coco', 'lemon-king', '柠檬霸', 180, {
    sizeCalories: { medium: 180, large: 260 },
    defaultSweetness: 'seventy',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'fresh']
  }),
  drink('coco', 'coconut-mango-pomelo', '生椰杨枝甘露', 430, {
    sizeCalories: { medium: 430, large: 600 },
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    defaultToppingIds: ['sago'],
    tagIds: ['fruit', 'toppings']
  }),

  drink('molimilk', 'jasmine-milk-white', '茉莉奶白', 250, {
    sizeCalories: { medium: 250, large: 350 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['classic', 'fresh', 'milk-tea']
  }),
  drink('molimilk', 'osmanthus-longjing', '桂花龙井', 230, {
    sizeCalories: { medium: 230, large: 330 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('molimilk', 'bailan', '白兰', 250, {
    sizeCalories: { medium: 250, large: 350 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('molimilk', 'gardenia-milk-white', '栀子奶白', 250, {
    sizeCalories: { medium: 250, large: 350 },
    defaultSweetness: 'half',
    sweetnessCalorieImpact: 'low',
    tagIds: ['fresh', 'milk-tea']
  }),
  drink('molimilk', 'matcha-bailan', '抹茶白兰', 430, {
    sizeCalories: { medium: 430, large: 600 },
    defaultSweetness: 'half',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['fresh', 'milk-foam']
  }),
  drink('molimilk', 'matcha-zhenwang', '抹茶针王', 430, {
    sizeCalories: { medium: 430, large: 600 },
    defaultSweetness: 'half',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['fresh', 'milk-foam']
  }),
  drink('molimilk', 'jasmine-flower', '一朵茉莉花', 460, {
    sizeCalories: { medium: 460, large: 650 },
    defaultSweetness: 'normal',
    defaultToppingIds: ['milk-foam'],
    tagIds: ['milk-tea', 'toppings']
  }),
  drink('molimilk', 'jasmine-mango-pomelo', '茉莉杨枝甘露', 420, {
    sizeCalories: { medium: 420, large: 580 },
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'high',
    tagIds: ['fruit', 'toppings']
  })
];
