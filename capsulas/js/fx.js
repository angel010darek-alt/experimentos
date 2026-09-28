// ============================================================
//  Efectos compartidos — campo de estrellas del cielo
// ============================================================

class Starfield {
  constructor(count = 60) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * VIRTUAL_W,
        y: Math.random() * VIRTUAL_H,
        base: Math.random() * 0.5 + 0.3,
        amp: Math.random() * 0.4,
        sp: Math.random() * 0.05 + 0.01,
        ph: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.22,
      });
    }
  }
  draw(pg, tframe) {
    pg.push();
    pg.noStroke();
    for (const s of this.stars) {
      const a = (s.base + s.amp * (0.5 + 0.5 * Math.sin(tframe * s.sp + s.ph))) * 255;
      pg.fill(s.warm ? pg.color(242, 200, 134, a) : pg.color(244, 236, 219, a));
      pg.rect(Math.floor(s.x), Math.floor(s.y), 1, 1);
    }
    pg.pop();
  }
}
