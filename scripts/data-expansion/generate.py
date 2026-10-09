import json, re, glob
import pandas as pd
c = json.load(open('curated.json'))
xl = pd.read_excel(glob.glob('/mnt/user-data/uploads/*.xlsx')[0], sheet_name='饮品核实表')
tp = pd.read_excel(glob.glob('/mnt/user-data/uploads/*.xlsx')[0], sheet_name='小料核实表')
default_top = {r['编号']: (r['默认自带小料'] if isinstance(r['默认自带小料'], str) else '') for _, r in xl.iterrows()}

BRAND_ID = {'蜜雪冰城':'mixue','霸王茶姬':'chagee','喜茶':'heytea','茶百道':'chabaidao','古茗':'guming','一点点':'yidiandian','CoCo都可':'coco','茉莉奶白':'molimilk',
 '沪上阿姨':'hushang','奈雪的茶':'naixue','益禾堂':'yihetang','书亦烧仙草':'shuyi','茶颜悦色':'chayan','乐乐茶':'lelecha','七分甜':'qifentian','柠季':'ningji','LINLEE 林里':'linlee','快乐柠檬':'happylemon','阿嬷手作':'amashouzuo','爷爷不泡茶':'yeye',
 '星巴克':'starbucks','瑞幸咖啡':'luckin','库迪咖啡':'cotti','Manner Coffee':'manner','Tims 天好咖啡':'tims','皮爷咖啡':'peets','M Stand':'mstand','COSTA 咖世家':'costa'}
NEW_BRANDS = [  # id, name, shortName, subtitle, category
 ('hushang','沪上阿姨','沪上阿姨','鲜果茶、血糯米','tea'),
 ('naixue','奈雪的茶','奈雪','霸气水果茶、软欧','tea'),
 ('yihetang','益禾堂','益禾堂','烤奶、柠檬茶','tea'),
 ('shuyi','书亦烧仙草','书亦','烧仙草专门店','tea'),
 ('chayan','茶颜悦色','茶颜','新中式、幽兰拿铁','tea'),
 ('lelecha','乐乐茶','乐乐茶','脏脏茶、酪酪','tea'),
 ('qifentian','七分甜','七分甜','杨枝甘露、芭乐','tea'),
 ('ningji','柠季','柠季','手打柠檬茶','tea'),
 ('linlee','LINLEE 林里','林里','手打柠檬茶','tea'),
 ('happylemon','快乐柠檬','快乐柠檬','岩盐芝士、柠檬茶','tea'),
 ('amashouzuo','阿嬷手作','阿嬷','芋圆、手作甜品茶','tea'),
 ('yeye','爷爷不泡茶','爷爷','新中式鲜果茶','tea'),
 ('starbucks','星巴克','星巴克','全球连锁咖啡','coffee'),
 ('luckin','瑞幸咖啡','瑞幸','生椰拿铁','coffee'),
 ('cotti','库迪咖啡','库迪','平价咖啡','coffee'),
 ('manner','Manner','Manner','精品平价咖啡','coffee'),
 ('tims','Tims 天好','Tims','燕麦拿铁、冷萃','coffee'),
 ('peets','皮爷咖啡','皮爷','精品烘焙咖啡','coffee'),
 ('mstand','M Stand','M Stand','燕麦拿铁、冷萃','coffee'),
 ('costa','COSTA','COSTA','英式咖啡','coffee'),
]
coffee_ids = {b[0] for b in NEW_BRANDS if b[4]=='coffee'}

def tags_for(brand_id, name, kcal):
    if brand_id in coffee_ids:
        if kcal <= 15 or ('美式' in name or '冷萃' in name) and '拿铁' not in name:
            return ['coffee','black-coffee']
        if re.search('拿铁|卡布|玛奇朵|馥芮白|澳白|摩卡|牛奶|奶铁|丝慕白|可可|雪球|白咖', name):
            return ['coffee','latte']
        return ['coffee']
    out=[]
    milk = re.search('奶茶|奶绿|牛乳|乳茶|烤奶|奶青|奶白|拿铁|奶昔|可可|阿华田|欧蕾|牛奶|奶冰|冰奶|豆乳|酸奶|奶油|椰乳|奶芙|养乐多', name)
    if re.search('芝士|奶盖|芝芝|岩盐|咸法酪|酪酪|奶酪', name): out.append('milk-foam')
    if milk: out.append('milk-tea')
    if re.search('柠|橙|柚|桃|莓|葡萄|芒|西瓜|百香|苹果|芭乐|柑|橘|果|椰|荔枝|杨枝甘露|甘露|油柑|菠萝|无花果|山楂|龙眼|栀子椰', name): out.append('fruit')
    if re.search('珍珠|波波|波霸|芋圆|芋泥|布丁|烧仙草|西米|椰果|脏脏|全家福|碎碎冰|麻薯|冻|河粉|血糯米', name): out.append('toppings')
    if kcal >= 420 and milk: out.append('thick-milk')
    if kcal <= 230 and not milk and 'milk-foam' not in out: out.append('fresh')
    return (out or ['classic'])[:3]

TOP_MAP = [('珍珠|波波|波霸','pearl'),('芋圆','taro-ball'),('芋泥','taro'),('布丁','pudding'),('椰果','coconut-jelly'),('仙草','grass-jelly'),('西米','sago'),('奶盖|芝士','milk-foam'),('红豆','red-bean'),('麻薯|丸子','rice-ball'),('冰淇淋|雪顶','ice-cream')]
def default_toppings(code, tags):
    txt = default_top.get(code, '')
    ids = []
    for pat, tid in TOP_MAP:
        if re.search(pat, txt) and tid not in ids: ids.append(tid)
    return ids[:3]

lines = []
per_brand = {}
for r in c['added']:
    bid = None
    # map short brand -> excel brand id: r['brand'] is short_brand(b)
    for k, v in BRAND_ID.items():
        sb = re.sub(r'\s*[A-Za-z][A-Za-z\s’\'.é]*$', '', k).strip() if re.search(r'[\u4e00-\u9fff]', k) else k
        if sb == r['brand'] or k == r['brand'] or (k=='CoCo都可' and r['brand']=='CoCo都可'):
            bid = v; break
    assert bid, r['brand']
    tg = tags_for(bid, r['name'], r['kcal'])
    dt = default_toppings(r['code'], tg)
    per_brand.setdefault(bid, 0); per_brand[bid] += 1
    lines.append(f"  d({json.dumps(bid)}, {json.dumps(r['code'])}, {json.dumps(r['name'], ensure_ascii=False)}, {r['kcal']}, {json.dumps(tg)}, {json.dumps(dt)}),")

header = '''// 由 40品牌饮品与小料热量_核实稿.xlsx 筛选生成（见 docs/data-expansion.md）。
// 热量为 Excel 里的参考值，按「中杯、五分糖」计；大杯按杯型系数放大。
const SOURCE_NOTE = '40品牌饮品与小料热量_核实稿.xlsx';

function d(brandId, code, displayName, calories, tagIds, defaultToppingIds = []) {
  const coffee = tagIds.includes('coffee');
  return {
    id: `${brandId}-${code.toLowerCase()}`,
    brandId,
    displayName,
    aliasName: '',
    baseCalories: calories,
    sizeCalories: null,
    defaultSize: 'medium',
    availableSizes: ['medium', 'large'],
    defaultSweetness: 'half',
    sweetnessAdjustable: !coffee,
    sweetnessCalorieImpact: coffee ? 'low' : 'medium',
    defaultToppingIds,
    tagIds,
    sourceType: 'excel_reference',
    sourceNote: SOURCE_NOTE
  };
}

module.exports = [
'''
open('/home/claude/naicha/data/extra-drinks.js','w').write(header + '\n'.join(lines) + '\n];\n')

# brands.js
bp='/home/claude/naicha/data/brands.js'; s=open(bp).read()
if 'category' not in s:
    s=re.sub(r"(subtitle: '[^']*', sort: \d+) \}", r"\1, category: 'tea' }", s)
    add=[]
    for i,(bid,name,short,sub,cat) in enumerate(NEW_BRANDS, start=9):
        add.append(f"  {{ id: '{bid}', name: '{name}', shortName: '{short}', logo: '', subtitle: '{sub}', sort: {i}, category: '{cat}' }}")
    s=s.rstrip().rstrip('];').rstrip()  # drop closing
    s=s+',\n'+',\n'.join(add)+'\n];\n'
    open(bp,'w').write(s)

# brand-drinks.js
dp='/home/claude/naicha/data/brand-drinks.js'; s=open(dp).read()
if 'extra-drinks' not in s:
    s=s.replace('module.exports = [','const baseDrinks = [',1)
    s=s.rstrip()
    assert s.endswith('];')
    s=s+"\n\nmodule.exports = baseDrinks.concat(require('./extra-drinks'));\n"
    open(dp,'w').write(s)

# tags.js
tp_path='/home/claude/naicha/data/tags.js'; s=open(tp_path).read()
if 'black-coffee' not in s:
    s=s.rstrip().rstrip('];').rstrip()
    s+=",\n  { id: 'coffee', name: '咖啡', icon: '/assets/icons/drinks/coffee-float.png' },\n  { id: 'latte', name: '奶咖', icon: '/assets/icons/drinks/coffee-float.png' },\n  { id: 'black-coffee', name: '黑咖', icon: '/assets/icons/americano.png' }\n];\n"
    open(tp_path,'w').write(s)

# toppings.js
kc = {r['小料或添加项']: int(r['参考 kcal/份']) for _, r in tp.iterrows()}
ts='/home/claude/naicha/data/toppings.js'; s=open(ts).read()
if 'extra-shot' not in s:
    s=s.rstrip().rstrip('];').rstrip()
    new=[("brown-pearl","黑糖珍珠",kc['黑糖珍珠'],None),("cold-foam","冷奶沫",kc['冷奶沫/轻乳沫'],None),
         ("extra-shot","额外浓缩",kc['额外浓缩咖啡'],'coffee'),("syrup","糖浆",kc['普通含糖风味糖浆'],'coffee'),("mocha-sauce","摩卡酱",kc['摩卡酱'],'coffee'),
         ("caramel-sauce","焦糖淋酱",kc['焦糖淋酱'],'coffee'),("whipped-cream","打发奶油顶",kc['打发奶油顶'],'coffee'),("oat-milk","燕麦奶",kc['燕麦奶额外添加'],'coffee')]
    s+=''.join(f",\n  {{ id: '{i}', name: '{n}', calories: {k}{(', scope: ' + repr(sc)) if sc else ''} }}" for i,n,k,sc in new)+"\n];\n"
    open(ts,'w').write(s)
print(per_brand, len(lines)); print(kc)
