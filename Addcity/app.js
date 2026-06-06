// ===== AdCity — Times Square Edition =====
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const canvas = document.getElementById('three-canvas');
const sceneWrap = document.getElementById('scene-wrap');
const loader = document.getElementById('loader');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const crosshair = document.getElementById('crosshair');

// ===== WebGL availability check =====
function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}
if (!webglAvailable()) {
  loader.innerHTML = '<div style="max-width:480px;text-align:center;padding:30px;line-height:1.6"><h2 style="color:#ff7043">WebGL is disabled</h2><p style="color:#ccc">Enable hardware acceleration or try Firefox/Safari/Edge.</p></div>';
  loader.style.zIndex = 999; startOverlay.classList.add('hidden');
  throw new Error('WebGL unavailable');
}

// ===== Renderer =====
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false }); }
catch (e) {
  loader.innerHTML = '<div style="text-align:center;padding:30px;color:#ccc"><h2 style="color:#ff7043">Could not start WebGL</h2></div>';
  loader.style.zIndex = 999; startOverlay.classList.add('hidden'); throw e;
}
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ===== Scene (NIGHT) =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060c);
scene.fog = new THREE.FogExp2(0x080814, 0.013);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 600);
camera.position.set(0, 1.7, 0);

scene.add(new THREE.HemisphereLight(0x223355, 0x000000, 0.25));
const moon = new THREE.DirectionalLight(0x9faabb, 0.18);
moon.position.set(40, 80, -20);
moon.castShadow = false;
moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { near: 1, far: 200, left: -120, right: 120, top: 120, bottom: -120 });
scene.add(moon);

// ===== Helpers =====
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = ''; const lines = [];
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxW && i > 0) { lines.push(line); line = words[i] + ' '; } else line = test;
  }
  lines.push(line);
  const sy = y - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln.trim(), x, sy + i * lh));
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ===== Times-Square ad library =====
const TS_ADS = [
  { t: 'COCA-COLA', s: 'Open Happiness', bg: '#d40000', fg: '#ffffff', accent: '#ffffff' },
  { t: "M&M's", s: 'Melts in your mouth', bg: '#ffcc00', fg: '#8b0000', accent: '#8b0000' },
  { t: 'NASDAQ', s: 'AAPL +1.42%  TSLA +2.1%  GOOG', bg: '#000000', fg: '#00ff66', accent: '#00ff66' },
  { t: 'BROADWAY', s: 'Hamilton Wicked Lion King', bg: '#1a0033', fg: '#ffd54f', accent: '#ff4081' },
  { t: 'TOSHIBA', s: 'Leading Innovation', bg: '#cc0000', fg: '#ffffff', accent: '#ffffff' },
  { t: 'SAMSUNG', s: "Do What You Can't", bg: '#1428a0', fg: '#ffffff', accent: '#ffffff' },
  { t: "HERSHEY'S", s: 'Times Square Store', bg: '#5d3a1a', fg: '#ffd54f', accent: '#ffffff' },
  { t: 'DISNEY', s: 'On Broadway', bg: '#0033a0', fg: '#ffd54f', accent: '#ffffff' },
  { t: 'AMERICAN EAGLE', s: 'Live Your Life', bg: '#ffffff', fg: '#003366', accent: '#cc0000' },
  { t: 'FOREVER 21', s: 'Fashion Fast', bg: '#ffd700', fg: '#000000', accent: '#ff0066' },
  { t: "McDONALD'S", s: "i'm lovin' it", bg: '#ffc72c', fg: '#da291c', accent: '#da291c' },
  { t: 'BUDWEISER', s: 'King of Beers', bg: '#c8102e', fg: '#ffffff', accent: '#ffffff' },
  { t: 'NIKE', s: 'Just Do It', bg: '#000000', fg: '#ffffff', accent: '#ff8800' },
  { t: 'CNN', s: 'BREAKING NEWS LIVE', bg: '#cc0000', fg: '#ffffff', accent: '#ffffff' },
  { t: 'NBC', s: 'The Tonight Show', bg: '#ffcb05', fg: '#000000', accent: '#cc0000' },
  { t: 'GOOGLE', s: 'Search the World', bg: '#ffffff', fg: '#4285f4', accent: '#ea4335' },
  { t: 'AMAZON', s: 'Prime Day', bg: '#ff9900', fg: '#232f3e', accent: '#232f3e' },
  { t: 'NETFLIX', s: 'Now Streaming', bg: '#000000', fg: '#e50914', accent: '#e50914' },
  { t: 'SPOTIFY', s: '100M Songs', bg: '#1db954', fg: '#000000', accent: '#000000' },
  { t: 'TIMES SQUARE', s: 'Crossroads of the World', bg: '#ff0066', fg: '#ffffff', accent: '#ffd54f' },
  { t: 'I ♥ NY', s: 'The Empire State', bg: '#ffffff', fg: '#cc0000', accent: '#000000' },
  { t: 'YANKEES', s: 'Bronx Bombers', bg: '#0c2340', fg: '#ffffff', accent: '#c4ced4' },
  { t: 'CHASE', s: 'Bank with Chase', bg: '#117aca', fg: '#ffffff', accent: '#ffffff' },
];
const pickAd = () => TS_ADS[(Math.random() * TS_ADS.length) | 0];

// ===== Big Times-Square LED billboard texture =====
function makeAdTexture(ad, opts = {}) {
  const W = opts.wide ? 1024 : 512;
  const H = opts.wide ? 256 : 512;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, ad.bg); grad.addColorStop(1, shade(ad.bg, -30));
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  // LED dot pattern
  if (opts.led !== false) {
    ctx.globalAlpha = 0.15; ctx.fillStyle = '#000000';
    for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6) ctx.fillRect(x, y, 3, 3);
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = ad.accent; ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  ctx.fillStyle = ad.accent; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('★ NOW SHOWING ★', 18, 32);

  ctx.fillStyle = ad.fg;
  ctx.font = `bold ${opts.wide ? 90 : 80}px Impact, Arial Black, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  wrapText(ctx, ad.t, W / 2, H * 0.45, W * 0.9, opts.wide ? 92 : 84);

  ctx.font = opts.wide ? 'bold 32px sans-serif' : 'italic 28px sans-serif';
  wrapText(ctx, ad.s, W / 2, H * 0.78, W * 0.9, 34);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 2;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Pre-bake all ad textures at startup so the animation loop never creates canvas/texture
const _adTexCache = { regular: [], wide: [] };
function warmAdTextureCache() {
  for (const ad of TS_ADS) {
    _adTexCache.regular.push(makeAdTexture(ad, {}));
    _adTexCache.wide.push(makeAdTexture(ad, { wide: true }));
  }
}
const _adBgColors = TS_ADS.map(ad => new THREE.Color(ad.bg));

// Animated ad material — MeshBasicMaterial: no PBR lighting, just texture sample
function makeAnimatedAdMaterial(opts = {}) {
  const idx = (Math.random() * TS_ADS.length) | 0;
  const tex = opts.wide ? _adTexCache.wide[idx] : _adTexCache.regular[idx];
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    side: opts.side || THREE.FrontSide,
  });
  mat.userData.cycle = 4 + Math.random() * 6;
  mat.userData.t = 0;
  mat.userData.wide = !!opts.wide;
  animatedMaterials.push(mat);
  return mat;
}
const animatedMaterials = [];

// Scrolling LED ticker (single ad, scrolls horizontally)
function makeTickerTexture(text, fg = '#ffd54f', bg = '#000000') {
  const W = 2048, H = 128;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // dots
  ctx.globalAlpha = 0.15; ctx.fillStyle = '#fff';
  for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6) ctx.fillRect(x, y, 3, 3);
  ctx.globalAlpha = 1;
  ctx.fillStyle = fg;
  ctx.font = 'bold 78px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, H / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ===== Wet asphalt ground =====
const groundCanvas = document.createElement('canvas');
groundCanvas.width = groundCanvas.height = 512;
const gctx = groundCanvas.getContext('2d');
gctx.fillStyle = '#0a0a10'; gctx.fillRect(0, 0, 512, 512);
// noise
for (let i = 0; i < 4000; i++) {
  gctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
  gctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
}
// road markings
gctx.fillStyle = '#1a1a22';
gctx.fillRect(0, 250, 512, 12);
const groundTex = new THREE.CanvasTexture(groundCanvas);
groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
groundTex.repeat.set(40, 40);
groundTex.colorSpace = THREE.SRGBColorSpace;
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.35, metalness: 0.5 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ===== Buildings — tall NYC skyscrapers densely packed =====
const colliders = [];
const tickers = []; // for animation

function makeBuilding(x, z, w, d, h) {
  const group = new THREE.Group();

  // Dark base material (the building itself)
  const baseMat = new THREE.MeshLambertMaterial({ color: 0x0a0a12 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), baseMat);
  box.position.set(x, h / 2, z);
  box.castShadow = true; box.receiveShadow = true;
  scene.add(box);

  colliders.push(new THREE.Box3(
    new THREE.Vector3(x - w / 2 - 0.4, 0, z - d / 2 - 0.4),
    new THREE.Vector3(x + w / 2 + 0.4, h, z + d / 2 + 0.4)
  ));

  // Stack billboards on each face from ground up to ~70% of height
  const faces = [
    { dir: new THREE.Vector3(1, 0, 0), len: d, rotY: -Math.PI / 2 },
    { dir: new THREE.Vector3(-1, 0, 0), len: d, rotY: Math.PI / 2 },
    { dir: new THREE.Vector3(0, 0, 1), len: w, rotY: 0 },
    { dir: new THREE.Vector3(0, 0, -1), len: w, rotY: Math.PI },
  ];

  for (const face of faces) {
    let y = 0.5;
    while (y < h * 0.85) {
      const bh = 8 + Math.random() * 6;
      const bw = face.len * (0.85 + Math.random() * 0.1);
      if (y + bh > h) break;

      const wide = bw / bh > 2;
      const mat = makeAnimatedAdMaterial({ wide });
      const board = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), mat);
      board.position.set(
        x + face.dir.x * (w / 2 + 0.05),
        y + bh / 2,
        z + face.dir.z * (d / 2 + 0.05)
      );
      // For X-facing faces use d (depth) as width; we already accounted for that
      if (face.dir.x !== 0) {
        // rotate to face +X / -X
        board.rotation.y = face.dir.x > 0 ? Math.PI / 2 : -Math.PI / 2;
        board.position.x = x + face.dir.x * (w / 2 + 0.05);
      } else {
        board.rotation.y = face.dir.z > 0 ? 0 : Math.PI;
      }
      scene.add(board);

      // (per-billboard lights removed — emissive materials provide the glow without exceeding GPU uniform limits)
      y += bh + 0.3;
    }
  }

  // Rooftop crown sign
  if (h > 20 && Math.random() < 0.35) addRoofCrown(x, z, Math.min(w, d), h);

  // Ticker band on a random face (horizontal scrolling LED)
  if (Math.random() < 0.3) addTickerBand(x, z, w, d, h, faces);
}

function addRoofCrown(x, z, size, h) {
  const ad = pickAd();
  const tex = makeAdTexture(ad, { wide: true });
  const cw = size * 1.1 + 4;
  const ch = cw * 0.28;
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), mat);
  board.position.set(x, h + ch / 2 + 0.5, z);
  board.rotation.y = (Math.random() < 0.5 ? 0 : Math.PI / 2);
  scene.add(board);

  // (rooftop glow handled by material emissive)
}

function addTickerBand(x, z, w, d, h, faces) {
  const face = faces[(Math.random() * faces.length) | 0];
  const tickerY = 6 + Math.random() * (h - 12);
  const len = (face.dir.x !== 0) ? d : w;
  const tex = makeTickerTexture('★ BREAKING NEWS ★ STOCKS UP ★ TIMES SQUARE LIVE ★ NOW PLAYING ★ AAPL +1.4% ★ DOW +180 ★ ', '#ffd54f', '#000');
  tex.repeat.set(Math.max(2, Math.round(len / 8)), 1);
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(len * 0.95, 1.4), mat);
  board.position.set(
    x + face.dir.x * (w / 2 + 0.06),
    tickerY,
    z + face.dir.z * (d / 2 + 0.06)
  );
  if (face.dir.x !== 0) board.rotation.y = face.dir.x > 0 ? Math.PI / 2 : -Math.PI / 2;
  else board.rotation.y = face.dir.z > 0 ? 0 : Math.PI;
  scene.add(board);
  tickers.push({ tex, speed: 0.3 + Math.random() * 0.4 });
}

warmAdTextureCache();

// ===== Generate the Times Square city =====
// Dense grid of tall skyscrapers, with a central plaza (the "X" of Broadway)
const GRID = 6;
const BLOCK = 22;
const STREET = 9;
const STEP = BLOCK + STREET;
const OFFSET = -(GRID - 1) / 2 * STEP;

for (let i = 0; i < GRID; i++) {
  for (let j = 0; j < GRID; j++) {
    // Skip the center 2x2 to make a plaza
    const ci = Math.floor(GRID / 2), cj = Math.floor(GRID / 2);
    if (i === ci && j === cj) continue;
    if (i === ci - 1 && j === cj) continue;
    if (i === ci && j === cj - 1) continue;

    const cx = OFFSET + i * STEP;
    const cz = OFFSET + j * STEP;

    // Tall, narrow buildings (NYC skyscraper style)
    const w = BLOCK * (0.85 + Math.random() * 0.15);
    const d = BLOCK * (0.85 + Math.random() * 0.15);
    const h = 35 + Math.random() * 55; // 35-90 tall — Times Square scale
    makeBuilding(cx, cz, w, d, h);
  }
}

// ===== Central plaza: a "Times Square" pedestrian island =====
// Red bleacher-style steps under the iconic billboards
const plazaMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7 });
for (let s = 0; s < 6; s++) {
  const step = new THREE.Mesh(
    new THREE.BoxGeometry(20 - s * 2, 0.6, 14 - s * 1.5),
    plazaMat
  );
  step.position.set(0, 0.3 + s * 0.6, -8 - s * 0.6);
  step.receiveShadow = true; step.castShadow = true;
  scene.add(step);
  colliders.push(new THREE.Box3(
    new THREE.Vector3(step.position.x - (10 - s), step.position.y - 0.3, step.position.z - (7 - s * 0.75)),
    new THREE.Vector3(step.position.x + (10 - s), step.position.y + 0.3, step.position.z + (7 - s * 0.75))
  ));
}

// Plaza signage pole — the iconic "Times Square" sign
{
  const tex = makeAdTexture({ t: 'TIMES SQUARE', s: 'Crossroads of the World', bg: '#cc0000', fg: '#ffffff', accent: '#ffd54f' }, { wide: true });
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.5), mat);
  sign.position.set(0, 8, -22);
  scene.add(sign);
  const pl = new THREE.PointLight(0xff3344, 3, 50);
  pl.position.set(0, 8, -18);
  scene.add(pl);
}


// ===== A few strong area lights to illuminate plaza & streets =====
// (We use only a small number of lights to stay under GPU uniform limits)
const plazaLight1 = new THREE.PointLight(0xff4488, 4, 80);
plazaLight1.position.set(0, 12, 0);
scene.add(plazaLight1);
const plazaLight2 = new THREE.PointLight(0x44aaff, 3, 70);
plazaLight2.position.set(20, 15, 20);
scene.add(plazaLight2);
const plazaLight3 = new THREE.PointLight(0xffaa44, 3, 70);
plazaLight3.position.set(-20, 15, -20);
scene.add(plazaLight3);
const plazaLight4 = new THREE.PointLight(0xffffff, 2.5, 90);
plazaLight4.position.set(0, 25, 0);
scene.add(plazaLight4);

// ===== Street lights =====
function addStreetLight(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 6),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  pole.position.set(x, 3, z);
  scene.add(pole);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshStandardMaterial({ emissive: 0xfff1c0, emissiveIntensity: 2, color: 0xfff1c0 })
  );
  bulb.position.set(x, 6.2, z);
  scene.add(bulb);
  // (streetlight point light removed to stay under GPU uniform limit)
}
for (let i = 0; i <= GRID; i++) {
  for (let j = 0; j <= GRID; j++) {
    const x = OFFSET - STEP / 2 + i * STEP;
    const z = OFFSET - STEP / 2 + j * STEP;
    if (Math.abs(x) < 18 && Math.abs(z) < 18) continue;
    if (Math.random() < 0.35) addStreetLight(x, z);
  }
}

// ===== Yellow taxis (NYC cabs!) =====
function addTaxi(x, z, rotY) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.9, 4.6),
    new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.4, metalness: 0.5 })
  );
  body.position.y = 0.7;
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 0.85, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.4, metalness: 0.5 })
  );
  cabin.position.set(0, 1.55, -0.1);
  cabin.castShadow = true;
  g.add(cabin);
  // windows
  const winMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.2, metalness: 0.6, emissive: 0x333355, emissiveIntensity: 0.3 });
  const winFront = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.7, 0.05), winMat);
  winFront.position.set(0, 1.55, 1.1);
  g.add(winFront);
  // wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  for (const [wx, wz] of [[-0.95, 1.4], [0.95, 1.4], [-0.95, -1.4], [0.95, -1.4]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.4, wz);
    g.add(wheel);
  }
  // TAXI sign on roof
  const taxiSignTex = makeTickerTexture(' TAXI ', '#000', '#ffcc00');
  const taxiMat = new THREE.MeshBasicMaterial({ map: taxiSignTex });
  const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.4), taxiMat);
  taxiSign.position.set(0, 2.05, 0);
  g.add(taxiSign);
  // (taxi headlight removed — taxis still glow via emissive sign)

  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);

  colliders.push(new THREE.Box3(
    new THREE.Vector3(x - 1.5, 0, z - 2.8),
    new THREE.Vector3(x + 1.5, 2.2, z + 2.8)
  ));
}

// Place taxis on streets
for (let i = 0; i < 12; i++) {
  const onX = Math.random() < 0.5;
  const slot = (Math.floor(Math.random() * (GRID - 1))) - (GRID - 1) / 2;
  if (onX) {
    addTaxi((slot + 0.5) * STEP, OFFSET - STEP / 2 + (Math.floor(Math.random() * GRID) + 0.5) * STEP - 4 + Math.random() * 8, 0);
  } else {
    addTaxi(OFFSET - STEP / 2 + (Math.floor(Math.random() * GRID) + 0.5) * STEP - 4 + Math.random() * 8, (slot + 0.5) * STEP, Math.PI / 2);
  }
}

// ===== Player + Controls =====
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const keys = { w: false, a: false, s: false, d: false, shift: false };
let velY = 0;
const GRAVITY = -28;
const JUMP_FORCE = 10;
const GROUND_Y = 1.7;

addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = true;
  if (e.key === 'Shift') keys.shift = true;
  if (e.code === 'Space') {
    e.preventDefault();
    const obj = controls.getObject();
    if (obj.position.y <= GROUND_Y + 0.05) velY = JUMP_FORCE;
  }
});
addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = false;
  if (e.key === 'Shift') keys.shift = false;
});

startBtn.addEventListener('click', () => {
  startOverlay.classList.add('hidden');
  controls.lock();
});
controls.addEventListener('lock', () => crosshair.classList.add('active'));
controls.addEventListener('unlock', () => {
  crosshair.classList.remove('active');
  startOverlay.classList.remove('hidden');
});

// ===== Resize =====
function resize() {
  const r = sceneWrap.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ===== Collision =====
const tmpBox = new THREE.Box3();
function collides(pos) {
  tmpBox.min.set(pos.x - 0.35, 0, pos.z - 0.35);
  tmpBox.max.set(pos.x + 0.35, 1.7, pos.z + 0.35);
  for (const c of colliders) if (c.intersectsBox(tmpBox)) return true;
  return false;
}

// ===== Main loop =====
const clock = new THREE.Clock();
const direction = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // Animate scrolling tickers
  for (const tk of tickers) tk.tex.offset.x = (tk.tex.offset.x + tk.speed * dt) % 1;

  // Cycle animated billboards — swap to a pre-baked texture, no canvas work
  for (const mat of animatedMaterials) {
    mat.userData.t += dt;
    if (mat.userData.t > mat.userData.cycle) {
      mat.userData.t = 0;
      const idx = (Math.random() * TS_ADS.length) | 0;
      mat.map = mat.userData.wide ? _adTexCache.wide[idx] : _adTexCache.regular[idx];
    }
  }

  if (controls.isLocked) {
    const speed = keys.shift ? 16 : 7;
    direction.set(0, 0, 0);
    if (keys.w) direction.z -= 1;
    if (keys.s) direction.z += 1;
    if (keys.a) direction.x -= 1;
    if (keys.d) direction.x += 1;
    direction.normalize();

    const obj = controls.getObject();
    const before = obj.position.clone();
    controls.moveRight(direction.x * speed * dt);
    if (collides(obj.position)) obj.position.x = before.x;

    const before2 = obj.position.clone();
    controls.moveForward(-direction.z * speed * dt);
    if (collides(obj.position)) obj.position.z = before2.z;

    velY += GRAVITY * dt;
    obj.position.y += velY * dt;
    if (obj.position.y < GROUND_Y) { obj.position.y = GROUND_Y; velY = 0; }
    const B = (GRID * STEP) / 2 + 8;
    obj.position.x = Math.max(-B, Math.min(B, obj.position.x));
    obj.position.z = Math.max(-B, Math.min(B, obj.position.z));
  }

  renderer.render(scene, camera);
}

loader.classList.add('hidden');
animate();
