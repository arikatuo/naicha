import glob, re, json, subprocess
import pandas as pd

f = glob.glob('/mnt/user-data/uploads/*.xlsx')[0]
d = pd.read_excel(f, sheet_name='饮品核实表')
t = pd.read_excel(f, sheet_name='小料核实表')

# ---------- 现有 app 数据 ----------
app = json.loads(subprocess.check_output(['node', '-e', """
const root='/home/claude/naicha/';const d=require(root+'data/brand-drinks');const b=require(root+'data/brands');const tp=require(root+'data/toppings');
const n=Object.fromEntries(b.map(x=>[x.id,x.name]));
console.log(JSON.stringify({brands:b.map(x=>x.name),drinks:d.map(x=>({brand:n[x.brandId],name:x.displayName,cal:x.baseCalories})),toppings:tp.map(x=>x.name)}));
"""]))
app_brands = app['brands']
app_drinks = {(x['brand'], x['name']): x['cal'] for x in app['drinks']}

BRAND_ALIAS = {'CoCo都可': 'CoCo'}
TEA_NEW = ['沪上阿姨', '奈雪的茶', '益禾堂', '书亦烧仙草', '茶颜悦色', '乐乐茶', '七分甜', '柠季', 'LINLEE 林里', '快乐柠檬', '阿嬷手作', '爷爷不泡茶']
TEA_DROP = {'茶话弄': '偏地方品牌，门店少', '吾饮良品': '偏地方品牌，门店少', '甜啦啦': '你指定去掉', '冰雪时光': '你指定去掉'}
COFFEE_KEEP = ['星巴克 Starbucks', '瑞幸咖啡', '库迪咖啡', 'Manner Coffee', 'Tims 天好咖啡', '皮爷咖啡 Peet’s Coffee', 'M Stand', 'COSTA 咖世家']
COFFEE_DROP = {'肯悦咖啡 KCOFFEE': '知名度较低', '太平洋咖啡 Pacific Coffee': '知名度较低', 'LAVAZZA 拉瓦萨': '知名度较低', '比星咖啡 BeanStar': '知名度较低', '幸运咖': '你指定去掉', '挪瓦咖啡': '你指定去掉', '麦咖啡 McCafé': '你指定去掉', 'Seesaw Coffee': '你指定去掉'}

def short_brand(b):
    if re.search(r'[\u4e00-\u9fff]', b):
        b2 = re.sub(r'\s*[A-Za-z][A-Za-z\s’\'.é]*$', '', b).strip()
        return b2 or b
    return b

def clean_name(n):
    n = re.sub(r'[（(][^）)]*[）)]', '', n).strip()
    if re.search(r'[\u4e00-\u9fff]', n):
        n = re.sub(r'\s*[A-Za-z][A-Za-z\s]*$', '', n).strip()
    return n

all_brands = list(d['品牌'].unique())
brand_rows = []  # 品牌清单
for b in all_brands:
    app_b = BRAND_ALIAS.get(b, b)
    if app_b in app_brands:
        brand_rows.append((short_brand(b), '奶茶果茶', '已有，保留', ''))
    elif b in TEA_NEW:
        brand_rows.append((short_brand(b), '奶茶果茶', '新增', ''))
    elif b in TEA_DROP:
        brand_rows.append((short_brand(b), '奶茶果茶', '去掉', TEA_DROP[b]))
    elif b in COFFEE_KEEP:
        brand_rows.append((short_brand(b), '咖啡', '新增', ''))
    elif b in COFFEE_DROP:
        brand_rows.append((short_brand(b), '咖啡', '去掉', COFFEE_DROP[b]))
    else:
        raise SystemExit('unclassified brand ' + b)
kind_of = {b: ('咖啡' if (b in COFFEE_KEEP or b in COFFEE_DROP) else '奶茶果茶') for b in all_brands}

# ---------- 饮品筛选 ----------
added, removed = [], []
BLACK_COFFEE_MAX = 15
black_kept = {}
for _, r in d.iterrows():
    b = r['品牌']; name = r['饮品']; kcal = int(r['参考 kcal/杯']); code = r['编号']
    sb = short_brand(b); cn = clean_name(name); app_b = BRAND_ALIAS.get(b, b)
    row = dict(code=code, brand=sb, kind=kind_of[b], raw=name, name=cn, kcal=kcal)
    if b in TEA_DROP or b in COFFEE_DROP:
        row['reason'] = '整个品牌去掉'; removed.append(row); continue
    if '埃塞古吉罕贝拉' in name:
        row['reason'] = '特殊单品豆，不常见'; removed.append(row); continue
    if re.search(r'桶|超大杯', name):
        row['reason'] = '桶装或超大杯等特殊规格'; removed.append(row); continue
    if kcal > 600:
        row['reason'] = '热量超过 600，过于极端'; removed.append(row); continue
    if app_b in app_brands:
        hit = [k for k in app_drinks if k[0] == app_b and (k[1] == cn or k[1] == name)]
        if hit:
            row['reason'] = f"app 已有，保留原值（app {app_drinks[hit[0]]} / Excel {kcal}）"; removed.append(row); continue
    if kind_of[b] == '咖啡' and kcal <= BLACK_COFFEE_MAX:
        if b in black_kept:
            row['reason'] = '同品牌已保留一款黑咖，其余不收'; removed.append(row); continue
        black_kept[b] = True
    row['status'] = '给已有品牌补充' if app_b in app_brands else '新品牌'
    added.append(row)

# 同品牌清洗后重名检查
seen = {}
for r in added:
    key = (r['brand'], r['name'])
    if key in seen: print('DUP after clean', key)
    seen[key] = 1

# ---------- 小料 ----------
TOP = {
 '珍珠/波霸': ('已有', '已有"珍珠/波霸"'), '芋圆': ('已有', '已有"芋圆"'), '粉条': ('已有', '已有"粉条"'), '布丁': ('已有', '已有"布丁"'),
 '椰果': ('已有', '已有"椰果"'), '蒟蒻': ('已有', '已有"蒟蒻/寒天晶球"'), '仙草冻': ('已有', '已有"仙草冻"'), '爱玉冻': ('已有', '已有"爱玉"'),
 '寒天/脆啵啵': ('已有', '已有"寒天""脆波波/爆爆珠"'), '芦荟': ('已有', '已有"芦荟"'), '芝士奶盖': ('已有', '已有"芝士奶盖"'), '西米': ('已有', '已有"西米"'),
 '芋泥': ('已有', '已有"芋泥"'), '蜜红豆': ('已有', '已有"红豆"'), '麻薯/小丸子': ('已有', '已有"白玉丸子"'), '奶冻': ('已有', '已有"奶冻/茶冻/冻冻"'),
 '茶冻/茉莉冻': ('已有', '已有"奶冻/茶冻/冻冻"'),
 '黑糖珍珠': ('新增', '奶茶店常见，和普通珍珠区分'), '冷奶沫/轻乳沫': ('新增', '常见奶沫顶'),
 '额外浓缩咖啡': ('新增（仅咖啡）', '咖啡常见加料'), '普通含糖风味糖浆': ('新增（仅咖啡）', '咖啡常见加料'), '摩卡酱': ('新增（仅咖啡）', '咖啡常见加料'),
 '焦糖淋酱': ('新增（仅咖啡）', '咖啡常见加料'), '打发奶油顶': ('新增（仅咖啡）', '咖啡常见加料'), '燕麦奶额外添加': ('新增（仅咖啡）', '咖啡常见换奶，名称改为"燕麦奶"'),
 '白巧克力摩卡酱': ('去掉', '与摩卡酱重复'), '鲜牛奶额外添加': ('去掉', '不是常见加料'), '淡奶油未打发': ('去掉', '不是常见加料'), '砂糖额外添加': ('去掉', '甜度已由甜度选项处理'),
}
trows = []
for _, r in t.iterrows():
    nm = r['小料或添加项']; st, why = TOP[nm]
    trows.append(dict(code=r['编号'], name=nm, kcal=int(r['参考 kcal/份']), status=st, why=why))

json.dump(dict(brand_rows=brand_rows, added=added, removed=removed, trows=trows), open('curated.json', 'w'), ensure_ascii=False, indent=1)
import collections
print('brands', collections.Counter((k, s) for _, k, s, _ in brand_rows))
print('added', len(added), collections.Counter(r['status'] for r in added), collections.Counter(r['kind'] for r in added))
print('removed', len(removed), collections.Counter(r['reason'].split('（')[0] for r in removed))
print('toppings', collections.Counter(r['status'] for r in trows))
print('final drinks', 64 + len(added), 'final brands', 8 + len([1 for x in brand_rows if x[2] == '新增']))
for r in removed:
    if '整个品牌' not in r['reason']: print('  X', r['brand'], r['raw'], r['kcal'], r['reason'])
