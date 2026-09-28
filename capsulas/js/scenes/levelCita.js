// ============================================================
//  Nivel 1 — Observación · "La primera cita"
// ------------------------------------------------------------
//  Escena real: la plaza de la primera salida — el Mixup, una
//  mesa con dos sillas, más tiendas alrededor. No lo más
//  romántico, pero fue el comienzo.
//
//  ELLA está en la escena: vestida de negro, el pelo amarillo
//  a medio despintar (raíz negra). Empieza —como todo— en gris
//  y apagada. Al encontrar los detalles, cada zona cobra color;
//  con los 5, la escena florece, él aparece en la otra silla y
//  llega la frase:  "y de repente, todo tenía color."
//
//  Es ella abriéndose poco a poco (al principio apenas hablaba):
//  la mecánica y el recuerdo son la misma cosa.
// ============================================================

const HORIZON = 150;

class CitaScene {
  enter() {
    this.pal = PALETTES.cita;
    this.frame = 0;
    this.foundFrame = {};
    this.foundCount = 0;
    this.bloom = 0;
    this.completed = false;
    this.caption = null;
    this.captionFrame = -999;
    this.lastFind = 0;

    // Posición de ella (sentada en la silla izquierda de la mesa).
    this.girl = { x: 168, y: 118 };

    // Detalles ocultos (findables). Región de clic generosa.
    this.spots = [
      { id: 'record',  x: 56,  y: 98,  r: 11, label: 'un disco en el aparador del Mixup' },
      { id: 'cups',    x: 200, y: 132, r: 12, label: 'dos vasos en la mesa' },
      { id: 'shops',   x: 322, y: 96,  r: 12, label: 'las otras tiendas de la plaza' },
      { id: 'cat',     x: 262, y: 150, r: 11, label: 'un gato asomándose' },
      { id: 'hair',    x: 168, y: 106, r: 10, label: 'su cabello a medio pintar' },
    ];

    this.tulip = { x: 344, y: 132, r: 6 };
    this.backBtn = { x: 10, y: VIRTUAL_H - 22, w: 52, h: 13 };
    this.hoverBack = false;
  }

  isFound(id) { return this.foundFrame[id] !== undefined; }
  amt(id) { return this.isFound(id) ? Math.min(1, (this.frame - this.foundFrame[id]) / 20) : 0; }

  update() {
    this.frame++;
    this.hoverBack = pointInRect(vMouse(), this.backBtn);
    if (this.foundCount >= this.spots.length) {
      this.bloom = Math.min(1, this.bloom + 0.010);   // florecer suave
      if (this.bloom >= 1 && !this.completed) { this.completed = true; Game.complete('cita'); }
    }
  }

  col(pg, grayHex, colorHex, a) { return pg.lerpColor(pg.color(grayHex), pg.color(colorHex), a); }

  draw(pg) {
    const progress = this.foundCount / this.spots.length;
    // el fondo respira un poco antes de florecer del todo (color-in suave)
    const bg = Math.max(progress * 0.7, this.bloom);
    const warm = this.bloom;

    // --- Cielo ---
    pg.noStroke();
    pg.fill(this.col(pg, '#26232c', '#4a2f3f', bg));
    pg.rect(0, 0, VIRTUAL_W, HORIZON * 0.55);
    pg.fill(this.col(pg, '#2b2730', '#7a4a47', bg));
    pg.rect(0, HORIZON * 0.55, VIRTUAL_W, HORIZON - HORIZON * 0.55);
    if (warm > 0) { pg.fill(pg.color(242, 200, 134, 80 * warm)); pg.rect(0, HORIZON - 30, VIRTUAL_W, 30); }

    // --- Suelo de la plaza ---
    pg.fill(this.col(pg, '#232028', '#3a2b33', bg));
    pg.rect(0, HORIZON, VIRTUAL_W, VIRTUAL_H - HORIZON);
    // baldosas sutiles
    pg.stroke(this.col(pg, '#1e1b22', '#2f232b', bg)); pg.strokeWeight(1);
    for (let x = 0; x < VIRTUAL_W; x += 24) pg.line(x, HORIZON, x - 20, VIRTUAL_H);
    pg.noStroke();

    // --- Tienda Mixup (izquierda) ---
    pg.fill(this.col(pg, '#2c2830', '#3a2f3a', bg));
    pg.rect(22, 78, 78, 72);
    pg.fill(this.col(pg, '#33303a', this.pal.accent, Math.max(bg, this.amt('record'))));
    pg.rect(22, 74, 78, 8);
    pg.fill(this.col(pg, '#4a4652', '#12111c', bg));
    pg.textAlign(CENTER, CENTER); pg.textSize(7);
    pg.text('mix up', 61, 78);
    pg.fill(this.col(pg, '#3a3742', '#241a2c', bg));
    pg.rect(32, 96, 58, 40);
    // disco en el aparador (findable 'record')
    const ar = this.amt('record');
    pg.fill(this.col(pg, '#3f3b46', '#e79bb6', ar)); pg.ellipse(this.spots[0].x, this.spots[0].y, 12);
    pg.fill(this.col(pg, '#3f3b46', '#241a2c', ar)); pg.ellipse(this.spots[0].x, this.spots[0].y, 3);

    // --- Más tiendas (fondo derecha) — findable 'shops' ---
    const ash = this.amt('shops');
    pg.fill(this.col(pg, '#2a262e', '#34283a', bg)); pg.rect(286, 84, 44, 66);
    pg.fill(this.col(pg, '#2c2830', '#3a2e42', bg)); pg.rect(332, 90, 40, 60);
    pg.fill(this.col(pg, '#3a3742', this.pal.a2, ash)); pg.rect(290, 90, 20, 5);   // letrero 1
    pg.fill(this.col(pg, '#3a3742', this.pal.a3, ash)); pg.rect(338, 96, 18, 4);   // letrero 2
    // toldos rayados al colorear
    if (ash > 0) { pg.fill(pg.color(224, 138, 160, 200 * ash)); pg.rect(286, 100, 44, 4); }

    // --- Mesa con dos sillas (centro) ---
    // sillas
    pg.fill(this.col(pg, '#2e2a30', '#5a4030', bg));
    pg.rect(158, 132, 5, 16); pg.rect(158, 126, 5, 3);      // silla izq (de ella)
    pg.rect(232, 132, 5, 16); pg.rect(232, 126, 5, 3);      // silla der (de él)
    // mesa
    pg.fill(this.col(pg, '#312b30', '#6a4a30', bg));
    pg.rect(178, 134, 44, 4); pg.rect(196, 138, 4, 12);
    // dos vasos (findable 'cups')
    const acu = this.amt('cups');
    pg.fill(this.col(pg, '#3a3742', '#dfe6ff', acu)); pg.rect(190, 128, 4, 6); pg.rect(206, 128, 4, 6);
    pg.fill(this.col(pg, '#3a3742', '#e79bb6', acu)); pg.rect(190, 127, 4, 1); pg.rect(206, 127, 4, 1);

    // --- Gato (findable 'cat') ---
    const ac = this.amt('cat');
    pg.fill(this.col(pg, '#33303a', '#2a2430', ac));
    pg.rect(258, 144, 10, 6); pg.rect(266, 140, 4, 5);
    pg.rect(266, 138, 1, 2); pg.rect(269, 138, 1, 2); pg.rect(257, 141, 1, 9);
    if (ac > 0) { pg.fill(pg.color(242, 200, 134, 220 * ac)); pg.rect(267, 141, 1, 1); pg.rect(269, 141, 1, 1); }

    // --- ELLA (personaje) ---
    this.drawGirl(pg, this.girl.x, this.girl.y, bg, this.amt('hair'));

    // --- ÉL aparece al florecer, en la otra silla ---
    if (this.bloom > 0.2) this.drawGuy(pg, 234, 118, Math.min(1, (this.bloom - 0.2) / 0.6));

    // --- Tulipán oculto ---
    if (!Game.tulips['cita']) drawTulip(pg, this.tulip.x, this.tulip.y, 0.5);

    // --- Guía de descubrimiento + pista suave ---
    this.drawHints(pg);
    this.drawHUD(pg);
  }

  // Ella: vestido negro, pelo amarillo a medio despintar (raíz negra).
  drawGirl(pg, x, y, bg, hairAmt) {
    const a = Math.max(bg * 0.6, hairAmt);   // el pelo cobra color al hallarlo
    // pelo (raíz negra arriba, puntas amarillas cayendo)
    pg.fill(this.col(pg, '#3f3b46', '#e6c34e', a));   // amarillo despintado
    pg.rect(x - 4, y + 1, 3, 9); pg.rect(x + 3, y + 1, 3, 9);  // mechones a los lados
    pg.rect(x - 4, y, 10, 3);
    pg.fill(this.col(pg, '#2a2630', '#171420', Math.max(a, 0.4)));  // raíz negra
    pg.rect(x - 4, y - 1, 10, 3); pg.rect(x - 4, y + 1, 2, 4); pg.rect(x + 4, y + 1, 2, 4);
    // cara
    pg.fill(this.col(pg, '#5a5560', '#e8c3a0', bg));
    pg.rect(x - 2, y + 2, 6, 6);
    // vestido negro
    pg.fill(this.col(pg, '#26232c', '#17141c', Math.max(bg, 0.5)));
    pg.rect(x - 3, y + 8, 8, 11, 1);
  }

  // Él: silueta cálida que aparece al florecer.
  drawGuy(pg, x, y, a) {
    pg.fill(pg.color(90, 70, 60, 255 * a)); pg.rect(x - 1, y + 1, 3, 8);       // pelo/cabeza fondo
    pg.fill(pg.color(232, 195, 160, 255 * a)); pg.rect(x - 1, y + 2, 5, 6);    // cara
    pg.fill(pg.color(235, 165, 79, 255 * a)); pg.rect(x - 2, y + 8, 7, 11, 1); // cuerpo cálido
  }

  drawHints(pg) {
    // Señal de "aquí se puede mirar": brillo tenue al acercar el cursor a un detalle.
    const v = vMouse();
    for (const s of this.spots) {
      if (this.isFound(s.id)) continue;
      const d = dist(v.x, v.y, s.x, s.y);
      if (d < s.r + 8) {
        const p = (Math.sin(this.frame * 0.15) + 1) / 2;
        pg.noFill(); pg.stroke(pg.color(244, 236, 219, 30 + p * 60)); pg.strokeWeight(1);
        pg.ellipse(s.x, s.y, s.r * 2 + 3); pg.noStroke();
      }
    }
    // Pista tras un rato sin hallazgos: late un detalle pendiente.
    if (this.foundCount < this.spots.length && this.frame - this.lastFind > 480) {
      const s = this.spots.find(sp => !this.isFound(sp.id));
      if (s) {
        const p = (Math.sin(this.frame * 0.08) + 1) / 2;
        pg.noFill(); pg.stroke(pg.color(242, 200, 134, 40 + p * 70)); pg.strokeWeight(1);
        pg.ellipse(s.x, s.y, s.r * 2 + p * 5); pg.noStroke();
      }
    }
  }

  drawHUD(pg) {
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('RECUERDO 01 · OBSERVACIÓN', 10, 9);
    pg.fill(this.col(pg, '#8f89a9', this.pal.ink, Math.max(0.3, this.bloom)));
    pg.textSize(13); pg.text('La primera cita', 10, 19);

    pg.textAlign(RIGHT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('DETALLES ' + this.foundCount + '/' + this.spots.length, VIRTUAL_W - 10, 9);

    if (this.caption && this.frame - this.captionFrame < 150) {
      const a = Math.min(1, (150 - (this.frame - this.captionFrame)) / 40);
      pg.textAlign(CENTER, CENTER);
      pg.fill(pg.color(244, 236, 219, 255 * a)); pg.textSize(8);
      pg.text('· ' + this.caption + ' ·', VIRTUAL_W / 2, 200);
    }
    if (this.bloom >= 1) {
      const a = Math.min(1, (this.bloom - 0.9) / 0.1);
      pg.textAlign(CENTER, CENTER);
      pg.fill(pg.color(242, 200, 134, 255 * a)); pg.textSize(10);
      pg.text('y de repente, todo tenía color.', VIRTUAL_W / 2, 176);
    }
    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
  }

  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }
    if (!Game.tulips['cita'] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r) {
      Game.foundTulip('cita'); this.caption = 'un tulipán…'; this.captionFrame = this.frame; return;
    }
    for (const s of this.spots) {
      if (!this.isFound(s.id) && dist(v.x, v.y, s.x, s.y) <= s.r) {
        this.foundFrame[s.id] = this.frame; this.foundCount++;
        this.caption = s.label; this.captionFrame = this.frame; this.lastFind = this.frame;
        return;
      }
    }
  }
}
