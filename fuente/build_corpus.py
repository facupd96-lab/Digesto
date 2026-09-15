# -*- coding: utf-8 -*-
"""Arma el bundle de datos que consume la app."""
import json, re, unicodedata

D=json.load(open('/home/claude/digesto/digesto.json'))
N=json.load(open('/home/claude/digesto/normas.json'))
A=json.load(open('/home/claude/digesto/aranceles.json'))
AN=json.load(open('/home/claude/digesto/anexos_normas.json'))
C=json.load(open('/home/claude/digesto/correlatividades.json'))


RE_MARK = re.compile(r'^\s*(?:[a-zA-Z]\s*[\)\.]\s|\d{1,3}\s*[\)\.]\s|[IVXivx]{1,5}\s*[\)\.]\s|[\u2022\u00b7\u2013\u2014*-]\s|ANEXO\b|PARTE\b|SECCI|CAP[IÍ]TULO|Art[íi]culo\s)')
def reflow(t):
    """Rearma parrafos partidos por el salto de linea del PDF."""
    if not t: return t
    lines = t.replace('\t','    ').split('\n')
    lens = [len(l.rstrip()) for l in lines if l.strip()]
    if not lens: return t
    thr = max(46, int(max(lens)*0.72))
    out = []
    for l in lines:
        s = l.rstrip()
        if not s.strip():
            if out and out[-1] != '': out.append('')
            continue
        ind = len(s) - len(s.lstrip())
        lvl = '' if ind < 4 else ('    ' if ind < 20 else '        ')
        body = re.sub(r'[ ]{2,}', ' ', s.strip())
        prev = out[-1] if out else ''
        nuevo = (not prev) or prev == '' or RE_MARK.match(s) or len(prev.rstrip()) < thr
        if nuevo: out.append(lvl + body)
        else: out[-1] = prev.rstrip() + ' ' + body
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip()

PDF={'T1':'https://www.dnrpa.gov.ar/nuevodigesto/digesto/Titulo1.pdf',
     'T2':'https://www.dnrpa.gov.ar/nuevodigesto/digesto/Titulo2.pdf'}
ORD=lambda n: f"{n}ª"

units=[]; arbol=[]
for t in D['titulos']:
    tnode={'id':t['id'],'nombre':t['nombre'],'pdf':PDF[t['id']],'caps':[]}
    for c in t['capitulos']:
        cnode={'r':c['romano'],'titulo':c['titulo'],'p':c['pagina'],'secs':[]}
        for s in c['secciones']:
            skey=f"{t['id']}|{c['romano']}|{s['n']}"
            snode={'n':s['n'],'titulo':s['titulo'],'p':s['pagina'],'arts':[],
                   'anexos':[{'r':x['romano'],'p':x['pagina'],'texto':reflow(x['texto'])} for x in s['anexos']],
                   'corr':reflow(C.get(skey,{}).get('texto','')),
                   'corrAnio':C.get(skey,{}).get('ultimo_anio')}
            for a in s['articulos']:
                akey=f"{skey}|{a['n']}"
                cita=(f"{'Título I' if t['id']=='T1' else 'Título II'}, Cap. {c['romano']}"
                      + (f", Secc. {ORD(s['n'])}" if s['n'] else '')
                      + (f" ({a['parte']})" if a.get('parte') else '')
                      + f", art. {a['num']}º")
                u={'id':f"d:{akey}",'tipo':'digesto','cita':cita,'t':t['id'],
                   'cap':c['romano'],'sec':s['n'],'art':a['num'],'p':a['pagina'],
                   'ctit':c['titulo'],'stit':s['titulo'],'parte':a.get('parte'),
                   'texto':reflow(a['texto']),'pdf':PDF[t['id']]+f"#page={a['pagina']}",
                   'corr':reflow(C.get(akey,{}).get('texto','')),
                   'corrAnio':C.get(akey,{}).get('ultimo_anio')}
                units.append(u); snode['arts'].append(u['id'])
            for ai,x in enumerate(s['anexos']):
                acita=(f"{'Título I' if t['id']=='T1' else 'Título II'}, Cap. {c['romano']}"
                       + (f", Secc. {ORD(s['n'])}" if s['n'] else '')
                       + f" — Anexo {x['romano'] or str(ai+1)}")
                au={'id':f"x:{skey}|{ai}",'tipo':'anexo_dig','cita':acita,'t':t['id'],
                    'cap':c['romano'],'sec':s['n'],'p':x['pagina'],
                    'ctit':c['titulo'],'stit':s['titulo'],
                    'texto':reflow(x['texto']),'pdf':PDF[t['id']]+f"#page={x['pagina']}"}
                if len(au['texto'])>40: units.append(au)
            cnode['secs'].append(snode)
        tnode['caps'].append(cnode)
    arbol.append(tnode)

anexos_por_norma={}
for x in AN['anexos_normas']:
    anexos_por_norma.setdefault(x['norma'],[]).append({'titulo':x['titulo'],'texto':x['texto']})

normas=[]
for n in N['normas']:
    nn={'id':n['id'],'nombre':n['nombre'],'desc':n['desc'],'url':n['url'],
        'preambulo':reflow(n['preambulo']),'arts':[],
        'anexos':anexos_por_norma.get(n['id'],[])}
    for a in n['articulos']:
        u={'id':f"n:{n['id']}:{a['num']}",'tipo':'norma','cita':f"{n['nombre']}, art. {a['num']}º",
           'norma':n['id'],'art':a['num'],'texto':reflow(a['texto']),'pdf':n['url']}
        units.append(u); nn['arts'].append(u['id'])
    for i,x in enumerate(nn['anexos']):
        u={'id':f"na:{n['id']}:{i}",'tipo':'anexo','cita':f"{n['nombre']} — {x['titulo']}",
           'norma':n['id'],'texto':reflow(x['texto']),'pdf':n['url']}
        units.append(u)
    normas.append(nn)

ANEXO_NOMBRE={'I':'Automotor','II':'Motovehículos','III':'Maquinaria agrícola, vial e industrial (MAVI)',
              'IV':'Bienes muebles no registrables','V':'Dirección Nacional (sede / RUV)'}
aranceles=[]
for an in A['anexos']:
    a2={'r':an['romano'],'titulo':an['titulo'],'corto':ANEXO_NOMBRE.get(an['romano'],an['titulo']),'cats':[]}
    for c in an['categorias']:
        code=f"Anexo {an['romano']} — arancel {c['n']}"
        a2['cats'].append({'n':c['n'],'nombre':c['categoria'],'valores':c['valores'],'tramites':reflow(c['tramites'])})
        units.append({'id':f"a:{an['romano']}:{c['n']}",'tipo':'arancel',
            'cita':f"Resol. MJ 412/2026, Anexo {an['romano']} ({ANEXO_NOMBRE.get(an['romano'],'')}), arancel {c['n']} — {c['categoria']}",
            'texto': c['categoria']+'\n'+ '\n'.join(f"{v['letra']}: {v['valor']}" for v in c['valores']) + '\n' + reflow(c['tramites']),
            'pdf':''})
    aranceles.append(a2)

def norm(s):
    s=unicodedata.normalize('NFD', s.lower())
    s=''.join(ch for ch in s if unicodedata.category(ch)!='Mn')
    return re.sub(r'[^a-z0-9ñ\s]+',' ', s)

fichas=json.load(open('/home/claude/digesto/fichas.json'))
tramites=json.load(open('/home/claude/digesto/tramites.json'))
reglas=json.load(open('/home/claude/digesto/reglas.json'))
guias=json.load(open('/home/claude/digesto/guias.json'))
ORDEN=['transferencia','oficios','motor','documentos','sucesion','denuncia','baja','firmas','verificacion','prenda','inicial','radicacion','cobranza']
tramites=sorted(tramites,key=lambda x:ORDEN.index(x['k']) if x['k'] in ORDEN else 99)
for _f in fichas: _f.pop('cobro_largo', None)
bundle={'generado':'2026-09-10','arbol':arbol,'normas':normas,'aranceles':aranceles,'fichas':fichas,'tramites':tramites,'reglas':reglas,'guias':guias,
        'units':units,
        'meta':{'articulos_digesto':sum(1 for u in units if u['tipo']=='digesto'),
                'anexos_digesto':sum(1 for u in units if u['tipo']=='anexo_dig'),
                'articulos_norma':sum(1 for u in units if u['tipo']=='norma'),
                'correl_claves':len(C),'fichas':len(fichas),'reglas':len(reglas),'guias':len(guias)}}
out=json.dumps(bundle, ensure_ascii=False, separators=(',',':'))
open('/home/claude/digesto/corpus.json','w').write(out)
print('unidades:',len(units),' bytes:',len(out))
print(bundle['meta'])
