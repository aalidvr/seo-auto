import json,pathlib,sys
r=pathlib.Path(__file__).resolve().parents[1]
files=list((r/'workflows').glob('*.json'))
for f in files:
 d=json.loads(f.read_text());names=[n['name'] for n in d['nodes']];assert len(names)==len(set(names)),f
 for source,conn in d['connections'].items():
  assert source in names,(f,source)
  for outputs in conn.get('main',[]):
   for edge in outputs: assert edge['node'] in names,(f,edge)
 assert d['active'] is False
print('PASS: JSON syntax and connection names for',len(files),'workflows. No runtime validation performed.')
