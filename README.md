# Mostrador Registral

Herramienta de consulta para el mostrador de un Registro Seccional de la
Propiedad del Automotor. Cómo se cobra cada trámite, qué se le pide al usuario,
y el Digesto completo para buscar.

**Abrir la herramienta:** [index.html](./index.html) — o, con GitHub Pages
activado, en `https://TUUSUARIO.github.io/TUREPO/`.

---

## Qué tiene

- **85 respuestas de mostrador.** Cada una arranca con el veredicto en una
  línea, y sigue con el bloque de caja: qué **ya viene incluido**, qué hay que
  **sumar** y qué hay que **sacar** del sistema. Abajo, plegado, la explicación
  completa, el artículo que la sostiene y la **reserva** (qué parte no está
  textual en la norma).
- **Los 13 trámites** que se ven en el seccional, como entrada alternativa a la
  búsqueda.
- El **Digesto completo**: 1.138 artículos y 101 anexos de los Títulos I y II,
  texto ordenado del 12/08/2026, con link a la página exacta del PDF oficial.
- La **normativa superior**: Régimen Jurídico del Automotor, Decreto 335/88,
  Ley de Prenda, y las resoluciones y disposiciones de 2025-2026.
- El texto de las **34 categorías arancelarias** de la Resolución MJ 412/2026,
  vigentes desde el 01/09/2026.

Los importes en pesos no están, a propósito: eso lo tira SURA. Acá está lo que
el sistema no muestra — qué incluye cada arancel y qué corresponde sacar.

Todo vive dentro del archivo. No consulta ningún servicio, no manda datos a
ningún lado, no hay ninguna IA contestando y funciona sin internet.

---

## Cómo se aporta

**1. Abrir un Issue** (recomendado). Solapa **Issues** → **New issue** → elegí
el formulario:

- *Faltó esto* — una consulta que la herramienta no supo contestar.
- *Error en un texto o en un arancel* — algo que no coincide con el PDF oficial.
- *Falta un trámite* — un trámite que debería tener respuesta y no la tiene.

**2. Anotarlo en [NOTAS.md](./NOTAS.md)** si preferís escribir libre. Se edita
desde el navegador: clic en el archivo, el ícono del lápiz, escribís abajo de
todo y **Commit changes**.

Desde la propia herramienta, la solapa **Para nosotros** guarda las consultas en
esa computadora para pasarlas después.

---

## Qué hay en este repositorio

| | |
|---|---|
| `index.html` | La herramienta entera, en un solo archivo. Es lo que sirve GitHub Pages. |
| `ESTADO.md` | Auditoría de la última subida: cuántas respuestas hay y qué quedó pendiente. Se genera solo. |
| `INDICE-DE-FICHAS.md` | Las 85 preguntas con su veredicto, agrupadas por trámite. Para leer en papel. |
| `LEEME.txt` | Qué es, cómo se abre, cómo se usa, qué se guarda. |
| `PARA-PRESENTARLA.md` | Guion de cinco minutos para mostrarla en el mostrador. |
| `NOTAS.md` | Cuaderno abierto de pendientes. |
| `fuente/` | Los fuentes para rehacer la herramienta: las respuestas en `fichas.json`, el corpus, los tres archivos de la app y los scripts que la arman. |

Los PDF oficiales del Digesto **no** están acá: se bajan de
[dnrpa.gov.ar](https://www.dnrpa.gov.ar/nuevodigesto/). El sitio tiene depósito
de Ley 11.723 sobre la compilación.

---

## Advertencia

No reemplaza a SURA ni al criterio del Encargado. Ante cualquier diferencia
manda el PDF oficial, que está linkeado en cada artículo.
