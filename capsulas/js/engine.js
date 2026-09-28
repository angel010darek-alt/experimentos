// ============================================================
//  Motor de render — resolución virtual + escalado pixel-perfect
// ============================================================
//  Dibujamos el mundo en un buffer pequeño (PG) de VIRTUAL_W x
//  VIRTUAL_H y luego lo estiramos a la ventana con escalado
//  entero y sin suavizado, para pixel art nítido y letterbox.

let PG;                  // buffer de pixel art (p5.Graphics)
let view = { scale: 1, offX: 0, offY: 0 };

function createEngine() {
  PG = createGraphics(VIRTUAL_W, VIRTUAL_H);
  PG.noSmooth();
  PG.textFont('monospace');
  computeView();
}

// Calcula escala entera y centrado (letterbox) para la ventana actual.
function computeView() {
  const s = Math.max(1, Math.floor(Math.min(width / VIRTUAL_W, height / VIRTUAL_H)));
  view.scale = s;
  view.offX = Math.floor((width - VIRTUAL_W * s) / 2);
  view.offY = Math.floor((height - VIRTUAL_H * s) / 2);
}

// Convierte coordenadas de pantalla a coordenadas del mundo virtual.
function screenToVirtual(mx, my) {
  return {
    x: (mx - view.offX) / view.scale,
    y: (my - view.offY) / view.scale,
  };
}

// Ratón actual en coordenadas virtuales (para hover).
function vMouse() { return screenToVirtual(mouseX, mouseY); }

// Vuelca el buffer a la pantalla, escalado y centrado.
function presentBuffer() {
  background(8, 7, 14);            // color del letterbox (borde)
  noSmooth();
  image(PG, view.offX, view.offY, VIRTUAL_W * view.scale, VIRTUAL_H * view.scale);
}

// ---- Helpers de dibujo dentro del buffer --------------------

// Rectángulo de "botón" con etiqueta; devuelve sus límites para hit-test.
function drawButton(pg, label, x, y, w, h, pal, hovered) {
  pg.push();
  pg.rectMode(CORNER);
  pg.stroke(pal.accent);
  pg.strokeWeight(1);
  pg.fill(hovered ? pal.accent : 'rgba(0,0,0,0)');
  pg.rect(x, y, w, h, 3);
  pg.noStroke();
  pg.fill(hovered ? pal.bg : pal.ink);
  pg.textAlign(CENTER, CENTER);
  pg.textSize(9);
  pg.text(label, x + w / 2, y + h / 2 + 0.5);
  pg.pop();
  return { x, y, w, h };
}

function pointInRect(p, r) {
  return r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
