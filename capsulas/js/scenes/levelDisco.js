// ============================================================
//  Nivel 2 — Reconstruir · "Construir lo nuestro"
// ------------------------------------------------------------
//  Se reconstruye la portada de "Cry Baby" (Melanie Martinez) —
//  el disco que él le regaló — en pixel art, pieza a pieza, con
//  encaje MAGNÉTICO y sin castigo. Al completarla, el vinilo
//  sale girando y "suena" (ondas + notas), con la frase:
//    "poco a poco, lo nuestro."
//
//  Reconstruir pieza a pieza = construir la relación despacio.
// ============================================================

const COVER_W = 96, COVER_H = 96;
const PCOLS = 3, PROWS = 2;              // 6 piezas
const PW = COVER_W / PCOLS, PH = COVER_H / PROWS;  // 32 x 48
const SNAP = 22;                          // encaje magnético generoso

class DiscoScene {
  enter() {
    this.pal = PALETTES.disco;
    this.frame = 0;
    this.placedCount = 0;
    this.done = false; this.doneFrame = 0; this.spin = 0;
    this.dragging = null; this.dragOff = { x: 0, y: 0 };

    // Portada renderizada una vez a un buffer; las piezas son recortes de ella.
    this.cover = createGraphics(COVER_W, COVER_H);
    this.cover.noSmooth();
    this.cover.textFont('monospace');
    this.drawCryBaby(this.cover);

    this.coverX = 152; this.coverY = 44;   // marco donde se arma (centrado)

    const seed = [
      { x: 44, y: 54 }, { x: 330, y: 56 }, { x: 40, y: 150 },
      { x: 332, y: 150 }, { x: 150, y: 176 }, { x: 250, y: 178 },
    ];
    this.pieces = [];
    let i = 0;
    for (let r = 0; r < PROWS; r++) for (let c = 0; c < PCOLS; c++) {
      this.pieces.push({
        sx: c * PW, sy: r * PH,
        tx: this.coverX + c * PW, ty: this.coverY + r * PH,
        cur: { x: seed[i].x, y: seed[i].y },
        placed: false,
      });
      i++;
    }

    this.backBtn = { x: 10, y: VIRTUAL_H - 22, w: 52, h: 13 };
    this.hoverBack = false;
    this.tulip = { x: 24, y: 110, r: 6 };
  }

  update() {
    this.frame++;
    this.hoverBack = pointInRect(vMouse(), this.backBtn);
    if (this.done) { this.spin += 0.05; this.doneFrame++; }
  }

  // -------- Portada "Cry Baby" en pixel art --------
  drawCryBaby(g) {
    g.noStroke();
    // cielo rosa (gradiente)
    const top = g.color('#f2d2e3'), bot = g.color('#e3b2cb');
    for (let i = 0; i < 8; i++) { g.fill(g.lerpColor(top, bot, i / 7)); g.rect(0, i * 12, COVER_W, 13); }
    // nubes suaves arriba
    g.fill(255, 255, 255, 150);
    g.ellipse(18, 18, 26, 12); g.ellipse(78, 14, 30, 12); g.ellipse(50, 10, 22, 9);
    // título CRYBABY (globos azules)
    g.textAlign(CENTER, CENTER); g.textStyle(BOLD); g.textSize(12);
    g.fill('#1f49b0'); g.text('CRYBABY', 48, 17);
    g.fill(255, 255, 255, 90); g.textSize(12); g.text('CRYBABY', 47, 16); // brillo globo
    g.textStyle(NORMAL);
    // ella: pelo mitad rosa / mitad negro
    const hx = 48, hy = 36;
    g.fill('#f0a7c6'); g.rect(hx - 6, hy - 5, 6, 13);     // izq rosa
    g.fill('#1a1620'); g.rect(hx, hy - 5, 6, 13);         // der negro
    g.fill('#f0cdb0'); g.rect(hx - 4, hy, 8, 8);          // cara
    g.fill('#9fc0e8'); g.rect(hx - 3, hy + 3, 2, 1); g.rect(hx + 1, hy + 3, 2, 1); // ojos/azul
    g.fill('#c0392b'); g.rect(hx - 1, hy + 5, 3, 1);      // labios
    g.fill('#5a86c4'); g.rect(hx + 3, hy + 6, 1, 3);      // lágrima
    // nube-vestido
    g.fill(255);
    g.ellipse(hx, hy + 16, 30, 16); g.ellipse(hx - 10, hy + 15, 16, 12); g.ellipse(hx + 10, hy + 15, 16, 12);
    // lágrimas cayendo
    g.fill('#5a86c4');
    for (let k = 0; k < 6; k++) { const dx = 26 + k * 9, dy = 66 + (k % 2) * 6; g.rect(dx, dy, 2, 3); g.rect(dx, dy + 6, 2, 3); }
    // agua + casitas
    g.fill('#23466f'); g.rect(0, 82, COVER_W, 14);
    const houses = [['#e7b7cb', 8], ['#bcd1b0', 30], ['#d9c38a', 58], ['#cdb0d6', 80]];
    for (const [col, x] of houses) { g.fill(col); g.rect(x, 78, 12, 8); g.fill('#5a4a3a'); g.rect(x, 76, 12, 2); }
  }

  draw(pg) {
    pg.background(this.pal.bg);

    // marco guía (dónde se arma la portada)
    pg.noFill(); pg.stroke(pg.color(240, 217, 226, 50)); pg.strokeWeight(1);
    pg.rect(this.coverX - 1, this.coverY - 1, COVER_W + 2, COVER_H + 2);
    pg.stroke(pg.color(240, 217, 226, 22));
    for (let c = 1; c < PCOLS; c++) pg.line(this.coverX + c * PW, this.coverY, this.coverX + c * PW, this.coverY + COVER_H);
    for (let r = 1; r < PROWS; r++) pg.line(this.coverX, this.coverY + r * PH, this.coverX + COVER_W, this.coverY + r * PH);
    pg.noStroke();

    // vinilo que asoma detrás al completar
    if (this.done) {
      const vx = this.coverX + COVER_W - 8 + Math.min(34, this.doneFrame * 0.8), vy = this.coverY + COVER_H / 2;
      pg.push(); pg.translate(vx, vy); pg.rotate(this.spin);
      pg.fill('#1b1620'); pg.ellipse(0, 0, 60);
      pg.stroke(pg.color(207, 127, 157, 80)); pg.strokeWeight(1); pg.noFill();
      pg.ellipse(0, 0, 44); pg.ellipse(0, 0, 30); pg.noStroke();
      pg.fill(this.pal.accent); pg.ellipse(0, 0, 14); pg.fill('#1b1620'); pg.ellipse(0, 0, 3);
      pg.pop();
      // ondas + notas
      for (let k = 0; k < 3; k++) { const rr = (this.doneFrame * 0.8 + k * 26) % 80; pg.noFill(); pg.stroke(pg.color(231, 155, 182, map(rr, 0, 80, 120, 0))); pg.strokeWeight(1); pg.ellipse(this.coverX + COVER_W / 2, this.coverY + COVER_H / 2, 80 + rr); }
      pg.noStroke(); pg.fill(this.pal.a2); pg.textSize(9);
      pg.text('♪', this.coverX - 10, this.coverY + 20 - (this.doneFrame % 40) * 0.3);
      pg.text('♫', this.coverX + COVER_W + 8, this.coverY + 30 - (this.doneFrame % 50) * 0.3);
    }

    // piezas colocadas (forman la portada)
    for (const p of this.pieces) if (p.placed) pg.image(this.cover, p.tx, p.ty, PW, PH, p.sx, p.sy, PW, PH);

    // piezas sueltas (dispersas / en arrastre)
    for (const p of this.pieces) {
      if (p.placed) continue;
      if (this.dragging === p) { pg.fill(0, 0, 0, 70); pg.rect(p.cur.x + 2, p.cur.y + 3, PW, PH); }
      pg.image(this.cover, p.cur.x, p.cur.y, PW, PH, p.sx, p.sy, PW, PH);
      pg.noFill(); pg.stroke(pg.color(240, 217, 226, 60)); pg.strokeWeight(1); pg.rect(p.cur.x, p.cur.y, PW, PH); pg.noStroke();
    }

    if (!Game.tulips['disco']) drawTulip(pg, this.tulip.x, this.tulip.y, 0.5);
    this.drawHUD(pg);
  }

  drawHUD(pg) {
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7); pg.text('RECUERDO 02 · RECONSTRUIR', 10, 9);
    pg.fill(this.pal.ink); pg.textSize(13); pg.text('Construir lo nuestro', 10, 19);
    pg.textAlign(RIGHT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7); pg.text('PIEZAS ' + this.placedCount + '/' + this.pieces.length, VIRTUAL_W - 10, 9);
    if (this.done) {
      const a = Math.min(1, this.doneFrame / 40);
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(240, 217, 226, 255 * a)); pg.textSize(9);
      pg.text('poco a poco, lo nuestro.', VIRTUAL_W / 2, VIRTUAL_H - 34);
    }
    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
  }

  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }
    if (!Game.tulips['disco'] && dist(v.x, v.y, this.tulip.x, this.tulip.y) <= this.tulip.r) { Game.foundTulip('disco'); return; }
    // tomar la pieza suelta superior bajo el cursor
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      if (p.placed) continue;
      if (v.x >= p.cur.x && v.x <= p.cur.x + PW && v.y >= p.cur.y && v.y <= p.cur.y + PH) {
        this.dragging = p; this.dragOff = { x: p.cur.x - v.x, y: p.cur.y - v.y };
        this.pieces.push(this.pieces.splice(i, 1)[0]); // traer al frente
        return;
      }
    }
  }

  mouseDragged(v) {
    if (this.dragging) { this.dragging.cur.x = v.x + this.dragOff.x; this.dragging.cur.y = v.y + this.dragOff.y; }
  }

  mouseReleased() {
    if (!this.dragging) return;
    const p = this.dragging;
    if (dist(p.cur.x, p.cur.y, p.tx, p.ty) <= SNAP) {
      p.placed = true; this.placedCount++;
      if (this.placedCount >= this.pieces.length && !this.done) { this.done = true; this.doneFrame = 0; Game.complete('disco'); }
    }
    this.dragging = null;
  }
}
