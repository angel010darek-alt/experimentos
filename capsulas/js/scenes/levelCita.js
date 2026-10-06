// ============================================================
//  Nivel 1 — Observación · "La primera cita"
// ------------------------------------------------------------
//  Un pasillo de centro comercial (ref. real): techo de cristal
//  con LUZ FRÍA azulada arriba, tiendas con LUZ CÁLIDA ámbar
//  abajo, columnas y piso pulido que refleja. El Mixup, un café
//  con una mesa, el Cinépolis y más tiendas.
//
//  ELLA (vestido negro, pelo amarillo a medio despintar) camina
//  (A/D, flechas o toque). Mientras MÁS SE ACERCA A ÉL —silueta
//  cálida, aún sin rasgos—, más color toma el mundo. Al tocar
//  lugares aparecen recuerdos:
//    · Mixup       -> "compartimos muchas canciones"
//    · la mesa     -> "una mano nerviosa"
//    · las tiendas -> "ruido de fondo, solo te veo a ti"
//  Al llegar junto a él florece todo: "y de repente, todo tenía color."
// ============================================================

const FY = 150;          // línea del piso
const HIM_DETAIL = 0;    // 0 = silueta base; sube por nivel (más rasgos).

class CitaScene {
  enter() {
    this.pal = PALETTES.cita;
    this.frame = 0;
    this.moved = false;
    this.locked = false;
    this.bloom = 0;
    this.caption = null;
    this.captionFrame = -999;

    this.girl = { x: 46, y: 130 };
    this.targetX = 46;
    this.him = { x: 306, y: 128 };

    this.pois = [
      { id: 'mixup', x: 88,  found: false, text: 'compartimos muchas canciones' },
      { id: 'shops', x: 182, found: false, text: 'ruido de fondo, solo te veo a ti' },
      { id: 'table', x: 250, found: false, text: 'una mano nerviosa' },
    ];

    // focos de luz cálida (tiendas) -> glow + reflejo en el piso
    this.lights = [60, 120, 182, 250, 300];

    this.tulip = { x: 150, y: 120, r: 6 };
    this.backBtn = { x: 10, y: VIRTUAL_H - 22, w: 52, h: 13 };
    this.hoverBack = false;
  }

  poi(id) { return this.pois.find(p => p.id === id); }
  found(id) { return this.poi(id).found; }
  proximity() { return constrain(map(Math.abs(this.girl.x - this.him.x), 86, 18, 0, 1), 0, 1); }
  world() {
    const poiC = this.pois.filter(p => p.found).length / this.pois.length * 0.55;
    return Math.max(this.proximity(), poiC, this.bloom);
  }

  update() {
    this.frame++;
    this.hoverBack = pointInRect(vMouse(), this.backBtn);

    let kb = 0;
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) kb -= 1;
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) kb += 1;
    if (kb !== 0) {
      this.girl.x = constrain(this.girl.x + kb * 1.4, 36, this.him.x);
      this.targetX = this.girl.x; this.moved = true;
    } else {
      const dx = this.targetX - this.girl.x;
      if (Math.abs(dx) > 0.5) this.girl.x += constrain(dx, -1.15, 1.15);
    }

    for (const p of this.pois) {
      if (!p.found && Math.abs(this.girl.x - p.x) < 12) { p.found = true; this.caption = p.text; this.captionFrame = this.frame; }
    }
    if (Math.abs(this.girl.x - this.him.x) <= 18) this.locked = true;
    if (this.locked) {
      this.bloom = Math.min(1, this.bloom + 0.014);
      if (this.bloom >= 1 && !Game.isDone('cita')) Game.complete('cita');
    }
  }

  col(pg, g, c, a) { return pg.lerpColor(pg.color(g), pg.color(c), a); }

  draw(pg) {
    const w = this.world();
    pg.noStroke();

    // ---------- TECHO DE CRISTAL (luz fría) ----------
    pg.fill(this.col(pg, '#3b4048', '#9cc3e0', Math.max(0.35, w))); pg.rect(0, 0, VIRTUAL_W, 30);
    pg.fill(this.col(pg, '#454b54', '#b8d6ec', Math.max(0.3, w)));  pg.rect(0, 0, VIRTUAL_W, 10);
    // trusses / vigas en diagonal
    pg.stroke(this.col(pg, '#565e68', '#6f8ba6', Math.max(0.4, w))); pg.strokeWeight(1);
    for (let x = -20; x < VIRTUAL_W + 20; x += 22) { pg.line(x, 0, x + 16, 30); pg.line(x + 16, 0, x, 30); }
    pg.line(0, 30, VIRTUAL_W, 30);
    pg.noStroke();
    // haces de luz fría cayendo
    for (let i = 0; i < 4; i++) {
      const lx = 50 + i * 90;
      pg.fill(pg.color(180, 210, 236, 14 + 20 * w));
      pg.quad(lx, 30, lx + 10, 30, lx + 40, FY, lx + 16, FY);
    }

    // ---------- SEGUNDO NIVEL / BARANDAL ----------
    pg.fill(this.col(pg, '#2b2932', '#4a4250', w)); pg.rect(0, 30, VIRTUAL_W, 18);
    pg.stroke(this.col(pg, '#4a4e58', '#b8c2cc', Math.max(0.4, w))); pg.strokeWeight(1);
    pg.line(0, 40, VIRTUAL_W, 40); pg.line(0, 46, VIRTUAL_W, 46);
    for (let x = 8; x < VIRTUAL_W; x += 14) pg.line(x, 40, x, 46);
    pg.noStroke();

    // ---------- FACHADAS DE TIENDAS (luz cálida) ----------
    pg.fill(this.col(pg, '#272430', '#4a3a34', w)); pg.rect(0, 48, VIRTUAL_W, FY - 48);
    // Cinépolis (letrero azul, logo amarillo)
    this.storefront(pg, 16, '#3a2f2e', w);
    pg.fill(this.col(pg, '#2f3340', '#1f49a8', w)); pg.rect(20, 56, 70, 14, 1);
    pg.fill(this.col(pg, '#4a4430', '#f2c230', w)); pg.rect(24, 59, 7, 8);           // logo
    pg.fill(this.col(pg, '#5a5f6a', '#eaf0ff', w)); pg.textAlign(LEFT, CENTER); pg.textSize(7);
    pg.text('cinepolis', 34, 63);
    // Mixup
    this.storefront(pg, 110, '#48382f', w);
    pg.fill(this.col(pg, '#33303a', this.pal.accent, Math.max(w, this.found('mixup') ? 1 : 0))); pg.rect(112, 56, 56, 9, 1);
    pg.fill(this.col(pg, '#5a5560', '#1a1420', w)); pg.textAlign(CENTER, CENTER); pg.textSize(7); pg.text('mix up', 140, 60);
    const amDisc = this.found('mixup') ? 1 : w * 0.5;
    pg.fill(this.col(pg, '#3f3b46', '#e79bb6', amDisc)); pg.ellipse(140, 92, 12);
    pg.fill(this.col(pg, '#3f3b46', '#241a2c', amDisc)); pg.ellipse(140, 92, 3);
    // Otras tiendas
    this.storefront(pg, 198, '#4a3a30', w);
    this.storefront(pg, 262, '#44362f', w);
    const ash = this.found('shops') ? 1 : w * 0.5;
    pg.fill(this.col(pg, '#3a3742', this.pal.a3, ash)); pg.rect(206, 56, 40, 6, 1);
    pg.fill(this.col(pg, '#3a3742', '#d98a6a', ash)); pg.rect(270, 58, 34, 5, 1);

    // ---------- COLUMNAS ----------
    for (const cx of [100, 190, 258]) {
      pg.fill(this.col(pg, '#3f444c', '#8d97a1', Math.max(0.4, w))); pg.rect(cx, 30, 8, FY - 30);
      pg.fill(this.col(pg, '#4a505a', '#aab4bd', Math.max(0.4, w))); pg.rect(cx, 30, 3, FY - 30); // brillo
    }

    // ---------- PISO PULIDO + REFLEJOS ----------
    pg.fill(this.col(pg, '#232027', '#b28d60', w)); pg.rect(0, FY, VIRTUAL_W, VIRTUAL_H - FY);
    pg.fill(this.col(pg, '#1d1a20', '#966f45', w)); pg.rect(0, FY, VIRTUAL_W, 3); // junta
    // reflejos cálidos verticales bajo cada luz
    for (const lx of this.lights) {
      for (let k = 0; k < 4; k++) {
        pg.fill(pg.color(242, 200, 134, (20 - k * 4) * Math.max(0.25, w)));
        pg.rect(lx - 3 + k, FY + 2, 6 - k * 1.2, VIRTUAL_H - FY);
      }
    }
    // líneas de perspectiva del piso
    pg.stroke(this.col(pg, '#1e1b22', '#8a6a45', w)); pg.strokeWeight(1);
    for (let x = 0; x < VIRTUAL_W; x += 28) pg.line(x, FY, x - 26, VIRTUAL_H);
    pg.noStroke();

    // ---------- GLOW CÁLIDO de cada tienda ----------
    for (const lx of this.lights) {
      for (let r = 0; r < 3; r++) { pg.fill(pg.color(242, 200, 134, (18 - r * 5) * Math.max(0.3, w))); pg.ellipse(lx, 70, 34 + r * 16, 24 + r * 12); }
    }

    // ---------- Planta decorativa (palmera) ----------
    this.drawPalm(pg, 190, FY, w);

    // ---------- Café: mesa (POI table) ----------
    const at = this.found('table') ? 1 : w * 0.5;
    pg.fill(this.col(pg, '#2e2a30', '#5a4030', w)); pg.rect(244, 138, 4, 12);
    pg.fill(this.col(pg, '#312b30', '#7a5536', at)); pg.ellipse(250, 136, 22, 6);

    // ---------- Personajes ----------
    this.drawHim(pg, this.him.x, this.him.y, w, HIM_DETAIL);
    this.drawGirl(pg, this.girl.x, this.girl.y, w);

    // ---------- Tulipán oculto ----------
    if (!Game.tulips['cita']) drawTulip(pg, this.tulip.x, this.tulip.y, 0.5);

    // ---------- Viñeta sutil ----------
    pg.fill(pg.color(10, 8, 14, 60)); pg.rect(0, 0, VIRTUAL_W, 6); pg.rect(0, VIRTUAL_H - 6, VIRTUAL_W, 6);

    this.drawHUD(pg);
  }

  // Fachada genérica con vitrina cálida iluminada.
  storefront(pg, x, warmHex, w) {
    pg.fill(this.col(pg, '#201d26', warmHex, w)); pg.rect(x, 48, 58, FY - 48);
    pg.fill(this.col(pg, '#2c2833', '#6a4f3a', w)); pg.rect(x + 4, 74, 50, FY - 80);     // vitrina
    pg.fill(pg.color(242, 200, 134, 40 * Math.max(0.25, w))); pg.rect(x + 4, 74, 50, 10); // luz interior
  }

  drawPalm(pg, x, baseY, w) {
    pg.fill(this.col(pg, '#2e2a2e', '#5a4632', w)); pg.rect(x - 1, baseY - 20, 3, 20);  // tronco
    const g = this.col(pg, '#34383a', '#5f8a46', w); pg.stroke(g); pg.strokeWeight(1);
    for (let a = -2; a <= 2; a++) pg.line(x, baseY - 20, x + a * 6, baseY - 30 + Math.abs(a) * 3);
    pg.noStroke();
  }

  drawGirl(pg, x, y, w) {
    pg.fill(this.col(pg, '#3f3b46', '#e6c34e', Math.max(w * 0.7, 0.35)));
    pg.rect(x - 4, y + 1, 3, 9); pg.rect(x + 3, y + 1, 3, 9); pg.rect(x - 4, y, 10, 3);
    pg.fill('#171420'); pg.rect(x - 4, y - 1, 10, 3);
    pg.fill(this.col(pg, '#5a5560', '#e8c3a0', w)); pg.rect(x - 2, y + 2, 6, 6);
    pg.fill('#17141c'); pg.rect(x - 3, y + 8, 8, 11, 1);
    // reflejo tenue en el piso
    if (y + 20 > FY) { pg.fill(pg.color(23, 20, 28, 70)); pg.rect(x - 3, FY + 1, 8, 4); }
  }

  drawHim(pg, x, y, w, detail) {
    if (w > 0) { pg.fill(pg.color(242, 200, 134, 60 * w)); pg.ellipse(x + 1, y + 10, 30 + 16 * w, 40 + 16 * w); }
    const body = this.col(pg, '#2a2028', '#3a2622', Math.max(0.4, w));
    pg.fill(body); pg.rect(x - 3, y + 8, 8, 12, 1); pg.rect(x - 1, y + 1, 6, 7, 1); pg.rect(x - 2, y, 8, 3);
    pg.stroke(pg.color(242, 200, 134, 120 + 100 * w)); pg.strokeWeight(1);
    pg.line(x - 3, y + 9, x - 3, y + 19); pg.line(x - 1, y + 2, x - 1, y + 7);
    pg.noStroke();
    if (detail >= 1) { pg.fill('#e8c3a0'); pg.rect(x, y + 3, 4, 3); }
    if (y + 20 > FY) { pg.fill(pg.color(23, 20, 28, 70)); pg.rect(x - 3, FY + 1, 8, 4); }
  }

  drawHUD(pg) {
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7); pg.text('RECUERDO 01 · OBSERVACIÓN', 10, 9);
    pg.fill(this.col(pg, '#8f89a9', this.pal.ink, Math.max(0.3, this.world())));
    pg.textSize(13); pg.text('La primera cita', 10, 19);

    if (!this.moved && (this.frame % 90) < 60) {
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(246, 236, 217, 150)); pg.textSize(8);
      pg.text('muévete con A / D  o  ← →  para acercarte a él', VIRTUAL_W / 2, 40);
    }
    if (this.caption && this.frame - this.captionFrame < 170) {
      const a = Math.min(1, (170 - (this.frame - this.captionFrame)) / 50);
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(246, 236, 217, 255 * a)); pg.textSize(9);
      pg.text('“' + this.caption + '”', VIRTUAL_W / 2, 198);
    }
    if (this.bloom >= 1) {
      const a = Math.min(1, (this.bloom - 0.9) / 0.1);
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(242, 200, 134, 255 * a)); pg.textSize(10);
      pg.text('y de repente, todo tenía color.', VIRTUAL_W / 2, 176);
    }
    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
  }

  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }
    if (!Game.tulips['cita'] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r) {
      Game.foundTulip('cita'); this.caption = 'un tulipán…'; this.captionFrame = this.frame; return;
    }
    this.targetX = constrain(v.x, 36, this.him.x); this.moved = true;
  }
}
