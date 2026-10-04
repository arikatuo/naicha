# 饮品资料 C 组：10 个品牌，80 款候选

核查日期：2026-10-04。只作用户核实草稿，未导入小程序。`kcal` 是单配置公开值或候选代表值，`range` 是原站区间或本草稿情景区间，不是统计置信区间。份量未注明的条目不能直接当品牌固定份量。

## 数据质量

- 瑞幸 8 款为大陆官网公开的指定配置热量。生椰三重奏包含椰子奶油顶与椰奶冻，不能再加一次。茉莉花香拿铁搜索摘要曾出现 76-94，打开正文为 76；需用户确认实时点单配置。
- 快乐柠檬 5 款、库迪 3 款、挪瓦生椰 1 款取第三方热量。快乐柠檬各区间未绑定配置，代表值仅为方便核实的区间近似中值；不能当正常糖实测值。
- 其余为配料估算：来源证明饮品名/组成，不证明热量。每行 sourceNote 写明人为假设。很多糖浆含糖、果酱、厚奶、椰乳供应商营养表未取得，采用宽区间。
- 吾饮良品推荐来源含 2023 年款，尚不能证明 2026 年当前在售；优先核实是否下架。冰雪时光、Manner 部分候选是近期菜单款，并未得到全国销量证明。
- 未采用海外星巴克营养表或港澳台快乐柠檬配方作为大陆官方数据。Manner 官网读取失败，采用第三方大陆菜单。
- 挪瓦旧半熟芝士第三方写 364kcal/45ml，容量明显异常；已排除该配对，不能据此推导每 100ml 热量。新超模半熟芝士的热量降低 43% 也不应与旧版364数字直接相乘，比较基线不确定。

## 估算的公共基础与边界

- 糖按约 4kcal/g；能量系数依据[国家卫健委说明](https://www.nhc.gov.cn/zwgk/zcjd/201402/6f68ec6692594cf28d190cb47b770c11.shtml)，搜索取得摘要，直开被412阻止。
- 全脂牛奶按约 61kcal/100g，依据[USDA 数据转录页](https://whatyoueat.io/foods/171265-whole-milk)。这是一般食材数据，不是各品牌用奶证明。实际加奶重量是估算假设。
- 燕麦奶约 58kcal/100ml 参考[FatSecret Oatly 分类](https://www.fatsecret.cn/%E7%83%AD%E9%87%8F%E8%90%A5%E5%85%BB/oatly)搜索摘要及[营养标签讨论](https://post.smzdm.com/p/a7d5972g/)，不证明Manner使用该款。
- 奶盖、厚奶、珍珠、椰乳、果酱等采用通用情景假设，需用实际包装标签替换；范围故意较宽。所有粗估中心值取整，避免虚假精准。
- 拿铁不另外加糖仍有乳糖；果茶不另外加糖仍有水果/果酱糖；咖啡美式接近零不等于严格0kcal。减少糖度只能减少额外糖部分，不把整杯热量乘0.5。

## 已见加料与待核实项

- 快乐柠檬大陆单品页面明确列可加椰果、奥利奥、布丁、珍珠、小芋圆、蛋糕酱、蜜红豆，岩盐芝士奶茶还列西米：[岩盐芝士奶茶](https://www.nckfhsm.com/products/yan-yan-zhi-shi-nai-cha)、[岩盐芝士奇兰](https://www.nckfhsm.com/products/yan-yan-zhi-shi-qi-lan)。页面只给加价，不给克数和热量；需通用小料表作暂估。
- 吾饮良品资料说明草莓玛奇朵可加椰果、蜂蜜冻；吾家奶茶珍珠/红豆/椰果版本应分开；满杯烧仙草自带多种配料，不能重复加算：[第三方组成说明](https://m.maigoo.com/top/435827.html)。
- 挪瓦旧菜单列加份浓度，奶类换用与各款糖浆加份克数未取得。额外浓缩可先按约5-10kcal/份候选，不能加完整另一杯咖啡。
- 星巴克菜单确认香草/榛果糖浆、焦糖淋酱、摩卡酱；奶油顶作为摩卡估算配置，是否当店默认需核实。额外一泵糖浆克数、换奶差值未取得；换奶应替换原奶能量，不能作为完整加料叠加。
- 瑞幸三重奏自带椰冻奶油、丝绒自带厚奶、小黄油自带黄油风味；均已包含在官方热量内。其他品牌是否支持自由加珍珠/椰果未核实，不自行套用茶饮品牌的小料菜单。

补充核查：库迪蓝椰单品明确含晶球，已计入整杯估算，不重复加算；经典拿铁菜单列可加单份浓缩，克数未注明。

## 候选表

### LINLEE 林里

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|招牌手打柠檬茶|未注明 / 未注明|180|110–260|配料估算|柠檬|[查看](https://you.ctrip.com/food/152/136615890.html)|
|单丛鸭屎香手打柠檬茶|未注明 / 未注明|180|110–260|配料估算|柠檬|[查看](https://you.ctrip.com/food/152/136615890.html)|
|清新手打柠檬茶|未注明 / 未注明|160|90–240|配料估算|柠檬|[查看](https://you.ctrip.com/food/152/136615890.html)|
|海底椰手打冰柠茶|未注明 / 未注明|270|180–420|配料估算|柠檬；椰乳已计入|[查看](https://you.ctrip.com/food/152/136615890.html)|
|西瓜冰柠茶|未注明 / 未注明|200|120–300|配料估算|西瓜、柠檬|[查看](https://you.ctrip.com/food/152/136615890.html)|
|苹果冰柠茶|未注明 / 未注明|230|140–340|配料估算|苹果、柠檬|[查看](https://you.ctrip.com/food/152/136615890.html)|
|香柠椰青水|未注明 / 未注明|170|90–270|配料估算|柠檬；椰子水已计入|[查看](https://you.ctrip.com/food/152/136615890.html)|
|空山乌龙鲜奶茶|未注明 / 未注明|240|150–350|配料估算|鲜奶已计入|[查看](https://you.ctrip.com/food/152/136615890.html)|

### 快乐柠檬

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|大红袍真香冻柠茶|未注明 / 未注明|120|28–218|第三方参考|柠檬|[查看](https://www.nckfhsm.com/products/da-hong-pao-zhen-xiang-dong-ning-cha)|
|招牌小金桔柠檬茶|未注明 / 未注明|300|153–458|第三方参考|金桔、柠檬|[查看](https://www.nckfhsm.com/products/zhao-pai-xiao-jin-ju-ning-meng-cha)|
|岩盐芝士奶茶|未注明 / 未注明|530|296–756|第三方参考|芝士奶盖|[查看](https://www.nckfhsm.com/products/yan-yan-zhi-shi-nai-cha)|
|岩盐芝士奇兰|未注明 / 未注明|260|220–297|第三方参考|芝士奶盖|[查看](https://www.nckfhsm.com/products/yan-yan-zhi-shi-qi-lan)|
|岩盐芝士鸭屎香|未注明 / 未注明|280|194–375|第三方参考|芝士奶盖|[查看](https://www.nckfhsm.com/products/yan-yan-zhi-shi-ya-shi-xiang)|
|蛋糕忌廉珍珠奶茶|未注明 / 未注明|520|350–750|配料估算|珍珠、蛋糕忌廉|[查看](https://www.nckfhsm.com/brands/kuai-le-ning-meng/menu/available)|
|蛋糕忌廉珍珠牛奶茶|未注明 / 未注明|470|300–700|配料估算|珍珠、蛋糕忌廉；牛奶已计入|[查看](https://www.nckfhsm.com/brands/kuai-le-ning-meng/menu/available)|
|菠萝蜜桃冰沙|未注明 / 未注明|240|140–380|配料估算|菠萝、蜜桃|[查看](https://www.nckfhsm.com/brands/kuai-le-ning-meng/menu/available)|

### 冰雪时光

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|冰鲜柠檬水|未注明 / 未注明|150|80–240|配料估算|柠檬|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|
|抹茶黑糖珍珠牛乳|未注明 / 未注明|410|280–590|配料估算|黑糖珍珠；牛奶、黑糖已计入|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|
|黑糖芝士牛乳|未注明 / 未注明|410|270–600|配料估算|芝士奶盖；牛奶、黑糖已计入|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|
|抹茶芋泥牛乳|未注明 / 未注明|400|260–580|配料估算|芋泥；牛乳已计入|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|
|芋见珍珠牛乳|未注明 / 未注明|440|300–640|配料估算|芋泥、珍珠；牛乳已计入|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|
|芋见茉莉牛乳|未注明 / 未注明|350|220–520|配料估算|芋泥；牛乳已计入|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|
|满杯青提茉莉|未注明 / 未注明|240|140–380|配料估算|青提|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|
|山楂桃桃|未注明 / 未注明|240|140–380|配料估算|山楂、桃|[查看](https://www.nckfhsm.com/brands/bing-xue-shi-guang/menu/available)|

### 吾饮良品

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|草莓玛奇朵|未注明 / 未注明|320|200–470|配料估算|草莓、奶盖|[查看](https://m.maigoo.com/top/435827.html)|
|有颗柠檬|未注明 / 未注明|180|100–300|配料估算|柠檬|[查看](https://m.maigoo.com/top/435827.html)|
|多肉桃桃|未注明 / 未注明|250|140–390|配料估算|桃果肉、清凉冻|[查看](https://m.maigoo.com/top/435827.html)|
|杨枝甘露|未注明 / 未注明|400|250–600|配料估算|芒果、西柚、西米；椰奶已计入|[查看](https://m.maigoo.com/top/435827.html)|
|芋圆桂花酒酿|未注明 / 未注明|490|320–720|配料估算|芋圆、桂花酒酿、奶霜|[查看](https://m.maigoo.com/top/435827.html)|
|厚乳拿铁|未注明 / 未注明|280|180–420|配料估算|厚乳已计入|[查看](https://m.maigoo.com/top/435827.html)|
|满杯烧仙草|未注明 / 未注明|570|350–850|配料估算|仙草、珍珠、红豆、芋圆、花生、马蹄、葡萄干|[查看](https://m.maigoo.com/top/435827.html)|
|吾家奶茶|未注明 / 未注明|360|230–540|配料估算|珍珠（估算选定版本）|[查看](https://m.maigoo.com/top/435827.html)|

### 星巴克 Starbucks

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|美式咖啡|未注明；估算按中杯约355ml / 不另外加糖（估算配置）|10|5–20|配料估算|无|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|
|拿铁|未注明；估算按中杯约355ml / 不另外加糖（估算配置）|190|130–250|配料估算|牛奶已计入|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|
|卡布奇诺|未注明；估算按中杯约355ml / 不另外加糖（估算配置）|130|80–200|配料估算|牛奶已计入|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|
|馥芮白|未注明；估算按中杯约355ml / 不另外加糖（估算配置）|180|120–250|配料估算|牛奶已计入|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|
|焦糖玛奇朵|未注明；估算按中杯约355ml / 未注明；估算含原配方糖浆|260|180–360|配料估算|焦糖淋酱、香草糖浆已计入|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|
|摩卡|未注明；估算按中杯约355ml / 未注明；估算含原配方酱料|330|230–470|配料估算|摩卡酱、奶油顶已计入|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|
|香草风味拿铁|未注明；估算按中杯约355ml / 未注明；估算含原配方糖浆|270|190–370|配料估算|香草糖浆已计入|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|
|榛果风味拿铁|未注明；估算按中杯约355ml / 未注明；估算含原配方糖浆|270|190–370|配料估算|榛果糖浆已计入|[查看](https://www.starbucks.com.cn/menu/beverages/espresso/caffe-latte/)|

### 瑞幸咖啡

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|生椰拿铁|大杯/冰；毫升未注明 / 不另外加糖|179|179–179|官方参考|椰乳已计入|[查看](https://www.lkcoffee.com/products)|
|茉莉花香拿铁|大杯/冰；毫升未注明 / 不另外加糖|76|76–76|官方参考|牛奶、茉莉茶已计入|[查看](https://www.lkcoffee.com/products)|
|拿铁|大杯/热；毫升未注明 / 不另外加糖|268|268–268|官方参考|牛奶已计入|[查看](https://www.lkcoffee.com/products)|
|冰吸生椰拿铁|大杯/冰；毫升未注明 / 不另外加糖|196|196–196|官方参考|椰乳、清凉配方已计入|[查看](https://www.lkcoffee.com/products)|
|小黄油拿铁|大杯/冰；毫升未注明 / 不另外加糖|250|250–250|官方参考|黄油风味基底已计入|[查看](https://www.lkcoffee.com/products)|
|生椰三重奏拿铁|大杯/冰；毫升未注明 / 微甜|470|470–470|官方参考|椰子奶油顶、椰奶冻、椰浆已计入|[查看](https://www.lkcoffee.com/products)|
|轻椰茉莉拿铁|大杯/冰；毫升未注明 / 不另外加糖|120|120–120|官方参考|椰乳、茉莉茶已计入|[查看](https://www.lkcoffee.com/products)|
|丝绒拿铁|大杯/热；毫升未注明 / 不另外加糖|376|376–376|官方参考|丝绒风味厚奶已计入|[查看](https://www.lkcoffee.com/products)|

### 库迪咖啡

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|生椰拿铁|355-591ml（菜单范围；估算按大杯） / 未注明|230|150–360|配料估算|椰乳已计入|[查看](https://www.nckfhsm.com/brands/ku-di-ka-fei/menu/available)|
|潘帕斯蓝椰拿铁|355-591ml（菜单范围；估算按大杯） / 未注明|310|200–470|配料估算|晶球；牛乳、椰浆及调味已计入|[查看](https://www.nckfhsm.com/products/pan-pa-si-lan-ye-na-tie)|
|经典拿铁|355-591ml（菜单范围；估算按大杯） / 不额外加糖（估算选定版本）|200|140–300|配料估算|牛乳已计入|[查看](https://www.nckfhsm.com/products/jing-dian-na-tie-27779)|
|小黄油拿铁|355-591ml（菜单范围；估算按大杯） / 未注明|290|190–430|配料估算|黄油风味基底已计入|[查看](https://www.nckfhsm.com/brands/ku-di-ka-fei/menu/available?page=2)|
|小黄油美式|355-591ml（范围；热量对应杯型未注明） / 未注明|190|170–205|第三方参考|黄油风味基底已计入|[查看](https://www.nckfhsm.com/brands/ku-di-ka-fei/menu/available?page=2)|
|超燃椰青美式|355-591ml（范围；热量对应杯型未注明） / 未注明|95|95–95|第三方参考|椰子水已计入|[查看](https://www.nckfhsm.com/brands/ku-di-ka-fei/menu/available?page=2)|
|茉莉花香拿铁|355-591ml（范围；热量对应杯型未注明） / 未注明|141|141–141|第三方参考|奶基底和茉莉茶已计入|[查看](https://www.nckfhsm.com/brands/ku-di-ka-fei/menu/available?page=2)|
|金奖深烘美式|355-591ml（范围；热量对应杯型未注明） / 不额外加糖（估算选定版本）|10|5–20|配料估算|无|[查看](https://www.nckfhsm.com/brands/ku-di-ka-fei/menu/available?page=4)|

### 幸运咖

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|经典美式|未注明 / 不另外加糖（估算配置）|10|5–20|配料估算|无|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|
|椰椰拿铁|未注明 / 未注明|250|160–390|配料估算|椰乳已计入|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|
|铁观音拿铁|未注明 / 未注明|230|140–340|配料估算|奶、茶咖基底已计入；是否含咖啡待核实|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|
|招牌冰拿铁|未注明 / 未注明|220|130–330|配料估算|牛奶已计入|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|
|全冰醇香拿铁|未注明 / 未注明|170|100–270|配料估算|牛奶已计入|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|
|可可咖啡|未注明 / 未注明|310|200–450|配料估算|可可、牛奶已计入|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|
|可可牛奶|未注明 / 未注明|300|190–440|配料估算|可可、牛奶已计入|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|
|咖啡雪球泡鲁达|未注明 / 未注明|440|290–660|配料估算|雪球及泡鲁达配料按名称假设，待核实|[查看](https://www.nckfhsm.com/brands/xing-yun-ka/menu/available)|

### 挪瓦咖啡

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|花魁SOE美式|未注明 / 不另外加糖（估算配置）|10|5–20|配料估算|无|[查看](https://www.nowwacafe.com/)|
|0脂拿铁|未注明 / 未注明；估算不额外加糖|110|70–190|配料估算|脱脂乳已计入|[查看](https://www.nowwacafe.com/)|
|超模半熟芝士拿铁|未注明 / 未注明|210|130–300|配料估算|低脂芝士乳已计入|[查看](https://www.nowwacafe.com/)|
|吨吨一桶橙C美式|未注明 / 未注明|140|80–260|配料估算|橙果/橙汁已计入|[查看](https://www.nowwacafe.com/)|
|吨吨一桶柚C美式|未注明 / 未注明|140|70–260|配料估算|柚果/柚汁已计入|[查看](https://www.nowwacafe.com/)|
|吨吨桶电解质蓝椰水|未注明 / 未注明|160|90–280|配料估算|椰子水及调味已计入|[查看](https://www.nowwacafe.com/)|
|吨吨桶羽衣甘蓝轻咖|未注明 / 未注明|150|70–280|配料估算|果蔬基底已计入|[查看](https://www.nowwacafe.com/)|
|生椰拿铁|标准杯至吨吨桶450-750ml / 不另外加糖（菜单推荐）|184|184–307|第三方参考|椰乳已计入|[查看](https://www.nckfhsm.com/products/sheng-ye-na-tie-28490)|

### Manner Coffee

|饮品|配置/糖度|参考 kcal|范围 kcal|类型|已含配料|来源|
|---|---|---:|---|---|---|---|
|美式咖啡 Americano|237-355ml（菜单范围） / 不另外加糖（估算配置）|10|5–20|配料估算|无|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available)|
|拿铁咖啡 Latte|237-355ml（菜单范围） / 不另外加糖（估算配置）|160|100–230|配料估算|牛奶已计入|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available)|
|澳式白咖啡 Flat White|237-355ml（菜单范围） / 不另外加糖（估算配置）|130|80–200|配料估算|牛奶已计入|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available)|
|燕麦拿铁|237-355ml（菜单范围） / 不另外加糖（估算配置）|160|100–240|配料估算|燕麦奶已计入|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available)|
|拿铁 埃塞古吉罕贝拉G1日晒|237-355ml（菜单范围） / 不另外加糖（估算配置）|160|100–230|配料估算|牛奶已计入|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available)|
|美式 埃塞古吉罕贝拉G1日晒|355ml（菜单） / 不另外加糖（估算配置）|10|5–20|配料估算|无|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available)|
|埃塞古吉罕贝拉G1日晒Dirty|237ml（菜单） / 未注明|140|90–220|配料估算|乳基底已计入|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available)|
|柚子冰美式|355-473ml（菜单范围） / 未注明|150|80–260|配料估算|柚子基底已计入|[查看](https://www.nckfhsm.com/brands/manner-coffee/menu/available?page=2)|

每行详细估算假设与核实提示见同目录 `part-c.json`。
