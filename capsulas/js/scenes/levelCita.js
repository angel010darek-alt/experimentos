// ============================================================
//  Nivel 1 — Observación · "La primera cita"
// ------------------------------------------------------------
//  La plaza real: el Mixup, una mesa con dos sillas, más tiendas.
//
//  ELLA (vestido negro, pelo amarillo a medio despintar) camina
//  por la plaza: se toca dónde ir y ella se acerca. Y aquí está
//  el corazón nuevo del nivel: MIENTRAS MÁS SE ACERCA A ÉL, más
//  color toma el mundo. Él es una silueta cálida (no tenebrosa),
//  todavía sin rasgos claros — cada nivel se irá aclarando.
//
//  Al tocar lugares aparecen recuerdos en texto:
//    · Mixup       -> "compartimos muchas canciones"
//    · la mesa     -> "una mano nerviosa"
//    · las tiendas -> "ruido de fondo, solo te veo a ti"
//  Al llegar junto a él, el mundo florece del todo:
//    "y de repente, todo tenía color."
// ============================================================

const HORIZON = 150;
const HIM_DETAIL = 0; // 0 = silueta base. Sube en niveles posteriores (más rasgos).

class CitaScene {
  enter() {
    this.pal = PALETTES.cita;
    this.frame = 0;
    this.moved = false;
    this.locked = false;       // llegó junto a él
    this.bloom = 0;            // florecer final
    this.caption = null;
    this.captionFrame = -999;

    this.girl = { x: 48, y: 116 };
    this.targetX = 48;
    this.him = { x: 296, y: 114 };

    // Lugares con recuerdo (se revelan al acercarse ella).
    this.pois = [
      { id: 'mixup', x: 56,  found: false, text: 'compartimos muchas canciones' },
      { id: 'shops', x: 165, found: false, text: 'ruido de fondo, solo te veo a ti' },
      { id: 'table', x: 268, found: false, text: 'una mano nerviosa' },
    ];

    this.tulip = { x: 118, y: 132, r: 6 };
    this.backBtn = { x: 10, y: VIRTUAL_H - 22, w: 52, h: 13 };
    this.hoverBack = false;
  }

  poi(id) { return this.pois.find(p => p.id === id); }
  found(id) { return this.poi(id).found; }

  // Proximidad a él (0 lejos … 1 junto a él).
  proximity() {
    const d = Math.abs(this.girl.x - this.him.x);
    return constrain(map(d, 80, 18, 0, 1), 0, 1);
  }
  // Color del mundo: lo mayor entre acercarse a él, recuerdos vistos y floración.
  world() {
    const poiC = this.pois.filter(p => p.found).length / this.pois.length * 0.55;
    return Math.max(this.proximity(), poiC, this.bloom);
  }

  update() {
    this.frame++;
    this.hoverBack = pointInRect(vMouse(), this.backBtn);

    // Caminar: teclado (A/D o flechas) tiene prioridad; si no, hacia el toque.
    let kb = 0;
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) kb -= 1;   // A / ←
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) kb += 1;  // D / →
    if (kb !== 0) {
      this.girl.x = constrain(this.girl.x + kb * 1.4, 40, this.him.x);
      this.targetX = this.girl.x;
      this.moved = true;
    } else {
      const dx = this.targetX - this.girl.x;
      if (Math.abs(dx) > 0.5) this.girl.x += constrain(dx, -1.15, 1.15);
    }

    // Revelar recuerdos al pasar cerca.
    for (const p of this.pois) {
      if (!p.found && Math.abs(this.girl.x - p.x) < 12) {
        p.found = true; this.caption = p.text; this.captionFrame = this.frame;
      }
    }

    // Llegar junto a él -> florecer y completar.
    if (Math.abs(this.girl.x - this.him.x) <= 18) this.locked = true;
    if (this.locked) {
      this.bloom = Math.min(1, this.bloom + 0.014);
      if (this.bloom >= 1 && !Game.isDone('cita')) Game.complete('cita');
    }
  }

  col(pg, grayHex, colorHex, a) { return pg.lerpColor(pg.color(grayHex), pg.color(colorHex), a); }

  draw(pg) {
    const w = this.world();

    // --- Cielo ---
    pg.noStroke();
    pg.fill(this.col(pg, '#26232c', '#4a2f3f', w)); pg.rect(0, 0, VIRTUAL_W, HORIZON * 0.55);
    pg.fill(this.col(pg, '#2b2730', '#7a4a47', w)); pg.rect(0, HORIZON * 0.55, VIRTUAL_W, HORIZON - HORIZON * 0.55);
    if (this.bloom > 0) { pg.fill(pg.color(242, 200, 134, 80 * this.bloom)); pg.rect(0, HORIZON - 30, VIRTUAL_W, 30); }

    // --- Suelo ---
    pg.fill(this.col(pg, '#232028', '#3a2b33', w)); pg.rect(0, HORIZON, VIRTUAL_W, VIRTUAL_H - HORIZON);
    pg.stroke(this.col(pg, '#1e1b22', '#2f232b', w)); pg.strokeWeight(1);
    for (let x = 0; x < VIRTUAL_W; x += 24) pg.line(x, HORIZON, x - 20, VIRTUAL_H);
    pg.noStroke();

    // --- Mixup (izquierda) ---
    const am = this.found('mixup') ? 1 : w * 0.5;
    pg.fill(this.col(pg, '#2c2830', '#3a2f3a', w)); pg.rect(20, 78, 72, 72);
    pg.fill(this.col(pg, '#33303a', this.pal.accent, am)); pg.rect(20, 74, 72, 8);
    pg.fill(this.col(pg, '#4a4652', '#12111c', w)); pg.textAlign(CENTER, CENTER); pg.textSize(7);
    pg.text('mix up', 56, 78);
    pg.fill(this.col(pg, '#3a3742', '#241a2c', w)); pg.rect(30, 96, 52, 40);
    pg.fill(this.col(pg, '#3f3b46', '#e79bb6', am)); pg.ellipse(56, 108, 12);
    pg.fill(this.col(pg, '#3f3b46', '#241a2c', am)); pg.ellipse(56, 108, 3);

    // --- Otras tiendas (fondo medio) ---
    const ash = this.found('shops') ? 1 : w * 0.5;
    pg.fill(this.col(pg, '#2a262e', '#34283a', w)); pg.rect(126, 86, 40, 64);
    pg.fill(this.col(pg, '#2c2830', '#3a2e42', w)); pg.rect(170, 92, 40, 58);
    pg.fill(this.col(pg, '#3a3742', this.pal.a2, ash)); pg.rect(132, 92, 20, 5);
    pg.fill(this.col(pg, '#3a3742', this.pal.a3, ash)); pg.rect(176, 98, 18, 4);
    if (ash > 0) { pg.fill(pg.color(224, 138, 160, 180 * ash)); pg.rect(126, 100, 40, 3); }

    // --- Mesa con dos sillas (derecha), sin vasos ---
    const at = this.found('table') ? 1 : w * 0.5;
    pg.fill(this.col(pg, '#2e2a30', '#5a4030', w));
    pg.rect(246, 132, 5, 16); pg.rect(246, 126, 5, 3);   // silla de ella
    pg.rect(300, 132, 5, 16); pg.rect(300, 126, 5, 3);   // silla de él
    pg.fill(this.col(pg, '#312b30', '#6a4a30', at));
    pg.rect(262, 134, 44, 4); pg.rect(280, 138, 4, 12);

    // --- ÉL: silueta cálida (glow que crece al acercarse ella) ---
    this.drawHim(pg, this.him.x, this.him.y, w, HIM_DETAIL);

    // --- ELLA (personaje) ---
    this.drawGirl(pg, this.girl.x, this.girl.y, w);

    // --- Tulipán oculto ---
    if (!Game.tulips['cita']) drawTulip(pg, this.tulip.x, this.tulip.y, 0.5);

    this.drawHUD(pg);
  }

  // ELLA: vestido negro, pelo amarillo a medio despintar (raíz negra).
  drawGirl(pg, x, y, w) {
    pg.fill(this.col(pg, '#3f3b46', '#e6c34e', Math.max(w * 0.7, 0.35))); // pelo amarillo despintado
    pg.rect(x - 4, y + 1, 3, 9); pg.rect(x + 3, y + 1, 3, 9); pg.rect(x - 4, y, 10, 3);
    pg.fill('#171420'); pg.rect(x - 4, y - 1, 10, 3);                     // raíz negra
    pg.fill(this.col(pg, '#5a5560', '#e8c3a0', w)); pg.rect(x - 2, y + 2, 6, 6);  // cara
    pg.fill('#17141c'); pg.rect(x - 3, y + 8, 8, 11, 1);                  // vestido negro
  }

  // ÉL: silueta cálida y agradable. detail = cuántos rasgos se ven (sube por nivel).
  drawHim(pg, x, y, w, detail) {
    // halo cálido que crece con la cercanía de ella
    if (w > 0) { pg.noStroke(); pg.fill(pg.color(242, 200, 134, 60 * w)); pg.ellipse(x + 1, y + 10, 30 + 16 * w, 40 + 16 * w); }
    // cuerpo: negro cálido (nunca frío/tenebroso)
    const body = this.col(pg, '#2a2028', '#3a2622', Math.max(0.4, w));
    pg.fill(body); pg.rect(x - 3, y + 8, 8, 12, 1);   // torso
    pg.fill(body); pg.rect(x - 1, y + 1, 6, 7, 1);     // cabeza
    pg.rect(x - 2, y, 8, 3);                            // pelo (bulto)
    // borde cálido iluminado del lado de ella (invita, no asusta)
    pg.stroke(pg.color(242, 200, 134, 120 + 100 * w)); pg.strokeWeight(1);
    pg.line(x - 3, y + 9, x - 3, y + 19); pg.line(x - 1, y + 2, x - 1, y + 7);
    pg.noStroke();
    // rasgos que aparecerán en niveles posteriores (detail > 0)
    if (detail >= 1) { pg.fill('#e8c3a0'); pg.rect(x, y + 3, 4, 3); }  // cara (nivel 2+)
  }

  drawHUD(pg) {
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('RECUERDO 01 · OBSERVACIÓN', 10, 9);
    pg.fill(this.col(pg, '#8f89a9', this.pal.ink, Math.max(0.3, this.world())));
    pg.textSize(13); pg.text('La primera cita', 10, 19);

    // Pista inicial
    if (!this.moved && (this.frame % 90) < 60) {
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(244, 236, 219, 150)); pg.textSize(8);
      pg.text('muévete con A / D  o  ← →  para acercarte a él', VIRTUAL_W / 2, 40);
    }

    // Recuerdo en texto
    if (this.caption && this.frame - this.captionFrame < 170) {
      const a = Math.min(1, (170 - (this.frame - this.captionFrame)) / 50);
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(244, 236, 219, 255 * a)); pg.textSize(9);
      pg.text('“' + this.caption + '”', VIRTUAL_W / 2, 198);
    }

    // Frase final
    if (this.bloom >= 1) {
      const a = Math.min(1, (this.bloom - 0.9) / 0.1);
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(242, 200, 134, 255 * a)); pg.textSize(10);
      pg.text('y de repente, todo tenía color.', VIRTUAL_W / 2, 174);
    }

    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
  }

  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }
    if (!Game.tulips['cita'] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r) {
      Game.foundTulip('cita'); this.caption = 'un tulipán…'; this.captionFrame = this.frame; return;
    }
    // Caminar: fija a dónde va ella (clamp dentro de la plaza).
    this.targetX = constrain(v.x, 40, this.him.x);
    this.moved = true;
  }
}
