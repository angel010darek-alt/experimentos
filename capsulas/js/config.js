// ============================================================
//  Cápsulas — configuración y datos del juego
//  (nombre placeholder — ver biblia de diseño)
// ============================================================

// --- Resolución virtual (lienzo interno de pixel art) --------
// Todo el juego se dibuja aquí dentro y luego se escala a la
// ventana con escalado entero, para que los píxeles queden nítidos.
const VIRTUAL_W = 384;
const VIRTUAL_H = 216; // 16:9

// --- Paletas por recuerdo ------------------------------------
// Cada nivel tiene identidad de color propia (ver biblia).
// Roles: bg (fondo), ink (texto), accent (acento cálido),
//        a2 / a3 (apoyos), dim (apagado).
const PALETTES = {
  title:  { bg: '#0f0e17', bg2: '#171528', ink: '#f4ecdb', accent: '#eba54f', dim: '#3a3654' },
  hub:    { bg: '#0f0e17', bg2: '#171528', ink: '#f4ecdb', accent: '#eba54f', dim: '#3a3654' },
  cita:   { bg: '#1e1a22', ink: '#f6ecd9', accent: '#e8a85a', a2: '#8fb6d6', a3: '#b89468', dim: '#5a5460' },
  disco:  { bg: '#2b1f28', ink: '#f0d9e2', accent: '#e79bb6', a2: '#cf7f9d', a3: '#8a5a6e', dim: '#5c4552' },
  noche:  { bg: '#0f1224', ink: '#dfe6ff', accent: '#eba54f', a2: '#3f5488', a3: '#26314f', dim: '#2a3350' },
  quince: { bg: '#2a2130', ink: '#f6e7d8', accent: '#d9a441', a2: '#e7bcae', a3: '#b98a6a', dim: '#584860' },
  cierre: { bg: '#1a1630', ink: '#f4ecdb', accent: '#eba54f', a2: '#e08aa0', a3: '#7186c4', dim: '#3a3654' },
};

// --- Los cinco recuerdos -------------------------------------
// pos = posición de su estrella en el hub (coords virtuales).
const LEVELS = [
  { id: 'cita',   n: '01', title: 'La primera cita',    mechanic: 'Observación',  memory: 'la plaza, el Mixup',            palette: 'cita',   pos: { x: 66,  y: 150 } },
  { id: 'disco',  n: '02', title: 'Construir lo nuestro', mechanic: 'Reconstruir', memory: 'el disco de Melanie Martinez',  palette: 'disco',  pos: { x: 138, y: 92  } },
  { id: 'noche',  n: '03', title: 'La noche',           mechanic: 'Luz / sombra', memory: 'los cuentos para dormir',       palette: 'noche',  pos: { x: 200, y: 150 } },
  { id: 'quince', n: '04', title: 'Los quince',         mechanic: 'El vals',      memory: 'su único chambelán',            palette: 'quince', pos: { x: 268, y: 84  } },
  { id: 'cierre', n: '05', title: 'El cierre',          mechanic: 'Combinación',  memory: 'su cumpleaños',                 palette: 'cierre', pos: { x: 326, y: 148 } },
];

function getLevel(id) { return LEVELS.find(l => l.id === id); }

// --- Estado del juego (progreso) -----------------------------
const Game = {
  completed: {},               // id -> true cuando el recuerdo está resuelto
  isDone(id) { return !!this.completed[id]; },
  complete(id) { this.completed[id] = true; },
  allDone() { return LEVELS.every(l => this.completed[l.id]); },
  doneCount() { return LEVELS.filter(l => this.completed[l.id]).length; },
  tulips: {},                  // id -> true si encontró el tulipán oculto (Capa 4)
  foundTulip(id) { this.tulips[id] = true; },
  allTulips() { return LEVELS.every(l => this.tulips[l.id]); }, // desbloquea final secreto
  reset() { this.completed = {}; this.tulips = {}; },
};
