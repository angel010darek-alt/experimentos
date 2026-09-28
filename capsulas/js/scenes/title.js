// ============================================================
//  Escena: título — el cielo apagado, "toca para comenzar"
// ============================================================

class TitleScene {
  enter() {
    this.pal = PALETTES.title;
    this.stars = new Starfield(70);
    this.frame = 0;
  }

  update() { this.frame++; }

  draw(pg) {
    pg.background(this.pal.bg);
    this.stars.draw(pg, this.frame);

    pg.push();
    pg.textAlign(CENTER, CENTER);

    // Título
    pg.fill(this.pal.accent);
    pg.textSize(28);
    pg.text('Cápsulas', VIRTUAL_W / 2, VIRTUAL_H / 2 - 14);

    // Subtítulo placeholder
    pg.fill(this.pal.dim);
    pg.textSize(7);
    pg.text('// nombre placeholder', VIRTUAL_W / 2, VIRTUAL_H / 2 + 6);

    // Prompt parpadeante
    const blink = (Math.sin(this.frame * 0.06) + 1) / 2;
    pg.fill(pg.red(pg.color(this.pal.ink)), pg.green(pg.color(this.pal.ink)), pg.blue(pg.color(this.pal.ink)), 120 + blink * 135);
    pg.textSize(9);
    pg.text('toca para comenzar', VIRTUAL_W / 2, VIRTUAL_H / 2 + 34);
    pg.pop();
  }

  mousePressed() {
    SM.change(new HubScene());
  }
}
