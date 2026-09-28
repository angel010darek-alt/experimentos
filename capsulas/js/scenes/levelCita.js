// ============================================================
//  Nivel 1 — Observación · "La primera cita"
// ------------------------------------------------------------
//  La escena (una plaza con el Mixup) empieza en GRIS y muda.
//  Al encontrar cada detalle oculto, su zona cobra color; el
//  fondo se tiñe según cuánto ha mirado. Con los 5 detalles,
//  todo florece, aparecen las dos figuras y llega la frase:
//    "y de repente, todo tenía color."
//
//  Es ella abriéndose poco a poco: la mecánica y el recuerdo
//  son la misma cosa (ver biblia de diseño).
// ============================================================

const HORIZON = 150;

class CitaScene {
  enter() {
    this.level = getLevel('cita');
    this.pal = PALETTES.cita;
    this.frame = 0;
    this.foundFrame = {};     // id -> frame en que se encontró (para el pop de color)
    this.foundCount = 0;
    this.bloom = 0;           // 0..1, arranca al hallar los 5
    this.completed = false;
    this.caption = null;
    this.captionFrame = -999;
    this.lastFind = 0;        // para el temporizador de pista

    // Detalles ocultos (findables). Región de clic generosa.
    this.spots = [
      { id: 'record',  x: 62,  y: 96,  r: 10, label: 'un disco en el aparador' },
      { id: 'lamp',    x: 178, y: 92,  r: 11, label: 'la luz de la farola' },
      { id: 'flowers', x: 168, y: 150, r: 10, label: 'flores junto a la banca' },
      { id: 'heart',   x: 232, y: 146, r: 10, label: 'un corazón en la madera' },
      { id: 'cat',     x: 268, y: 150, r: 11, label: 'un gato callejero' },
    ];

    // Tulipán oculto (Capa 4) — camuflado, aparte de los 5.
    this.tulip = { x: 344, y: 128, r: 6 };

    // Botón volver
    this.backBtn = { x: 10, y: VIRTUAL_H - 22, w: 52, h: 13 };
    this.hoverBack = false;
  }

  isFound(id) { return this.foundFrame[id] !== undefined; }

  // Cuánto color tiene un elemento (0..1) con un pop rápido al hallarlo.
  amt(id) {
    if (!this.isFound(id)) return 0;
    return Math.min(1, (this.frame - this.foundFrame[id]) / 12);
  }

  update() {
    this.frame++;
    const v = vMouse();
    this.hoverBack = pointInRect(v, this.backBtn);

    if (this.foundCount >= this.spots.length) {
      this.bloom = Math.min(1, this.bloom + 0.012);
      if (this.bloom >= 1 && !this.completed) { this.completed = true; Game.complete('cita'); }
    }
  }

  // --- Render -------------------------------------------------
  col(pg, grayHex, colorHex, a) {
    return pg.lerpColor(pg.color(grayHex), pg.color(colorHex), a);
  }

  draw(pg) {
    const progress = this.foundCount / this.spots.length;       // tinte del fondo
    const bg = Math.max(progress, this.bloom);
    const warm = this.bloom;                                    // calidez del atardecer

    // --- Cielo (dos bandas) ---
    pg.noStroke();
    pg.fill(this.col(pg, '#26232c', '#4a2f3f', bg));
    pg.rect(0, 0, VIRTUAL_W, HORIZON * 0.55);
    pg.fill(this.col(pg, '#2b2730', '#7a4a47', bg));
    pg.rect(0, HORIZON * 0.55, VIRTUAL_W, HORIZON - HORIZON * 0.55);
    // franja cálida del atardecer al florecer
    if (warm > 0) {
      pg.fill(pg.color(242, 200, 134, 90 * warm));
      pg.rect(0, HORIZON - 26, VIRTUAL_W, 26);
    }

    // --- Suelo ---
    pg.fill(this.col(pg, '#232028', '#3a2b33', bg));
    pg.rect(0, HORIZON, VIRTUAL_W, VIRTUAL_H - HORIZON);

    // --- Tienda Mixup (izquierda) ---
    pg.fill(this.col(pg, '#2c2830', '#3a2f3a', bg));
    pg.rect(28, 78, 92, 72);
    // toldo / letrero
    pg.fill(this.col(pg, '#33303a', this.pal.accent, Math.max(bg, this.amt('record'))));
    pg.rect(28, 74, 92, 8);
    pg.fill(this.col(pg, '#4a4652', '#12111c', bg));
    pg.textAlign(CENTER, CENTER); pg.textSize(7);
    pg.text('mix up', 74, 78);
    // aparador
    pg.fill(this.col(pg, '#3a3742', '#241a2c', bg));
    pg.rect(40, 96, 68, 40);
    // disco en el aparador (findable 'record')
    const ar = this.amt('record');
    pg.fill(this.col(pg, '#3f3b46', '#e79bb6', ar));
    pg.ellipse(this.spots[0].x, this.spots[0].y, 12);
    pg.fill(this.col(pg, '#3f3b46', '#241a2c', ar));
    pg.ellipse(this.spots[0].x, this.spots[0].y, 3);

    // --- Árbol (derecha) ---
    pg.fill(this.col(pg, '#2e2a2e', '#4a3326', bg));
    pg.rect(322, 116, 6, 34);
    pg.fill(this.col(pg, '#33313a', '#b5623a', bg));
    pg.ellipse(325, 108, 46, 40);

    // --- Farola (findable 'lamp') ---
    pg.fill(this.col(pg, '#2b2630', '#3a3440', bg));
    pg.rect(176, 92, 4, 58);
    const al = this.amt('lamp');
    if (al > 0) { pg.fill(pg.color(242, 200, 134, 70 * al)); pg.ellipse(178, 90, 22 * al); }
    pg.fill(this.col(pg, '#3a3742', '#f2c886', al));
    pg.rect(174, 86, 8, 8, 2);

    // --- Flores en la base (findable 'flowers') ---
    const af = this.amt('flowers');
    for (let i = 0; i < 4; i++) {
      pg.fill(this.col(pg, '#33303a', i % 2 ? '#e08aa0' : '#f2c886', af));
      pg.rect(162 + i * 4, 150 - (i % 2 ? 3 : 1), 2, 3);
    }

    // --- Banca (con corazón, findable 'heart') ---
    pg.fill(this.col(pg, '#312b30', '#6a4a30', bg));
    pg.rect(206, 140, 52, 4);
    pg.rect(208, 144, 3, 8); pg.rect(253, 144, 3, 8);
    pg.rect(206, 132, 52, 3);
    const ah = this.amt('heart');
    pg.fill(this.col(pg, '#3a3440', '#e08aa0', ah));   // corazón tallado
    pg.rect(231, 138, 2, 2); pg.rect(233, 138, 2, 2);
    pg.rect(230, 140, 6, 1); pg.rect(231, 141, 4, 1); pg.rect(232, 142, 2, 1);

    // --- Gato (findable 'cat') ---
    const ac = this.amt('cat');
    pg.fill(this.col(pg, '#33303a', '#2a2430', ac));
    pg.rect(264, 144, 10, 6);           // cuerpo
    pg.rect(272, 140, 4, 5);            // cabeza
    pg.rect(272, 138, 1, 2); pg.rect(275, 138, 1, 2); // orejas
    pg.rect(263, 141, 1, 9);            // cola
    if (ac > 0) { pg.fill(pg.color(242, 200, 134, 220 * ac)); pg.rect(273, 141, 1, 1); pg.rect(275, 141, 1, 1); } // ojos

    // --- Figuras al florecer ---
    if (this.bloom > 0.15) {
      const fa = Math.min(1, (this.bloom - 0.15) / 0.6);
      this.drawFigure(pg, 218, 128, '#eba54f', fa);   // uno
      this.drawFigure(pg, 240, 128, '#e08aa0', fa);   // ella
    }

    // --- Tulipán oculto ---
    if (!Game.tulips['cita']) drawTulip(pg, this.tulip.x, this.tulip.y, 0.5);

    // --- Pista suave: tras un rato sin hallazgos, late un detalle ---
    if (this.foundCount < this.spots.length && this.frame - this.lastFind > 420) {
      const s = this.spots.find(sp => !this.isFound(sp.id));
      if (s) {
        const p = (Math.sin(this.frame * 0.08) + 1) / 2;
        pg.noFill(); pg.stroke(pg.color(244, 236, 219, 40 + p * 70)); pg.strokeWeight(1);
        pg.ellipse(s.x, s.y, s.r * 2 + p * 4); pg.noStroke();
      }
    }

    this.drawHUD(pg);
  }

  drawFigure(pg, x, y, colHex, a) {
    pg.fill(pg.color(pg.red(pg.color(colHex)), pg.green(pg.color(colHex)), pg.blue(pg.color(colHex)), 255 * a));
    pg.rect(x, y, 5, 10, 1);           // cuerpo
    pg.fill(pg.color(244, 236, 219, 255 * a));
    pg.rect(x + 1, y - 5, 3, 4, 1);    // cabeza
  }

  drawHUD(pg) {
    // Cabecera
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('RECUERDO 01 · OBSERVACIÓN', 10, 9);
    pg.fill(this.col(pg, '#8f89a9', this.pal.ink, Math.max(0.3, this.bloom)));
    pg.textSize(13);
    pg.text('La primera cita', 10, 19);

    // Contador de detalles
    pg.textAlign(RIGHT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('DETALLES ' + this.foundCount + '/' + this.spots.length, VIRTUAL_W - 10, 9);

    // Caption del último hallazgo
    if (this.caption && this.frame - this.captionFrame < 150) {
      const a = Math.min(1, (150 - (this.frame - this.captionFrame)) / 40);
      pg.textAlign(CENTER, CENTER);
      pg.fill(pg.color(244, 236, 219, 255 * a)); pg.textSize(8);
      pg.text('· ' + this.caption + ' ·', VIRTUAL_W / 2, 200);
    }

    // Frase de cierre al florecer
    if (this.bloom >= 1) {
      const a = Math.min(1, (this.bloom - 0.9) / 0.1);
      pg.textAlign(CENTER, CENTER);
      pg.fill(pg.color(242, 200, 134, 255 * a)); pg.textSize(10);
      pg.text('y de repente, todo tenía color.', VIRTUAL_W / 2, 176);
    }

    // Botón volver
    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
  }

  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }

    // Tulipán oculto
    if (!Game.tulips['cita'] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r) {
      Game.foundTulip('cita');
      this.caption = 'un tulipán…'; this.captionFrame = this.frame;
      return;
    }

    // Detalles
    for (const s of this.spots) {
      if (!this.isFound(s.id) && dist(v.x, v.y, s.x, s.y) <= s.r) {
        this.foundFrame[s.id] = this.frame;
        this.foundCount++;
        this.caption = s.label; this.captionFrame = this.frame;
        this.lastFind = this.frame;
        return;
      }
    }
  }
}
