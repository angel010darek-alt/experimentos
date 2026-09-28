// ============================================================
//  Escena: hub — el cielo. Cada recuerdo es una estrella.
//  Apagada si falta, encendida al resolverse. Clic = entrar.
//  Cuando todas brillan, se dibuja la constelación completa.
// ============================================================

const STAR_HIT_R = 9; // radio de clic alrededor de cada estrella (virtual px)

class HubScene {
  enter() {
    this.pal = PALETTES.hub;
    this.stars = new Starfield(80);
    this.frame = 0;
    this.hover = null;
  }

  update() {
    this.frame++;
    // Detectar sobre qué estrella está el ratón (para resaltar y etiquetar).
    const v = vMouse();
    this.hover = null;
    for (const lv of LEVELS) {
      if (dist(v.x, v.y, lv.pos.x, lv.pos.y) <= STAR_HIT_R) { this.hover = lv; break; }
    }
  }

  draw(pg) {
    pg.background(this.pal.bg);
    this.stars.draw(pg, this.frame);

    // Líneas de constelación cuando el cielo está completo.
    if (Game.allDone()) {
      pg.push();
      pg.stroke(pg.color(235, 165, 79, 90));
      pg.strokeWeight(1);
      for (let i = 0; i < LEVELS.length - 1; i++) {
        const a = LEVELS[i].pos, b = LEVELS[i + 1].pos;
        pg.line(a.x, a.y, b.x, b.y);
      }
      pg.pop();
    }

    // Estrellas-recuerdo
    for (const lv of LEVELS) {
      const done = Game.isDone(lv.id);
      const isHover = this.hover === lv;
      const pulse = done ? (0.6 + 0.4 * Math.sin(this.frame * 0.05 + lv.pos.x)) : 0.4;
      pg.push();
      pg.noStroke();
      if (done) {
        // halo cálido
        pg.fill(pg.color(235, 165, 79, 40 * pulse));
        pg.ellipse(lv.pos.x, lv.pos.y, 12 + (isHover ? 4 : 0));
        pg.fill(this.pal.accent);
      } else {
        pg.fill(isHover ? this.pal.ink : this.pal.dim);
      }
      const r = isHover ? 4 : 3;
      pg.ellipse(lv.pos.x, lv.pos.y, r);
      pg.pop();
    }

    // Cabecera
    pg.push();
    pg.textAlign(LEFT, TOP);
    pg.fill(this.pal.dim);
    pg.textSize(7);
    pg.text('EL CIELO', 10, 9);
    pg.textAlign(RIGHT, TOP);
    pg.fill(this.pal.accent);
    pg.text('RECUERDOS ' + Game.doneCount() + '/' + LEVELS.length, VIRTUAL_W - 10, 9);
    pg.pop();

    // Etiqueta de la estrella bajo el ratón
    if (this.hover) {
      pg.push();
      pg.textAlign(CENTER, BOTTOM);
      pg.fill(this.pal.ink);
      pg.textSize(9);
      pg.text(this.hover.title, this.hover.pos.x, this.hover.pos.y - 8);
      pg.fill(this.pal.dim);
      pg.textSize(7);
      pg.text(this.hover.mechanic, this.hover.pos.x, this.hover.pos.y + 16);
      pg.pop();
    }

    // Aviso del final cuando todo está encendido
    if (Game.allDone()) {
      pg.push();
      pg.textAlign(CENTER, BOTTOM);
      const blink = (Math.sin(this.frame * 0.06) + 1) / 2;
      pg.fill(pg.color(235, 165, 79, 140 + blink * 115));
      pg.textSize(8);
      pg.text('el cielo está completo', VIRTUAL_W / 2, VIRTUAL_H - 10);
      pg.pop();
    }
  }

  mousePressed(v) {
    for (const lv of LEVELS) {
      if (dist(v.x, v.y, lv.pos.x, lv.pos.y) <= STAR_HIT_R) {
        SM.change(createLevelScene(lv.id));
        return;
      }
    }
  }
}
