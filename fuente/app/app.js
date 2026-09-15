'use strict';
/* ------------------------------------------------------------------ datos */
var DATA = JSON.parse(document.getElementById('corpus').textContent);
var UNITS = DATA.units;
var BYID = {}; for (var i=0;i<UNITS.length;i++) BYID[UNITS[i].id] = UNITS[i];
var FICHAS = DATA.fichas;
var TRAMITES = DATA.tramites;
var TRNAME = {}; TRAMITES.forEach(function(t){ TRNAME[t.k] = t.n; });

/* ------------------------------------------------------------------ utils */
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function norm(s){
  return String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'')
    .toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim();
}
var STOP = {'de':1,'la':1,'el':1,'en':1,'y':1,'a':1,'los':1,'las':1,'del':1,'se':1,'un':1,'una':1,
  'por':1,'con':1,'que':1,'para':1,'es':1,'al':1,'lo':1,'o':1,'como':1,'cuando':1,'cual':1,'cuales':1,
  'si':1,'me':1,'le':1,'mi':1,'su':1,'hay':1,'ser':1,'tengo':1,'tiene':1,'debe':1,'qué':1,'que':1};
function toks(s){
  return norm(s).split(' ').filter(function(t){ return t.length>2 && !STOP[t]; });
}
function el(id){ return document.getElementById(id); }
function on(node, sel, fn){
  node.addEventListener('click', function(ev){
    var t = ev.target.closest(sel); if (t && node.contains(t)) fn(t, ev);
  });
}

/* --------------------------------------------------------- índice fichas  */
var FIDX = FICHAS.map(function(f){
  return {
    f: f,
    pg: norm(f.pregunta),
    sn: norm((f.sinonimos||[]).join(' ')),
    ve: norm(f.veredicto||''),
    cu: norm([f.respuesta, f.ojo, f.arancel, f.grupo, TRNAME[f.tramite]||'',
              f.cobro ? [f.cobro.base].concat(f.cobro.incluye||[],f.cobro.sumar||[],f.cobro.sacar||[]).join(' ') : ''
             ].join(' '))
  };
});
function buscarFichas(q, limite){
  var ts = toks(q); if (!ts.length) return [];
  var out = [];
  for (var i=0;i<FIDX.length;i++){
    var x = FIDX[i], s = 0, hit = 0;
    for (var j=0;j<ts.length;j++){
      var t = ts[j], h = 0;
      if (x.pg.indexOf(t) >= 0){ s += 7; h = 1; }
      if (x.sn.indexOf(t) >= 0){ s += 5; h = 1; }
      if (x.ve.indexOf(t) >= 0){ s += 3; h = 1; }
      if (x.cu.indexOf(t) >= 0){ s += 2; h = 1; }
      hit += h;
    }
    if (!s) continue;
    s = s * (1 + hit / ts.length);           // premia cubrir toda la consulta
    if (hit === ts.length) s += 12;
    out.push({ f: x.f, s: s });
  }
  out.sort(function(a,b){ return b.s - a.s; });
  var corte = out.length ? out[0].s * 0.45 : 0;   // corta la cola de resultados flojos
  out = out.filter(function(x){ return x.s >= corte; });
  return out.slice(0, limite || 12);
}

/* --------------------------------------------------------- índice digesto */
var UIDX = null;
function idxUnits(){
  if (UIDX) return UIDX;
  UIDX = UNITS.map(function(u){ return { u: u, c: norm(u.cita), x: norm(u.texto) }; });
  return UIDX;
}
function buscarUnits(q, tipo, limite){
  var ts = toks(q); if (!ts.length) return [];
  var ix = idxUnits(), out = [];
  for (var i=0;i<ix.length;i++){
    var e = ix[i];
    if (tipo && tipo !== 'todo'){
      if (tipo === 'digesto' && e.u.tipo !== 'digesto' && e.u.tipo !== 'anexo_dig') continue;
      if (tipo === 'norma' && e.u.tipo !== 'norma' && e.u.tipo !== 'anexo') continue;
      if (tipo === 'arancel' && e.u.tipo !== 'arancel') continue;
    }
    var s = 0, hit = 0;
    for (var j=0;j<ts.length;j++){
      var t = ts[j], h = 0;
      if (e.c.indexOf(t) >= 0){ s += 4; h = 1; }
      var k = e.x.indexOf(t);
      if (k >= 0){ s += 2; h = 1; if (k < 220) s += 1; }
      hit += h;
    }
    if (!s || hit < ts.length) continue;
    out.push({ u: e.u, s: s });
  }
  out.sort(function(a,b){ return b.s - a.s; });
  return out.slice(0, limite || 60);
}
function recorte(texto, q){
  var ts = toks(q), n = norm(texto), p = -1;
  for (var i=0;i<ts.length && p<0;i++) p = n.indexOf(ts[i]);
  if (p < 0) p = 0;
  var a = Math.max(0, p - 90);
  return (a>0?'… ':'') + texto.slice(a, a + 240).replace(/\s+/g,' ') + (texto.length > a+240 ? ' …' : '');
}

/* ------------------------------------------------------------ navegación  */
var VIEWS = ['inicio','tramites','tramite','ficha','digesto','articulo','nosotros'];
var RAIL = { inicio:'inicio', tramites:'tramites', tramite:'tramites', ficha:'tramites',
             digesto:'digesto', articulo:'digesto', nosotros:'nosotros' };
var pila = [];
function ir(v, arg, sinPila){
  if (!sinPila && estado.v) pila.push({ v: estado.v, a: estado.a });
  estado = { v: v, a: arg };
  VIEWS.forEach(function(n){ el('v-'+n).hidden = (n !== v); });
  document.querySelectorAll('.rail button[data-view]').forEach(function(b){
    b.setAttribute('aria-current', b.dataset.view === RAIL[v] ? 'true' : 'false');
  });
  ({ inicio:vInicio, tramites:vTramites, tramite:vTramite, ficha:vFicha,
     digesto:vDigesto, articulo:vArticulo, nosotros:vNosotros })[v](arg);
  window.scrollTo(0,0);
}
function volver(){
  var p = pila.pop();
  if (p) ir(p.v, p.a, true); else ir('inicio', null, true);
}
var estado = { v: null, a: null };

/* --------------------------------------------------------------- INICIO   */
var DESTACADAS = [
  'certificaciones-firma-incluidas-transferencia',
  'pedido-y-consulta-de-legajo-se-cobra',
  'oficios-judiciales-exentos-de-arancel',
  'cambio-de-motor-que-se-presenta-y-como-se-cobra',
  'verificacion-transferencia-desde-que-fecha',
  'sucesion-como-entra-el-tramite-y-quien-firma',
  'asentimiento-conyugal-transferencia',
  'baja-del-automotor-causales-y-procedimiento'
].map(function(id){ return FICHAS.find(function(f){ return f.id === id; }); }).filter(Boolean);

function vInicio(){
  var v = el('v-inicio');
  v.innerHTML =
    '<div class="ask">' +
      '<label for="q">Preguntá lo que necesites del mostrador</label>' +
      '<div class="row"><input id="q" type="search" autocomplete="off" spellcheck="false" ' +
        'placeholder="Ej.: cuántas firmas entran en una transferencia"></div>' +
      '<p class="hint">Escribí con tus palabras. Si no aparece nada, probá con una palabra sola: ' +
      '<b>legajo</b>, <b>embargo</b>, <b>motor</b>, <b>sucesión</b>, <b>mora</b>.</p>' +
    '</div>' +
    '<div id="qres"></div>' +
    '<div id="qhome">' +
      '<p class="eyebrow" style="margin-top:30px">Las que más se preguntan</p>' +
      '<div class="stack">' + DESTACADAS.map(botonFicha).join('') + '</div>' +
      '<p class="eyebrow" style="margin-top:30px">O entrá por el trámite</p>' +
      '<div class="tiles">' + TRAMITES.slice(0,6).map(tejaTramite).join('') +
      '<button class="tile" data-goto="tramites"><span class="t">Ver los ' + TRAMITES.length + ' trámites</span>' +
      '<span class="c">Todo el listado</span></button></div>' +
    '</div>';

  var inp = el('q'), res = el('qres'), home = el('qhome'), tmr = null;
  inp.addEventListener('input', function(){
    clearTimeout(tmr); tmr = setTimeout(function(){ pintar(inp.value); }, 110);
  });
  inp.addEventListener('keydown', function(ev){
    if (ev.key === 'Enter'){ ev.preventDefault(); clearTimeout(tmr); pintar(inp.value); }
  });
  function pintar(q){
    if (norm(q).length < 3){ res.innerHTML = ''; home.hidden = false; return; }
    home.hidden = true;
    var r = buscarFichas(q, 10);
    if (!r.length){
      var d = buscarUnits(q, 'todo', 6);
      res.innerHTML = '<div class="card" style="padding:22px;margin-top:18px">' +
        '<p style="font-size:17px"><b>No tengo una ficha para eso todavía.</b></p>' +
        (d.length
          ? '<p class="note" style="margin-top:8px">Pero aparece en el texto oficial:</p><div class="res">' +
            d.map(function(x){ return '<button data-art="' + esc(x.u.id) + '"><span class="ct">' +
              esc(x.u.cita) + '</span><span class="sp">' + esc(recorte(x.u.texto,q)) + '</span></button>'; }).join('') +
            '</div>'
          : '<p class="note" style="margin-top:8px">Tampoco aparece en el texto oficial cargado. Probá con otra palabra.</p>') +
        '<div class="rowbtns"><button class="btn ghost" data-anotar="' + esc(q) + '">Anotar esta pregunta como pendiente</button></div>' +
        '</div>';
      return;
    }
    var clara = r.length === 1 || r[0].s >= r[1].s * 1.6;
    var resto = clara ? r.slice(1) : r;
    res.innerHTML =
      (clara ? '<p class="eyebrow" style="margin-top:22px">La respuesta</p>' + fichaHTML(r[0].f, 'margin-top:10px') : '') +
      (resto.length
        ? '<p class="eyebrow" style="margin-top:26px">' + (clara ? 'También podría ser esto' : r.length + ' respuestas posibles') + '</p>' +
          '<div class="stack">' + resto.map(function(x){ return botonFicha(x.f); }).join('') + '</div>'
        : '') +
      '<div class="rowbtns"><button class="btn ghost" data-digesto="' + esc(q) + '">Buscar «' + esc(q) + '» en el Digesto</button>' +
      (clara ? '<button class="btn ghost" data-ficha="' + esc(r[0].f.id) + '">Abrir esta ficha sola</button>' : '') + '</div>';
  }
  inp.focus();
}
function botonFicha(f){
  return '<button class="qbtn" data-ficha="' + esc(f.id) + '"><span class="ar">→</span>' +
    '<span>' + esc(f.pregunta) + '<br><span class="tg">' + esc(TRNAME[f.tramite] || f.grupo) + '</span></span></button>';
}
function tejaTramite(t){
  var n = FICHAS.filter(function(f){ return f.tramite === t.k; }).length;
  return '<button class="tile" data-tramite="' + esc(t.k) + '"><span class="t">' + esc(t.n) + '</span>' +
    '<span class="c">' + n + (n === 1 ? ' respuesta' : ' respuestas') + '</span></button>';
}

/* -------------------------------------------------------------- TRÁMITES  */
function vTramites(){
  el('v-tramites').innerHTML =
    '<p class="eyebrow">Trámites</p>' +
    '<h2 style="font-size:26px;margin-top:4px">Elegí el trámite que tenés en el mostrador</h2>' +
    '<p class="lede">Adentro de cada uno están las preguntas concretas: qué se pide, qué se cobra y qué hay que sacar o sumar en el sistema.</p>' +
    '<div class="tiles">' + TRAMITES.map(tejaTramite).join('') + '</div>';
}
function vTramite(k){
  var t = TRAMITES.find(function(x){ return x.k === k; }) || { k: k, n: k };
  var fs = FICHAS.filter(function(f){ return f.tramite === k; });
  el('v-tramite').innerHTML =
    '<button class="btn ghost" data-volver>← Volver</button>' +
    '<p class="eyebrow" style="margin-top:20px">Trámite</p>' +
    '<h2 style="font-size:26px;margin-top:4px">' + esc(t.n) + '</h2>' +
    '<p class="lede">' + fs.length + (fs.length === 1 ? ' pregunta resuelta' : ' preguntas resueltas') + ' con el artículo que la respalda.</p>' +
    '<div class="stack">' + fs.map(botonFicha).join('') + '</div>';
}

/* ---------------------------------------------------------------- FICHA   */
function vFicha(id){
  var f = FICHAS.find(function(x){ return x.id === id; });
  if (!f){ ir('inicio', null, true); return; }
  el('v-ficha').innerHTML =
    '<button class="btn ghost" data-volver>← Volver</button>' +
    fichaHTML(f, 'margin-top:18px') +
    '<div class="rowbtns"><button class="btn ghost" data-imprimir>Imprimir esta ficha</button>' +
    '<button class="btn ghost" data-anotar="' + esc(f.pregunta) + '">Anotar una corrección</button></div>';
}
function fichaHTML(f, estilo){
  var c = f.cobro || {}, h = '';
  h += '<article class="ficha" style="' + (estilo || '') + '">';
  h += '<div class="hd"><div class="tg">' + esc(TRNAME[f.tramite] || f.grupo) +
       (f.fuente_curso ? '<span class="curso">del curso</span>' : '') + '</div>' +
       '<p class="pg">' + esc(f.pregunta) + '</p></div>';
  h += '<div class="ver">' + esc(f.veredicto || '') + '</div>';

  var tieneCobro = (c.base && c.base.trim()) || (c.incluye||[]).length || (c.sumar||[]).length || (c.sacar||[]).length;
  if (tieneCobro){
    h += '<div class="blk"><h4>En la caja</h4>';
    if (c.base && c.base.trim()) h += '<div class="cg"><div class="ct">Sobre qué se calcula</div><p class="tx" style="font-size:15.5px">' + esc(c.base) + '</p></div>';
    if ((c.incluye||[]).length) h += grupoCobro('inc','Ya viene incluido — no lo cobres aparte', c.incluye);
    if ((c.sumar||[]).length)   h += grupoCobro('sum','Hay que sumarlo', c.sumar);
    if ((c.sacar||[]).length)   h += grupoCobro('sac','Hay que sacarlo del sistema', c.sacar);
    h += '</div>';
  }
  if (f.ojo) h += '<div class="blk oj"><h4>Ojo con esto</h4><p class="tx">' + esc(f.ojo) + '</p></div>';

  h += '<details class="mas"><summary>Ver la explicación y los artículos</summary><div class="inner">';
  h += '<p class="detalle">' + esc(f.respuesta) + '</p>';
  if (f.arancel) h += '<div class="box"><h4>Arancel</h4><p class="tx">' + esc(f.arancel) + '</p></div>';
  if ((f.fundamento||[]).length){
    h += '<p class="eyebrow" style="margin:20px 0 10px">En qué se basa</p>';
    f.fundamento.forEach(function(x){
      var existe = !!BYID[x.id];
      h += '<div class="fu">' +
        (existe ? '<button data-art="' + esc(x.id) + '">' + esc(x.cita) + ' →</button>'
                : '<span class="mono" style="font-size:13.5px;color:var(--ink-3)">' + esc(x.cita) + '</span>') +
        '<p class="d">' + esc(x.dice) + '</p></div>';
    });
  }
  if (f.sin_respaldo) h += '<p class="reserva"><b>Reserva:</b> ' + esc(f.sin_respaldo) + '</p>';
  h += '</div></details>';
  h += '</article>';
  return h;
}
function grupoCobro(cls, titulo, items){
  return '<div class="cg ' + cls + '"><div class="ct">' + esc(titulo) + '</div><ul>' +
    items.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
}

/* --------------------------------------------------------------- DIGESTO  */
var dq = '', dtipo = 'todo';
function vDigesto(preset){
  if (typeof preset === 'string'){ dq = preset; }
  var v = el('v-digesto');
  v.innerHTML =
    '<p class="eyebrow">Texto oficial</p>' +
    '<h2 style="font-size:26px;margin-top:4px">El Digesto, la normativa superior y los aranceles</h2>' +
    '<p class="lede">Buscá una palabra y te lleva al artículo, o bajá y navegá por capítulos.</p>' +
    '<div style="margin-top:18px"><input id="dq" type="search" autocomplete="off" spellcheck="false" ' +
      'placeholder="Buscar en el texto oficial…" value="' + esc(dq) + '"></div>' +
    '<div class="chips" style="margin-top:10px" id="dfil">' +
      [['todo','Todo'],['digesto','Digesto'],['norma','Normativa superior'],['arancel','Aranceles']]
        .map(function(x){ return '<button data-tipo="' + x[0] + '"' +
          (dtipo===x[0]?' style="background:var(--accent);color:var(--accent-ink);border-color:var(--accent)"':'') +
          '>' + x[1] + '</button>'; }).join('') +
    '</div>' +
    '<div id="dres"></div>' +
    '<div id="dnav"></div>';

  var inp = el('dq'), tmr = null;
  inp.addEventListener('input', function(){ clearTimeout(tmr); tmr = setTimeout(dPintar, 130); });
  el('dfil').addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-tipo]'); if (!b) return;
    dtipo = b.dataset.tipo;
    el('dfil').querySelectorAll('button').forEach(function(x){ x.removeAttribute('style'); });
    b.style.cssText = 'background:var(--accent);color:var(--accent-ink);border-color:var(--accent)';
    dPintar();
  });
  dPintar();
  if (preset) inp.focus();
}
function dPintar(){
  var inp = el('dq'); dq = inp ? inp.value : dq;
  var res = el('dres'), nav = el('dnav');
  if (norm(dq).length < 3){ res.innerHTML = ''; nav.innerHTML = arbolHTML(); return; }
  nav.innerHTML = '';
  var r = buscarUnits(dq, dtipo, 60);
  if (!r.length){
    res.innerHTML = '<div class="empty">No encontré esa palabra en el texto cargado.</div>';
    return;
  }
  res.innerHTML = '<p class="eyebrow" style="margin-top:18px">' + r.length +
    (r.length === 60 ? '+ resultados' : (r.length === 1 ? ' resultado' : ' resultados')) + '</p>' +
    '<div class="res">' + r.map(function(x){
      return '<button data-art="' + esc(x.u.id) + '"><span class="ct">' + esc(x.u.cita) + '</span>' +
        '<span class="sp">' + esc(recorte(x.u.texto, dq)) + '</span></button>'; }).join('') + '</div>';
}
function arbolHTML(){
  var h = '<p class="eyebrow" style="margin-top:26px">Digesto de Normas Técnico-Registrales</p>';
  DATA.arbol.forEach(function(t){
    h += '<details class="acc"><summary>' + esc(t.nombre) + '<span class="cnt">' + t.caps.length + ' cap.</span></summary>';
    t.caps.forEach(function(c){
      var n = c.secs.reduce(function(a,s){ return a + s.arts.length; }, 0);
      h += '<details class="acc" style="margin:0;border:0;border-top:1px solid var(--line);border-radius:0">' +
           '<summary style="padding-left:30px;font-size:15.5px">Cap. ' + esc(c.r) + ' — ' + esc(c.titulo) +
           '<span class="cnt">' + n + '</span></summary>';
      c.secs.forEach(function(s){
        h += '<div class="sec"><div class="sh">' + (s.n ? 'Secc. ' + s.n + 'ª — ' : '') + esc(s.titulo) + '</div><div class="chips">';
        s.arts.forEach(function(id){
          var u = BYID[id]; if (!u) return;
          h += '<button data-art="' + esc(id) + '">art. ' + esc(u.art) + '</button>';
        });
        var ai = 0;
        (s.anexos||[]).forEach(function(x){
          var xid = 'x:' + t.id + '|' + c.r + '|' + s.n + '|' + ai; ai++;
          if (BYID[xid]) h += '<button data-art="' + esc(xid) + '">Anexo ' + esc(x.r || ai) + '</button>';
        });
        h += '</div></div>';
      });
      h += '</details>';
    });
    h += '</details>';
  });

  h += '<p class="eyebrow" style="margin-top:30px">Normativa superior</p>';
  DATA.normas.forEach(function(n){
    h += '<details class="acc"><summary>' + esc(n.nombre) + '<span class="cnt">' + n.arts.length + ' art.</span></summary>' +
         '<div class="sec"><p class="note" style="margin-bottom:9px">' + esc(n.desc) + '</p><div class="chips">';
    n.arts.forEach(function(id){
      var u = BYID[id]; if (!u) return;
      h += '<button data-art="' + esc(id) + '">art. ' + esc(u.art) + '</button>';
    });
    (n.anexos||[]).forEach(function(x, i){
      var xid = 'na:' + n.id + ':' + i;
      if (BYID[xid]) h += '<button data-art="' + esc(xid) + '">' + esc(x.titulo) + '</button>';
    });
    h += '</div><p class="note" style="margin-top:10px"><a href="' + esc(n.url) + '" target="_blank" rel="noopener">Ver el texto en argentina.gob.ar</a></p></div></details>';
  });

  h += '<p class="eyebrow" style="margin-top:30px">Aranceles — Resolución MJ 412/2026</p>' +
       '<p class="note" style="margin-top:5px">El texto de cada arancel, tal como está en la Resolución. Los importes en pesos te los da SURA.</p>';
  DATA.aranceles.forEach(function(a){
    h += '<details class="acc"><summary>Anexo ' + esc(a.r) + ' — ' + esc(a.corto) +
         '<span class="cnt">' + a.cats.length + '</span></summary><div class="sec"><div class="chips">';
    a.cats.forEach(function(c){
      h += '<button data-art="a:' + esc(a.r) + ':' + c.n + '">' + c.n + '. ' + esc(c.nombre) + '</button>';
    });
    h += '</div></div></details>';
  });
  return h;
}

/* -------------------------------------------------------------- ARTÍCULO  */
function vArticulo(id){
  var u = BYID[id];
  if (!u){ ir('digesto', null, true); return; }
  var h = '<button class="btn ghost" data-volver>← Volver</button>' +
    '<div class="art" style="margin-top:20px"><div class="head"><h2>' + esc(u.cita) + '</h2>';
  var ctx = [];
  if (u.ctit) ctx.push(u.ctit);
  if (u.stit) ctx.push(u.stit);
  if (ctx.length) h += '<p class="ctx">' + esc(ctx.join(' · ')) + '</p>';
  h += '</div><p class="body">' + esc(u.texto) + '</p>';
  if (u.corr) h += '<div class="box"><h4>Correlatividades' + (u.corrAnio ? ' — última ' + esc(u.corrAnio) : '') +
    '</h4><p class="tx">' + esc(u.corr) + '</p></div>';
  var usada = FICHAS.filter(function(f){
    return (f.fundamento||[]).some(function(x){ return x.id === id; });
  });
  if (usada.length){
    h += '<p class="eyebrow" style="margin:26px 0 10px">Se usa para responder</p><div class="stack" style="margin-top:0">' +
      usada.map(botonFicha).join('') + '</div>';
  }
  h += '<div class="rowbtns">' +
    (u.pdf ? '<a class="btn ghost" href="' + esc(u.pdf) + '" target="_blank" rel="noopener">Abrir el PDF oficial</a>' : '') +
    '<button class="btn ghost" data-imprimir>Imprimir</button></div></div>';
  el('v-articulo').innerHTML = h;
}

/* ---------------------------------------------------------- PARA NOSOTROS */
var LSK = 'mostrador.notas.v2';
function notas(){ try { return JSON.parse(localStorage.getItem(LSK) || '[]'); } catch(e){ return []; } }
function guardarNotas(n){ try { localStorage.setItem(LSK, JSON.stringify(n)); } catch(e){} contarNotas(); }
function contarNotas(){ var n = notas().length; el('cnt-notas').textContent = n ? '(' + n + ')' : ''; }
function anotar(txt){
  var n = notas();
  n.unshift({ t: txt, f: new Date().toISOString().slice(0,10) });
  guardarNotas(n);
  ir('nosotros');
}
function vNosotros(){
  var n = notas();
  var reservas = FICHAS.filter(function(f){ return f.sin_respaldo; });
  var curso = FICHAS.filter(function(f){ return f.fuente_curso; }).length;
  var h = '<p class="eyebrow">Interno</p>' +
    '<h2 style="font-size:26px;margin-top:4px">Para nosotros</h2>' +
    '<p class="lede">Lo que falta, lo que hay que chequear y las preguntas que todavía no tienen ficha. ' +
    'Esto no lo ve el usuario del mostrador.</p>' +
    '<div class="card" style="padding:18px;margin-top:20px">' +
      '<label for="nt" style="font-weight:600;display:block;margin-bottom:9px">Anotar algo pendiente</label>' +
      '<textarea id="nt" rows="3" placeholder="Ej.: falta la ficha de reinscripción de prenda vencida"></textarea>' +
      '<div class="rowbtns" style="margin-top:12px"><button class="btn" id="nt-add">Guardar la nota</button></div>' +
      '<p class="note" style="margin-top:10px">Se guarda solo en esta computadora. Para pasarlas a otro lado, copialas a mano.</p>' +
    '</div>';
  h += '<p class="eyebrow" style="margin-top:28px">Notas guardadas (' + n.length + ')</p>';
  h += n.length
    ? '<div class="stack">' + n.map(function(x, i){
        return '<div class="nota"><div><p>' + esc(x.t) + '</p><p class="mt">' + esc(x.f) + '</p></div>' +
          '<button data-del="' + i + '" title="Borrar">×</button></div>'; }).join('') + '</div>'
    : '<p class="note" style="margin-top:8px">Todavía no hay notas.</p>';

  h += '<p class="eyebrow" style="margin-top:32px">Qué hay cargado</p>' +
    '<div class="card" style="padding:16px 18px;margin-top:8px"><p class="note">' +
    FICHAS.length + ' respuestas de mostrador · ' + DATA.meta.articulos_digesto + ' artículos del Digesto · ' +
    DATA.meta.anexos_digesto + ' anexos · ' + DATA.meta.articulos_norma + ' artículos de normativa superior · ' +
    UNITS.filter(function(u){ return u.tipo === 'arancel'; }).length + ' aranceles de la Resol. 412/2026.<br>' +
    curso + ' respuestas usan como fuente el curso de la DNRPA del 08/09/2026 además de la norma.' +
    '</p></div>';

  h += '<details class="acc" style="margin-top:24px"><summary>Reservas — lo que quedó sin confirmar' +
    '<span class="cnt">' + reservas.length + '</span></summary><div class="sec">' +
    '<p class="note" style="margin-bottom:10px">Casi todas las respuestas llevan una reserva: dice qué parte no está ' +
    'textual en la norma y de dónde sale. Sirve para saber qué hay que ir a chequear con la Dirección Nacional.</p>' +
    '<div class="stack" style="margin-top:0">' + reservas.map(function(f){
      return '<button class="qbtn" data-ficha="' + esc(f.id) + '"><span class="ar">→</span><span>' +
        esc(f.pregunta) + '<br><span class="tg" style="text-transform:none;font-weight:400;letter-spacing:0;font-size:14px">' +
        esc(f.sin_respaldo) + '</span></span></button>'; }).join('') + '</div></div></details>';
  el('v-nosotros').innerHTML = h;

  el('nt-add').addEventListener('click', function(){
    var t = el('nt').value.trim(); if (!t) return;
    anotar(t);
  });
  contarNotas();
}

/* ------------------------------------------------------------- cableado   */
document.querySelectorAll('.rail button[data-view]').forEach(function(b){
  b.addEventListener('click', function(){ ir(b.dataset.view); });
});
el('btn-imprimir').addEventListener('click', function(){ window.print(); });

document.addEventListener('click', function(ev){
  var t;
  if ((t = ev.target.closest('[data-ficha]')))   { ir('ficha', t.dataset.ficha); return; }
  if ((t = ev.target.closest('[data-tramite]'))) { ir('tramite', t.dataset.tramite); return; }
  if ((t = ev.target.closest('[data-art]')))     { ir('articulo', t.dataset.art); return; }
  if ((t = ev.target.closest('[data-goto]')))    { ir(t.dataset.goto); return; }
  if ((t = ev.target.closest('[data-digesto]'))) { ir('digesto', t.dataset.digesto); return; }
  if ((t = ev.target.closest('[data-volver]')))  { volver(); return; }
  if ((t = ev.target.closest('[data-imprimir]'))){ window.print(); return; }
  if ((t = ev.target.closest('[data-anotar]')))  { anotar('Pendiente: ' + t.dataset.anotar); return; }
  if ((t = ev.target.closest('[data-del]')))     {
    var n = notas(); n.splice(parseInt(t.dataset.del,10), 1); guardarNotas(n); vNosotros(); return;
  }
});
document.addEventListener('keydown', function(ev){
  if (ev.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){
    ev.preventDefault(); ir('inicio');
  }
});

contarNotas();
ir('inicio', null, true);
