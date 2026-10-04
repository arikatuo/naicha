import collections
import json
import pathlib
import re

p = pathlib.Path(__file__).parent
rows = []
for group in 'abcd':
    rows.extend(json.loads((p / f'part-{group}.json').read_text(encoding='utf-8-sig')))
for i, d in enumerate(rows, 1):
    d['id'] = f'D{i:03}'
    d['retrievedAt'] = '2026-10-04'
    if isinstance(d['range'], str):
        nums = re.findall(r'\d+(?:\.\d+)?', d['range'])
        assert len(nums) == 2, d
        d['range'] = [float(n) for n in nums]
    if d['range'] is None:
        d['verifyNote'] += ' 来源未提供范围，未自行补造。'
    else:
        assert len(d['range']) == 2 and d['range'][0] <= d['kcal'] <= d['range'][1], d
    assert isinstance(d['kcal'], (int, float)) and 0 <= d['kcal'] <= 2000, d
    assert d['sourceUrl'].startswith('http'), d
    assert '\ufffd' not in json.dumps(d, ensure_ascii=False), d
    if d['brand'] == '比星咖啡 Bestar':
        d['brand'] = '比星咖啡 BeanStar'
        d['verifyNote'] = d['verifyNote'].replace('此前名单写BEANSTAR；资料显示Bestar/比星，须核实英文名；其余核对杯型、奶品和在售。', '核对杯型、奶品和当前在售。')
        d['verifyNote'] = d['verifyNote'].replace('英文名为Bestar', '第三方目录使用Bestar名称')
        d['verifyNote'] += ' 品牌官方使用BeanStar（https://www.beanstar.com/products）；本条菜单取自Bestar目录，同一品牌与当期在售需核对。'
counts = collections.Counter(d['brand'] for d in rows)
assert len(rows) == 320 and len(counts) == 40 and set(counts.values()) == {8}, counts
assert len(set((d['brand'], d['name']) for d in rows)) == 320
(p / 'drinks.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
summary = {'drinks': len(rows), 'brands': dict(counts), 'evidence': dict(collections.Counter(d['evidenceType'] for d in rows)), 'missingRanges': sum(d['range'] is None for d in rows)}
(p / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(summary, ensure_ascii=True))
