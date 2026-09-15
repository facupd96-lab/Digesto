# Cómo subirla a GitHub y usarla para juntar notas

Esta carpeta ya está armada como repositorio. No hay que preparar nada más:
subís los archivos tal como están.

---

## Subirla (20 minutos, una sola vez)

1. Entrá a **github.com** y creá una cuenta si no tenés.
2. Arriba a la derecha, **+** → **New repository**.
3. Nombre: `digesto`. Marcá **Public**. **No** marques "Add a README file"
   (ya hay uno). Dale **Create repository**.
4. En la pantalla que aparece, clic en **uploading an existing file**.
5. Abrí la carpeta `para-llevar` en tu computadora, **seleccioná todo** y
   arrastralo a la ventana del navegador. Son estos archivos:
   - `index.html` — la herramienta
   - `README.md` — la portada del repositorio
   - `NOTAS.md` — el cuaderno abierto
   - `COMO-PUBLICARLA-ONLINE.md`, `PARA-PRESENTARLA.md`, `LEEME.txt`, `INDICE-DE-FICHAS.md`
   - la carpeta `plantillas-github` (los formularios de Issues, ver más abajo)

6. Abajo, botón verde **Commit changes**.

## Activar la página web

7. **Settings** (arriba) → en el menú de la izquierda, **Pages**.
8. En *Source* elegí **Deploy from a branch**. En *Branch*: **main** y la
   carpeta **/ (root)**. **Save**.
9. Esperá uno o dos minutos y recargá esa pantalla. Arriba te aparece la
   dirección: `https://TUUSUARIO.github.io/digesto/`. Esa es la URL para
   repartir. Se abre en cualquier celular o computadora, sin cuenta y sin
   instalar nada.

---

## Cómo se juntan las notas (esto es lo que vas a usar mañana)

**Issues** es la solapa de arriba del repositorio. Cada consulta o error entra
como un Issue: tiene su propio hilo, se le puede contestar, y se cierra cuando
se convirtió en ficha. Ya te dejé tres formularios cargados:

- **Faltó esto** — una consulta que la herramienta no supo contestar. Pide la
  consulta textual, qué buscaste y cómo la resolviste.
- **Error en un texto o en un arancel** — pide dónde, qué dice y qué debería
  decir.
- **Falta un trámite** — un trámite que debería tener ficha.

Un compañero entra a `https://github.com/TUUSUARIO/digesto/issues`, toca
**New issue**, elige el formulario y completa. Necesita cuenta de GitHub
(es gratis y se hace en dos minutos).

> **Los formularios hay que crearlos a mano una sola vez.** Van en una carpeta
> que empieza con punto y por eso no se pueden copiar como los demás archivos.
> El paso a paso está en `plantillas-github/LEEME-PLANTILLAS.md`: son cuatro
> archivos, se crean desde el navegador y lleva dos minutos.
>
> Si no lo hacés, Issues funciona igual: el que reporta escribe libre en vez de
> completar campos.

Si preferís algo más informal, `NOTAS.md` es un cuaderno abierto: clic en el
archivo, el ícono del **lápiz**, escribís abajo de todo y **Commit changes**.
Sin formularios y sin etiquetas.

**Atajo desde la herramienta.** En la solapa *Faltó esto* hay un campo al final
para pegar la dirección del repositorio. Cuando lo cargás aparece un botón
**Abrir en GitHub** que lleva directo al formulario de Issues. Y el botón
*Copiar la lista* te deja todas las anotaciones del día listas para pegar.

---

## Cómo la actualizo cuando te pase una versión nueva

Entrás al repositorio → **Add file** → **Upload files** → arrastrás el
`index.html` nuevo → **Commit changes**. GitHub lo reemplaza y la página web se
actualiza sola en un minuto. La URL no cambia.

---

## Los otros dos caminos, por si acaso

**El archivo suelto.** `index.html` en un pendrive o por mail. Doble clic y
anda. Es el único que funciona con internet caído, y en un registro eso pasa:
llevalo igual mañana.

**El link de Claude.** La página ya está publicada como artifact, hoy en
privado. Se abre con el botón *Share*. Probalo antes en el celular en una
ventana de incógnito: si te pide iniciar sesión, ese camino no sirve para gente
de otros registros.

---

## Una advertencia sobre el repositorio público

Un repositorio *Public* es una publicación: queda visible para cualquiera. La
normativa es pública, pero el sitio del Digesto tiene depósito de Ley 11.723
sobre **la compilación**. Para uso interno del registro no hay problema; si esto
se va a repartir a todo el país, conviene consultarlo antes. Si preferís
cerrarlo, GitHub Pages con repositorio privado necesita plan pago: en ese caso
el camino del archivo suelto es el correcto.
