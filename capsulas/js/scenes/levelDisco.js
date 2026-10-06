// ============================================================
//  Nivel 2 — Reconstruir · "Construir lo nuestro"
// ------------------------------------------------------------
//  El Mixup como TIENDA CAMINABLE. Ella recorre la tienda
//  (A/D, flechas o toque; la cámara la sigue) entre secciones
//  —Rock, Indie, En español, Pop— hojeando discos de los
//  artistas que comparten. Las 6 piezas de la portada de
//  "Cry Baby" están REPARTIDAS por toda la tienda: hay que
//  explorarla. Con las 6, se arma la portada en el mostrador
//  y el vinilo gira y suena:  "poco a poco, lo nuestro."
// ============================================================

const COVER_W = 96, COVER_H = 96;
const PCOLS = 3, PROWS = 2;
const PW = COVER_W / PCOLS, PH = COVER_H / PROWS;
const SNAP = 22;
const DFY = 152;                 // piso de la tienda
const WORLD_W = 720;             // la tienda es más ancha que la pantalla
const REACH = 58;                // alcance para hojear un disco

const DISCO_ARTISTS = [
  'Deftones', 'Jeff Buckley', 'Radiohead', 'Enjambre', 'The Cure',
  'Cigarettes After Sex', 'TV Girl', 'The Smiths', 'Lana Del Rey',
  'The Marías', 'Weezer', 'Melanie Martinez',
];
const SLEEVE_COLS = ['#8a5a6e', '#5a6e8a', '#6e8a5a', '#8a7a5a', '#7a5a8a', '#5a8a7e'];
const SECTIONS = [
  { label: 'ROCK',        cx: 90 },
  { label: 'INDIE',       cx: 260 },
  { label: 'EN ESPAÑOL',  cx: 430 },
  { label: 'POP',         cx: 600 },
];

class DiscoScene {
  enter() {
    this.pal = PALETTES.disco;
    this.frame = 0;
    this.phase = 'search';
    this.caption = null; this.captionFrame = -999;

    this.cover = createGraphics(COVER_W, COVER_H);
    this.cover.noSmooth(); this.cover.textFont('monospace');
    this.drawCryBaby(this.cover);
    this.coverX = 144; this.coverY = 38;

    // Ella camina por el mundo (coords del mundo).
    this.girl = { x: 60, y: 128 };
    this.targetX = 60;
    this.camX = 0;
    this.moved = false;

    // Discos repartidos: 3 por sección (12), 6 esconden pieza.
    const artists = [...DISCO_ARTISTS];
    for (let i = artists.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [artists[i], artists[j]] = [artists[j], artists[i]]; }
    const idx = [...Array(12).keys()];
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const pieceOf = {}; idx.slice(0, 6).forEach((slot, k) => pieceOf[slot] = k);

    this.records = [];
    let n = 0;
    for (const sec of SECTIONS) {
      for (let k = -1; k <= 1; k++) {
        this.records.push({
          x: sec.cx + k * 38 - 15, y: 94, w: 30, h: 38,
          artist: artists[n], color: SLEEVE_COLS[n % SLEEVE_COLS.length],
          flipped: false, hasPiece: pieceOf[n] !== undefined, pieceIndex: pieceOf[n], collected: false, flip: 0,
        });
        n++;
      }
    }
    this.piecesFound = 0;

    // Piezas para la fase de armar.
    this.pieces = [];
    for (let r = 0; r < PROWS; r++) for (let c = 0; c < PCOLS; c++)
      this.pieces.push({ sx: c * PW, sy: r * PH, tx: this.coverX + c * PW, ty: this.coverY + r * PH, cur: { x: 0, y: 0 }, placed: false });
    this.placedCount = 0; this.done = false; this.doneFrame = 0; this.spin = 0;
    this.dragging = null; this.dragOff = { x: 0, y: 0 };

    this.backBtn = { x: 10, y: VIRTUAL_H - 22, w: 52, h: 13 };
    this.hoverBack = false;
    this.tulip = { x: 540, y: 64, r: 6 };   // en el mundo (pared)
  }

  update() {
    this.frame++;
    this.hoverBack = pointInRect(vMouse(), this.backBtn);
    for (const rec of this.records) if (rec.flipped && rec.flip < 1) rec.flip = Math.min(1, rec.flip + 0.15);

    if (this.phase === 'search') {
      let kb = 0;
      if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) kb -= 1;
      if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) kb += 1;
      if (kb !== 0) { this.girl.x = constrain(this.girl.x + kb * 1.35, 20, WORLD_W - 20); this.targetX = this.girl.x; this.moved = true; }
      else { const dx = this.targetX - this.girl.x; if (Math.abs(dx) > 0.5) this.girl.x += constrain(dx, -1.3, 1.3); }
      this.camX = constrain(this.girl.x - VIRTUAL_W / 2, 0, WORLD_W - VIRTUAL_W);
    }
    if (this.done) { this.spin += 0.05; this.doneFrame++; }
  }

  startBuild() {
    this.phase = 'build';
    const seed = [{ x: 40, y: 150 }, { x: 110, y: 176 }, { x: 180, y: 150 }, { x: 250, y: 178 }, { x: 310, y: 150 }, { x: 330, y: 182 }];
    this.pieces.forEach((p, i) => { p.cur.x = seed[i].x; p.cur.y = seed[i].y; });
  }

  drawCryBaby(g) {
    g.noStroke();
    const top = g.color('#f2d2e3'), bot = g.color('#e3b2cb');
    for (let i = 0; i < 8; i++) { g.fill(g.lerpColor(top, bot, i / 7)); g.rect(0, i * 12, COVER_W, 13); }
    g.fill(255, 255, 255, 150); g.ellipse(18, 18, 26, 12); g.ellipse(78, 14, 30, 12); g.ellipse(50, 10, 22, 9);
    g.textAlign(CENTER, CENTER); g.textStyle(BOLD); g.textSize(12);
    g.fill('#1f49b0'); g.text('CRYBABY', 48, 17); g.fill(255, 255, 255, 90); g.text('CRYBABY', 47, 16); g.textStyle(NORMAL);
    const hx = 48, hy = 36;
    g.fill('#f0a7c6'); g.rect(hx - 6, hy - 5, 6, 13); g.fill('#1a1620'); g.rect(hx, hy - 5, 6, 13);
    g.fill('#f0cdb0'); g.rect(hx - 4, hy, 8, 8);
    g.fill('#9fc0e8'); g.rect(hx - 3, hy + 3, 2, 1); g.rect(hx + 1, hy + 3, 2, 1);
    g.fill('#c0392b'); g.rect(hx - 1, hy + 5, 3, 1); g.fill('#5a86c4'); g.rect(hx + 3, hy + 6, 1, 3);
    g.fill(255); g.ellipse(hx, hy + 16, 30, 16); g.ellipse(hx - 10, hy + 15, 16, 12); g.ellipse(hx + 10, hy + 15, 16, 12);
    g.fill('#5a86c4'); for (let k = 0; k < 6; k++) { const dx = 26 + k * 9, dy = 66 + (k % 2) * 6; g.rect(dx, dy, 2, 3); g.rect(dx, dy + 6, 2, 3); }
    g.fill('#23466f'); g.rect(0, 82, COVER_W, 14);
    const houses = [['#e7b7cb', 8], ['#bcd1b0', 30], ['#d9c38a', 58], ['#cdb0d6', 80]];
    for (const [col, x] of houses) { g.fill(col); g.rect(x, 78, 12, 8); g.fill('#5a4a3a'); g.rect(x, 76, 12, 2); }
  }

  draw(pg) {
    pg.background(this.pal.bg);
    if (this.phase === 'search') this.drawStore(pg); else this.drawBuild(pg);
    this.drawHUD(pg);
  }

  // ---------- FASE 1: tienda caminable ----------
  drawStore(pg) {
    pg.push();
    pg.translate(-Math.round(this.camX), 0);

    // pared y piso
    pg.noStroke();
    pg.fill('#241b22'); pg.rect(0, 28, WORLD_W, DFY - 28);
    pg.fill('#2e2430'); pg.rect(0, 28, WORLD_W, 10);          // cornisa
    pg.fill('#2a2027'); pg.rect(0, DFY, WORLD_W, VIRTUAL_H - DFY);  // piso
    pg.fill('#201820'); pg.rect(0, DFY, WORLD_W, 3);

    // secciones (cajones + letrero + discos)
    const v = vMouse(); const wx = v.x + this.camX, wy = v.y;
    for (const sec of SECTIONS) {
      // letrero
      pg.fill('#3a2f3a'); pg.rect(sec.cx - 40, 48, 80, 12, 1);
      pg.fill(this.pal.accent); pg.textAlign(CENTER, CENTER); pg.textSize(7); pg.text(sec.label, sec.cx, 54);
      // cajón
      pg.fill('#3a2c33'); pg.rect(sec.cx - 62, 132, 124, 20, 1);
      pg.fill('#2a1f26'); pg.rect(sec.cx - 62, 132, 124, 4);
    }

    // discos
    for (const rec of this.records) {
      const hover = !rec.flipped && wx >= rec.x && wx <= rec.x + rec.w && wy >= rec.y && wy <= rec.y + rec.h;
      if (!rec.flipped) {
        pg.fill(hover ? '#4a3a44' : '#33262e'); pg.rect(rec.x, rec.y, rec.w, rec.h, 2);
        pg.fill('#241a22'); pg.rect(rec.x + 3, rec.y + 3, rec.w - 6, rec.h - 6, 1);
        pg.fill(this.pal.a2); pg.ellipse(rec.x + rec.w / 2, rec.y + rec.h / 2, 12);
        pg.fill('#241a22'); pg.ellipse(rec.x + rec.w / 2, rec.y + rec.h / 2, 3);
        if (hover) { pg.noFill(); pg.stroke(pg.color(240, 217, 226, 130)); pg.strokeWeight(1); pg.rect(rec.x, rec.y, rec.w, rec.h, 2); pg.noStroke(); }
      } else {
        pg.fill(rec.color); pg.rect(rec.x, rec.y, rec.w, rec.h, 2);
        pg.fill('#1a1620'); pg.rect(rec.x + rec.w - 6, rec.y + 2, 4, rec.h - 4);
        pg.fill('#f6ecd9'); pg.textAlign(CENTER, CENTER); pg.textSize(5); pg.text(rec.artist, rec.x + (rec.w - 6) / 2, rec.y + rec.h / 2);
        if (rec.hasPiece) { pg.fill(this.pal.accent); pg.textSize(7); pg.text('✦', rec.x + 5, rec.y + 6); }
      }
    }

    // tulipán oculto (en la pared)
    if (!Game.tulips['disco']) drawTulip(pg, this.tulip.x, this.tulip.y, 0.5);

    // mostrador al final (tornamesa)
    pg.fill('#3a2c33'); pg.rect(WORLD_W - 70, 120, 60, 32, 1);
    pg.fill('#1b1620'); pg.ellipse(WORLD_W - 40, 130, 20); pg.fill(this.pal.accent); pg.ellipse(WORLD_W - 40, 130, 5);

    // ella
    this.drawGirl(pg, this.girl.x, this.girl.y);
    pg.pop();

    // flechas de "hay más tienda"
    pg.noStroke();
    if (this.camX > 2) { pg.fill(pg.color(246, 236, 217, 90)); pg.triangle(6, 90, 12, 86, 12, 94); }
    if (this.camX < WORLD_W - VIRTUAL_W - 2) { pg.fill(pg.color(246, 236, 217, 90)); pg.triangle(VIRTUAL_W - 6, 90, VIRTUAL_W - 12, 86, VIRTUAL_W - 12, 94); }
  }

  drawGirl(pg, x, y) {
    pg.fill('#e6c34e'); pg.rect(x - 4, y + 1, 3, 9); pg.rect(x + 3, y + 1, 3, 9); pg.rect(x - 4, y, 10, 3);
    pg.fill('#171420'); pg.rect(x - 4, y - 1, 10, 3);
    pg.fill('#e8c3a0'); pg.rect(x - 2, y + 2, 6, 6);
    pg.fill('#17141c'); pg.rect(x - 3, y + 8, 8, 12, 1);
    pg.fill(pg.color(23, 20, 28, 70)); pg.rect(x - 3, DFY + 1, 8, 4);
  }

  // ---------- FASE 2: armar ----------
  drawBuild(pg) {
    pg.noFill(); pg.stroke(pg.color(240, 217, 226, 50)); pg.strokeWeight(1);
    pg.rect(this.coverX - 1, this.coverY - 1, COVER_W + 2, COVER_H + 2);
    pg.stroke(pg.color(240, 217, 226, 22));
    for (let c = 1; c < PCOLS; c++) pg.line(this.coverX + c * PW, this.coverY, this.coverX + c * PW, this.coverY + COVER_H);
    for (let r = 1; r < PROWS; r++) pg.line(this.coverX, this.coverY + r * PH, this.coverX + COVER_W, this.coverY + r * PH);
    pg.noStroke();

    if (this.done) {
      const vx = this.coverX + COVER_W - 8 + Math.min(34, this.doneFrame * 0.8), vy = this.coverY + COVER_H / 2;
      pg.push(); pg.translate(vx, vy); pg.rotate(this.spin);
      pg.fill('#1b1620'); pg.ellipse(0, 0, 60);
      pg.stroke(pg.color(207, 127, 157, 80)); pg.strokeWeight(1); pg.noFill(); pg.ellipse(0, 0, 44); pg.ellipse(0, 0, 30); pg.noStroke();
      pg.fill(this.pal.accent); pg.ellipse(0, 0, 14); pg.fill('#1b1620'); pg.ellipse(0, 0, 3); pg.pop();
      for (let k = 0; k < 3; k++) { const rr = (this.doneFrame * 0.8 + k * 26) % 80; pg.noFill(); pg.stroke(pg.color(231, 155, 182, map(rr, 0, 80, 120, 0))); pg.strokeWeight(1); pg.ellipse(this.coverX + COVER_W / 2, this.coverY + COVER_H / 2, 80 + rr); }
      pg.noStroke(); pg.fill(this.pal.a2); pg.textSize(9);
      pg.text('♪', this.coverX - 12, this.coverY + 20 - (this.doneFrame % 40) * 0.3);
      pg.text('♫', this.coverX + COVER_W + 10, this.coverY + 30 - (this.doneFrame % 50) * 0.3);
    }

    for (const p of this.pieces) if (p.placed) pg.image(this.cover, p.tx, p.ty, PW, PH, p.sx, p.sy, PW, PH);
    for (const p of this.pieces) {
      if (p.placed) continue;
      if (this.dragging === p) { pg.fill(0, 0, 0, 70); pg.rect(p.cur.x + 2, p.cur.y + 3, PW, PH); }
      pg.image(this.cover, p.cur.x, p.cur.y, PW, PH, p.sx, p.sy, PW, PH);
      pg.noFill(); pg.stroke(pg.color(240, 217, 226, 60)); pg.strokeWeight(1); pg.rect(p.cur.x, p.cur.y, PW, PH); pg.noStroke();
    }
    if (!Game.tulips['disco']) drawTulip(pg, 362, 24, 0.5);
  }

  drawHUD(pg) {
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.accent); pg.textSize(7); pg.text('RECUERDO 02 · RECONSTRUIR', 10, 9);
    pg.fill(this.pal.ink); pg.textSize(13); pg.text('Construir lo nuestro', 10, 21);

    pg.textAlign(RIGHT, TOP); pg.fill(this.pal.accent); pg.textSize(7);
    pg.text('PIEZAS ' + (this.phase === 'search' ? this.piecesFound : this.placedCount) + '/6', VIRTUAL_W - 10, 9);

    if (this.phase === 'search' && !this.moved && (this.frame % 110) < 72) {
      pg.textAlign(CENTER, TOP); pg.fill(pg.color(246, 236, 217, 140)); pg.textSize(7);
      pg.text('camina la tienda (A/D o ← →) y hojea los discos', VIRTUAL_W / 2, 33);
    }
    if (this.caption && this.frame - this.captionFrame < 130) {
      const a = Math.min(1, (130 - (this.frame - this.captionFrame)) / 40);
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(246, 236, 217, 255 * a)); pg.textSize(8);
      pg.text(this.caption, VIRTUAL_W / 2, VIRTUAL_H - 30);
    }
    if (this.done) {
      const a = Math.min(1, this.doneFrame / 40);
      pg.textAlign(CENTER, CENTER); pg.fill(pg.color(240, 217, 226, 255 * a)); pg.textSize(9);
      pg.text('poco a poco, lo nuestro.', VIRTUAL_W / 2, VIRTUAL_H - 30);
    }
    drawButton(pg, '← volver', this.backBtn.x, this.backBtn.y, this.backBtn.w, this.backBtn.h, this.pal, this.hoverBack);
  }

  mousePressed(v) {
    if (pointInRect(v, this.backBtn)) { SM.change(new HubScene()); return; }

    if (this.phase === 'search') {
      const wx = v.x + this.camX, wy = v.y;
      if (!Game.tulips['disco'] && dist(wx, wy, this.tulip.x, this.tulip.y) <= this.tulip.r) {
        Game.foundTulip('disco'); this.caption = 'un tulipán…'; this.captionFrame = this.frame; return;
      }
      for (const rec of this.records) {
        if (!rec.flipped && wx >= rec.x && wx <= rec.x + rec.w && wy >= rec.y && wy <= rec.y + rec.h) {
          if (Math.abs(this.girl.x - (rec.x + rec.w / 2)) <= REACH) {
            rec.flipped = true;
            this.caption = '“' + rec.artist + '”';
            this.captionFrame = this.frame;
            if (rec.hasPiece && !rec.collected) {
              rec.collected = true; this.piecesFound++;
              this.caption = '“' + rec.artist + '”  · pieza encontrada';
              if (this.piecesFound >= 6) this.startBuild();
            }
          } else {
            this.targetX = constrain(rec.x + rec.w / 2, 20, WORLD_W - 20); this.moved = true;
          }
          return;
        }
      }
      this.targetX = constrain(wx, 20, WORLD_W - 20); this.moved = true;
      return;
    }

    // build
    if (!Game.tulips['disco'] && dist(v.x, v.y, 362, 24) <= 6) { Game.foundTulip('disco'); return; }
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      if (p.placed) continue;
      if (v.x >= p.cur.x && v.x <= p.cur.x + PW && v.y >= p.cur.y && v.y <= p.cur.y + PH) {
        this.dragging = p; this.dragOff = { x: p.cur.x - v.x, y: p.cur.y - v.y };
        this.pieces.push(this.pieces.splice(i, 1)[0]); return;
      }
    }
  }

  mouseDragged(v) { if (this.dragging) { this.dragging.cur.x = v.x + this.dragOff.x; this.dragging.cur.y = v.y + this.dragOff.y; } }

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
