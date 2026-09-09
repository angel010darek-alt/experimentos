# Gojo — Hueco Púrpura en TouchDesigner

Efecto visual: una **bola azul** + una **bola roja** que, al acercarse, generan
un núcleo **morado** (el "Hollow Purple" de Gojo).

La técnica base es un **GLSL TOP** que dibuja dos campos de brillo (azul y rojo)
y realza el morado donde se solapan. Es la ruta más flexible y bonita: brillo
suave, fusión de color y buen rendimiento.

---

## 1. Red de nodos (pasos)

```
[ mouseA (Mouse In CHOP) ]  ┐
[ lfoB   (LFO/Noise CHOP) ] ┤  (controlan las posiciones)
                            │
                    ┌───────▼─────────┐
                    │  glsl1 (GLSL TOP)│  <- pega hollow_purple.frag
                    └───────┬─────────┘
                            │
                    ┌───────▼─────────┐
                    │ blur1 (Blur TOP) │  <- halo / glow
                    └───────┬─────────┘
                            │
        glsl1 ─────────────►│ comp1 (Composite TOP, Operand = Add)
                            │
                    ┌───────▼─────────┐
                    │ out1 (Null TOP)  │  <- salida final
                    └──────────────────┘
```

### Paso a paso
1. Crea un **GLSL TOP** (`glsl1`). Resolución p. ej. 1280×720.
2. Abre su parámetro **Pixel Shader** → **Edit** y pega el contenido de
   [`hollow_purple.frag`](./hollow_purple.frag).
3. Declara los **uniforms** en la página **Vectors** del GLSL TOP:
   | Uniform Name | value0 | value1 | Tipo en shader |
   |--------------|--------|--------|----------------|
   | `uPosA`      | x azul | y azul | `vec2` |
   | `uPosB`      | x rojo | y rojo | `vec2` |
   | `uRadius`    | 0.15   |        | `float` |
   | `uAspect`    | 1.777  |        | `float` (ancho/alto) |
   > `uAspect` = `me.par.resolutionw / me.par.resolutionh`. Para 1280×720 = 1.777.
4. Añade un **Blur TOP** (`blur1`) después del GLSL, con **Filter Size ~40**.
5. Añade un **Composite TOP** (`comp1`): entrada 1 = `blur1`, entrada 2 = `glsl1`,
   **Operation = Add**. Esto suma el halo difuminado sobre el núcleo nítido.
6. Cierra con un **Null TOP** (`out1`) como salida final.

---

## 2. Mover las bolas y hacer que se junten

Las posiciones viven en `uPosA` y `uPosB` (rango 0..1). Dos formas:

### Opción A — Azul con el ratón, rojo automático
- **Mouse In CHOP** (`mouseA`): da `tx`, `ty` en rango -0.5..0.5.
- En la página **Vectors** del GLSL TOP, en los campos de `uPosA` pon expresiones:
  - value0: `op('mouseA')['tx'] + 0.5`
  - value1: `op('mouseA')['ty'] + 0.5`
- Para el rojo, en `uPosB` usa un movimiento automático (orbita al centro):
  - value0: `0.5 + 0.3*cos(absTime.seconds)`
  - value1: `0.5 + 0.3*sin(absTime.seconds)`

Cuando lleves el ratón al centro donde orbita la roja → aparece el morado.

### Opción B — Animación automática que se fusiona sola
En `uPosA` y `uPosB` usa un valor `t` que las lleve del borde al centro:
- `uPosA` value0: `0.5 - 0.35*abs(sin(absTime.seconds*0.5))`  (azul entra por la izq.)
- `uPosB` value0: `0.5 + 0.35*abs(sin(absTime.seconds*0.5))`  (roja entra por la der.)
- ambos value1: `0.5`

Se acercan y separan en bucle, mostrando el morado en el cruce.

---

## 3. Ajustes de look
- **Más energía / núcleo**: sube `uRadius` (0.2–0.3) o el exponente `pow(g, 1.6)`.
- **Halo más grande**: sube el *Filter Size* del Blur.
- **Colores**: edita los `vec3` de azul/rojo en el shader.
- **Fondo negro con destellos**: añade un **Feedback TOP** entre el composite y el
  null para dejar estelas.

---

## Archivos
- `hollow_purple.frag` — el pixel shader del GLSL TOP.
