// ============================================================
//  Escena: nivel (PLANTILLA genérica)
// ------------------------------------------------------------
//  Esto es un STUB navegable. Cada recuerdo se construye
//  clonando esta escena y reemplazando drawWorld() / la lógica
//  por su mecánica real (observación, reconstruir, luz, vals...).
//
//  Ya trae cableado lo común a todos los niveles:
//   · carga de paleta propia
//   · cabecera (nº, título, mecánica) y recuerdo
//   · botón "volver" al hub
//   · botón "completar" (placeholder) que enciende la estrella
//   · el tulipán oculto (Capa 4) como ejemplo de easter egg
// ============================================================

class LevelScene {
  constructor(id) { this.id = id; }

  enter() {
    this.level = getLevel(this.id);
    this.pal = PALETTES[this.level.palette];
    this.frame = 0;
    this.hoverBack = false;
    this.hoverDone = false;
    this.hoverTulip = false;

    // Rectángulos de UI (fijos): definidos una vez para hit-test estable.
    this.backBtn = { x: 10, y: VIRTUAL_H - 24, w: 52, h: 14 };
    this.doneBtn = { x: VIRTUAL_W - 118, y: VIRTUAL_H - 24, w: 108, h: 14 };
    // Tulipán oculto de ejemplo (en un rincón). En el juego real irá camuflado.
    this.tulip = { x: VIRTUAL_W - 20, y: 30, r: 6 };
  }

  update() {
    this.frame++;
    const v = vMouse();
    this.hoverBack = pointInRect(v, this.backBtn);
    this.hoverDone = pointInRect(v, this.doneBtn);
    this.hoverTulip = !Game.tulips[this.id] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r;
  }

  // --- Lo que cambiará por completo en cada nivel real ---------
  drawWorld(pg) {
    pg.push();
    pg.textAlign(CENTER, CENTER);
    pg.fill(this.pal.dim);
    pg.textSize(8);
    pg.text('[ escena del recuerdo — por construir ]', VIRTUAL_W / 2, VIRTUAL_H / 2 + 4);
    // muestra de la paleta del nivel
    const cols = [this.pal.accent, this.pal.a2, this.pal.a3, this.pal.dim].filter(Boolean);
    const sw = 10, gap = 4, totalW = cols.length * sw + (cols.length - 1) * gap;
    let sx = VIRTUAL_W / 2 - totalW / 2;
    pg.noStroke();
    for (const c of cols) { pg.fill(c); pg.rect(sx, VIRTUAL_H / 2 + 22, sw, sw, 2); sx += sw + gap; }
    pg.pop();
  }

  draw(pg) {
    pg.background(this.pal.bg);
    this.drawWorld(pg);

    // Cabecera del recuerdo
    pg.push();
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent);
    pg.textSize(7);
    pg.text('RECUERDO ' + this.level.n + ' · ' + this.level.mechanic.toUpperCase(), 10, 10);
    pg.fill(this.pal.ink);
    pg.textSize(16);
    pg.text(this.level.title, 10, 22);
    pg.fill(this.pal.dim);
    pg.textSize(7);
    pg.text('“' + this.level.memory + '”', 10, 42);
    pg.pop();

    // Tulipán oculto (Capa 4)
    if (!Game.tulips[this.id]) {
      drawTulip(pg, this.tulip.x, this.tulip.y, this.hoverTulip ? 1 : 0.5);
    }

    // UI inferior
    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
    const label = Game.isDone(this.id) ? '✓ recuerdo resuelto' : 'completar (placeholder)';
    drawButton(pg, label, this.doneBtn.x, this.doneBtn.y, this.doneBtn.w, this.doneBtn.h, this.pal, this.hoverDone);
  }

  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }
    if (pointInRect(v, this.doneBtn)) { Game.complete(this.id); SM.change(new HubScene()); return; }
    if (!Game.tulips[this.id] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r) {
      Game.foundTulip(this.id);   // easter egg encontrado
    }
  }
}

// Tulipán mínimo en pixel art (motivo del final secreto).
function drawTulip(pg, x, y, alpha) {
  pg.push();
  pg.noStroke();
  pg.fill(pg.color(91, 125, 84, 255 * alpha));
  pg.rect(x - 0.5, y, 1, 7);                 // tallo
  pg.fill(pg.color(224, 138, 160, 255 * alpha));
  pg.rect(x - 3, y - 5, 6, 5, 1);            // flor
  pg.fill(pg.color(201, 111, 137, 255 * alpha));
  pg.rect(x - 1, y - 5, 2, 5);               // pétalo central
  pg.pop();
}
