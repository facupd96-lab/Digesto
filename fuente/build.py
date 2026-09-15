# -*- coding: utf-8 -*-
head=open('/home/claude/digesto/app/head.html').read()
body=open('/home/claude/digesto/app/body.html').read()
js=open('/home/claude/digesto/app/app.js').read()
corpus=open('/home/claude/digesto/corpus.json').read().replace('</','<\\/')
core=(head+"\n"+body+'\n<script id="corpus" type="application/json">'+corpus+
      '</script>\n<script>\n'+js+'\n</script>\n')
# 1) version para Artifact (sin esqueleto: lo agrega el publicador)
open('/home/claude/digesto/digesto-mostrador.html','w').write(core)
# 2) version autonoma para abrir desde el disco / GitHub Pages
full=('<!doctype html>\n<html lang="es-AR">\n<head>\n<meta charset="utf-8">\n'
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
      '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
      + head + '\n</head>\n<body>\n' + core[len(head):] + '</body>\n</html>\n')
open('/home/claude/digesto/index.html','w').write(full)
print('artifact',len(core),' standalone',len(full))
