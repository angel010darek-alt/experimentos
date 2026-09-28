// ============================================================
//  Cápsulas — punto de entrada (p5.js, modo global)
// ============================================================

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.style('display', 'block');
  pixelDensity(1);
  noSmooth();
  textFont('monospace');
  createEngine();               // crea el buffer de pixel art
  SM.start(new TitleScene());   // arranca en el título
}

function draw() {
  SM.update();
  SM.draw(PG);                  // la escena dibuja en el buffer virtual
  presentBuffer();              // se escala a la ventana (pixel-perfect)

  // Velo de transición (fundido onírico) sobre todo el lienzo.
  const a = SM.fadeAlpha();
  if (a > 0) { noStroke(); fill(8, 7, 14, a); rect(0, 0, width, height); }
}

function mousePressed() {
  SM.mousePressed(screenToVirtual(mouseX, mouseY));
}

function mouseDragged() {
  SM.mouseDragged(screenToVirtual(mouseX, mouseY));
}

function mouseReleased() {
  SM.mouseReleased(screenToVirtual(mouseX, mouseY));
}

// Atajos de desarrollo (borrar en producción):
//   R = reiniciar progreso   ·   T = marcar todos los tulipanes
function keyPressed() {
  if (key === 'r' || key === 'R') { Game.reset(); }
  if (key === 't' || key === 'T') { for (const l of LEVELS) Game.foundTulip(l.id); }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeView();
}
