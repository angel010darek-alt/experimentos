// ============================================================
//  Nivel 2 — Reconstruir · "Construir lo nuestro"
// ------------------------------------------------------------
//  Un vinilo (el disco de Melanie Martinez) está roto en 6
//  fragmentos dispersos. Se arrastran al centro; con encaje
//  MAGNÉTICO cada uno cae en su sitio (sin castigo, reintento
//  infinito). Al completarlo, el disco gira y "suena": ondas y
//  notas salen del centro, con la frase:
//    "poco a poco, lo nuestro."
//
//  Reconstruir pieza a pieza = construir la relación despacio.
// ============================================================

const DISC = { x: 200, y: 92, r: 40 };
const N_PIECES = 6;
const SNAP_DIST = 26;   // radio de encaje magnético (generoso = relajante)

class DiscoScene {
  enter() {
    this.pal = PALETTES.disco;
    this.frame = 0;
    this.placedCount = 0;
    this.spin = 0;
    this.done = false;
    this.doneFrame = 0;
    this.dragging = null;
    this.dragOff = { x: 0, y: 0 };

    // 6 cuñas; cada una parte de una posición dispersa.
    const seed = [
      { x: 60,  y: 60 }, { x: 120, y: 150 }, { x: 300, y: 55 },
      { x: 330, y: 140 }, { x: 250, y: 165 }, { x: 70,  y: 150 },
    ];
    this.pieces = [];
    for (let i = 0; i < N_PIECES; i++) {
      this.pieces.push({
        i,
        a0: (i / N_PIECES) * TWO_PI,
        a1: ((i + 1) / N_PIECES) * TWO_PI,
        placed: false,
        cur: { x: seed[i].x, y: seed[i].y },
      });
    }

    this.backBtn = { x: 10, y: VIRTUAL_H - 22, w: 52, h: 13 };
    this.hoverBack = false;
    this.tulip = { x: 26, y: 118, r: 6 };
  }

  update() {
    this.frame++;
    this.hoverBack = pointInRect(vMouse(), this.backBtn);
    if (this.done) { this.spin += 0.03; this.doneFrame++; }
  }

  // --- Dibujo de una cuña (porción de disco) ------------------
  wedge(pg, cx, cy, r, a0, a1, fill) {
    pg.fill(fill);
    pg.noStroke();
    pg.beginShape();
    pg.vertex(cx, cy);
    const steps = 10;
    for (let s = 0; s <= steps; s++) {
      const a = a0 + (a1 - a0) * (s / steps);
      pg.vertex(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    pg.endShape(CLOSE);
  }

  draw(pg) {
    pg.background(this.pal.bg);

    // Guía tenue: dónde se arma el disco.
    pg.noFill();
    pg.stroke(pg.color(240, 217, 226, 40));
    pg.strokeWeight(1);
    pg.ellipse(DISC.x, DISC.y, DISC.r * 2 + 2);
    pg.noStroke();

    // Cuñas ya colocadas (forman el disco, girando si está completo).
    for (const p of this.pieces) {
      if (!p.placed) continue;
      const off = this.done ? this.spin : 0;
      this.wedge(pg, DISC.x, DISC.y, DISC.r, p.a0 + off, p.a1 + off,
                 p.i % 2 ? pg.color('#2a2028') : pg.color('#241a22'));
      // surco sutil
      pg.noFill(); pg.stroke(pg.color(207, 127, 157, 60)); pg.strokeWeight(1);
      pg.arc(DISC.x, DISC.y, DISC.r * 1.3, DISC.r * 1.3, p.a0 + off, p.a1 + off);
      pg.noStroke();
    }

    // Etiqueta central cuando hay disco.
    if (this.placedCount > 0) {
      pg.fill(this.pal.accent);
      pg.ellipse(DISC.x, DISC.y, 16);
      pg.fill(this.pal.bg);
      pg.ellipse(DISC.x, DISC.y, 3);
    }

    // "Sonido" al completar: ondas + notas.
    if (this.done) {
      for (let k = 0; k < 3; k++) {
        const rr = ((this.doneFrame * 0.8 + k * 26) % 78);
        const a = map(rr, 0, 78, 120, 0);
        pg.noFill(); pg.stroke(pg.color(231, 155, 182, a)); pg.strokeWeight(1);
        pg.ellipse(DISC.x, DISC.y, DISC.r * 2 + rr);
      }
      pg.noStroke();
      pg.fill(this.pal.a2);
      pg.textSize(9);
      pg.text('♪', DISC.x + 40 + Math.sin(this.frame * 0.1) * 3, DISC.y - 28 - (this.doneFrame % 40) * 0.3);
      pg.text('♫', DISC.x - 46 + Math.cos(this.frame * 0.12) * 3, DISC.y - 16 - (this.doneFrame % 50) * 0.3);
    }

    // Cuñas sueltas (dispersas / en arrastre).
    for (const p of this.pieces) {
      if (p.placed) continue;
      const isDrag = this.dragging === p;
      if (isDrag) { pg.fill(pg.color(0, 0, 0, 60)); this.wedge(pg, p.cur.x + 1, p.cur.y + 2, DISC.r * 0.9, p.a0, p.a1, pg.color(0, 0, 0, 60)); }
      this.wedge(pg, p.cur.x, p.cur.y, DISC.r * 0.9, p.a0, p.a1,
                 p.i % 2 ? pg.color('#3a2c34') : pg.color('#33262e'));
    }

    // Tulipán oculto
    if (!Game.tulips['disco']) drawTulip(pg, this.tulip.x, this.tulip.y, 0.5);

    this.drawHUD(pg);
  }

  drawHUD(pg) {
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('RECUERDO 02 · RECONSTRUIR', 10, 9);
    pg.fill(this.pal.ink); pg.textSize(13);
    pg.text('Construir lo nuestro', 10, 19);

    pg.textAlign(RIGHT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('PIEZAS ' + this.placedCount + '/' + N_PIECES, VIRTUAL_W - 10, 9);

    if (this.done) {
      const a = Math.min(1, this.doneFrame / 40);
      pg.textAlign(CENTER, CENTER);
      pg.fill(pg.color(240, 217, 226, 255 * a)); pg.textSize(9);
      pg.text('poco a poco, lo nuestro.', VIRTUAL_W / 2, VIRTUAL_H - 40);
    }

    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
  }

  // --- Interacción: arrastrar y encajar -----------------------
  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }
    if (!Game.tulips['disco'] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r) {
      Game.foundTulip('disco'); return;
    }
    // Tomar la cuña suelta más cercana bajo el cursor.
    let best = null, bestD = 1e9;
    for (const p of this.pieces) {
      if (p.placed) continue;
      const d = dist(v.x, v.y, p.cur.x, p.cur.y);
      if (d < DISC.r * 0.85 && d < bestD) { best = p; bestD = d; }
    }
    if (best) { this.dragging = best; this.dragOff = { x: best.cur.x - v.x, y: best.cur.y - v.y }; }
  }

  mouseDragged(v) {
    if (this.dragging) { this.dragging.cur.x = v.x + this.dragOff.x; this.dragging.cur.y = v.y + this.dragOff.y; }
  }

  mouseReleased() {
    if (!this.dragging) return;
    const p = this.dragging;
    // Encaje magnético: si se suelta cerca del centro del disco, cae en su sitio.
    if (dist(p.cur.x, p.cur.y, DISC.x, DISC.y) <= SNAP_DIST) {
      p.placed = true;
      this.placedCount++;
      if (this.placedCount >= N_PIECES && !this.done) { this.done = true; this.doneFrame = 0; Game.complete('disco'); }
    }
    this.dragging = null;
  }
}
