// ============================================================
//  Gestor de escenas + transición onírica (fundido a negro)
// ============================================================
//  Una "escena" es cualquier objeto con estos métodos opcionales:
//    enter()            -> al activarse
//    update()           -> lógica por frame
//    draw(pg)           -> dibujo en el buffer virtual
//    mousePressed(v)    -> clic (v = coords virtuales)
//    exit()             -> al abandonarla
//
//  SM.change(nuevaEscena) hace: fundir a negro -> cambiar -> fundir de vuelta.
//  Durante la transición se ignoran los clics (calma, sin dobles toques).

const SM = {
  current: null,
  next: null,
  phase: 'idle',     // 'idle' | 'out' | 'in'
  t: 0,
  dur: 20,           // frames de cada mitad del fundido (~0.33s a 60fps)

  start(scene) {
    this.current = scene;
    this.phase = 'idle';
    this.t = 0;
    if (scene && scene.enter) scene.enter();
  },

  change(scene) {
    if (this.phase !== 'idle') return;   // no interrumpir un fundido en curso
    this.next = scene;
    this.phase = 'out';
    this.t = 0;
  },

  update() {
    if (this.current && this.current.update) this.current.update();

    if (this.phase === 'out') {
      this.t++;
      if (this.t >= this.dur) {
        if (this.current && this.current.exit) this.current.exit();
        this.current = this.next;
        this.next = null;
        if (this.current && this.current.enter) this.current.enter();
        this.phase = 'in';
        this.t = 0;
      }
    } else if (this.phase === 'in') {
      this.t++;
      if (this.t >= this.dur) { this.phase = 'idle'; this.t = 0; }
    }
  },

  draw(pg) {
    if (this.current && this.current.draw) this.current.draw(pg);
  },

  // Alpha del velo de fundido (0..255) para dibujar sobre el buffer.
  fadeAlpha() {
    if (this.phase === 'out') return (this.t / this.dur) * 255;
    if (this.phase === 'in') return (1 - this.t / this.dur) * 255;
    return 0;
  },

  mousePressed(v) {
    if (this.phase !== 'idle') return;
    if (this.current && this.current.mousePressed) this.current.mousePressed(v);
  },
};
