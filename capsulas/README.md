# Cápsulas — prototipo

Juego-regalo de cumpleaños. Puzzle relajante, pixel art, hub de constelaciones
con recuerdos como niveles. Ver la **biblia de diseño** para el concepto completo.

Esqueleto en **p5.js** (modo global): resolución virtual pixel-perfect, gestor
de escenas con transiciones, y el hub-cielo navegable con las 5 estrellas.

## Cómo correrlo

Necesita servirse por HTTP (los `<script src>` locales no cargan con `file://`):

```bash
cd capsulas
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Controles

- **Clic** — comenzar, entrar a una estrella, usar botones.
- Dentro de un nivel: **← volver** al cielo, **completar (placeholder)** enciende su estrella.
- Hay un **tulipán oculto** de ejemplo en cada nivel (esquina superior derecha).
- Atajos de desarrollo: **R** reinicia el progreso · **T** marca todos los tulipanes.

## Estructura

```
capsulas/
├── index.html            # carga p5 + todos los scripts en orden
└── js/
    ├── config.js         # resolución virtual, PALETAS, LEVELS, estado (Game)
    ├── engine.js         # buffer de pixel art, escalado, coords virtuales
    ├── fx.js             # campo de estrellas compartido
    ├── sceneManager.js   # pila de escenas + fundido onírico (SM)
    ├── main.js           # setup/draw/input (p5 global)
    └── scenes/
        ├── title.js      # el cielo apagado, "toca para comenzar"
        ├── hub.js        # el cielo: estrellas-recuerdo, constelación final
        └── level.js      # PLANTILLA de nivel (stub navegable)
```

## Cómo se construye un nivel real

Cada recuerdo se hace clonando `scenes/level.js`: se mantiene la cabecera, los
botones y el hook del tulipán, y se reemplaza `drawWorld()` + la lógica por su
mecánica (observación, reconstruir, luz/sombra, el vals...). Registrar la escena
concreta y enrutarla desde el hub cuando esté lista.

## Pendiente (huecos reservados)

- El texto de **la carta** del final secreto.
- El **cuento/mensaje** que revela la luz en el Nivel 3.
- La **foto real** del final secreto.
