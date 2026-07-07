/* ═══ LAYERO LAB — valódi 3D nyomtatás-szimulátor (Three.js) ═══════════
   A beírt nevet voxelrácsra bontjuk, és egy lebegő tárgyasztalon rétegről
   rétegre "kinyomtatjuk": mozgó fej izzó fúvókával, frissen rakott, still
   forró voxelek, részecskék, bloom-utófénnyel. A kész felirat lámpaként
   felizzik, és egérrel/ujjal körbeforgatható. */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const canvas = document.getElementById('sh-lab-canvas');
if (canvas) {
  try { boot(); } catch (err) {
    console.warn('Layero Lab: WebGL nem érhető el, 2D tartalék mód.', err);
    fallback2D();
  }
}

function boot() {
  const stage = canvas.parentElement;
  const input = document.getElementById('sh-lab-input');
  const result = document.getElementById('sh-lab-result');
  const stats = document.getElementById('sh-lab-stats');
  const cta = document.getElementById('sh-lab-cta');
  const hint = document.getElementById('sh-lab-hint');
  const form = document.getElementById('sh-lab-form');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── renderer + kompozíció ─────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x041120, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x041120, 240, 560);

  const camera = new THREE.PerspectiveCamera(32, 2, 1, 900);

  const composerRT = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, composerRT);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.55, 0.45, 0.62);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ── fények ────────────────────────────────────────────────────── */
  scene.add(new THREE.HemisphereLight(0x9fd8e8, 0x2a1c10, 0.85));
  const key = new THREE.DirectionalLight(0xfff2df, 1.5);
  key.position.set(40, 90, 70);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x39c7e8, 1.15);
  rim.position.set(-70, 30, -80);
  scene.add(rim);
  const nozzleLight = new THREE.PointLight(0xffc46b, 260, 34, 2);
  nozzleLight.visible = false;
  scene.add(nozzleLight);

  /* ── közös textúrák ────────────────────────────────────────────── */
  const dotTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,255,255,1)');
    rg.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    return t;
  })();

  /* ── háttér-derengés (a kártya cián/borostyán fényei a térben) ─── */
  function backGlow(color, x, y, z, s, op) {
    const m = new THREE.SpriteMaterial({ map: dotTex, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });
    const sp = new THREE.Sprite(m);
    sp.position.set(x, y, z); sp.scale.set(s, s * 0.72, 1);
    scene.add(sp);
    return sp;
  }
  backGlow(0x0d5b70, 90, 60, -150, 340, 0.5);
  backGlow(0x6b3d10, -110, -8, -130, 300, 0.4);

  /* ── tárgyasztal (újrarajzolható rács-textúrával) ──────────────── */
  const bedCanvas = document.createElement('canvas');
  bedCanvas.width = 1024; bedCanvas.height = 512;
  const bedTex = new THREE.CanvasTexture(bedCanvas);
  bedTex.colorSpace = THREE.SRGBColorSpace;
  bedTex.anisotropy = 4;
  const bedMat = new THREE.MeshBasicMaterial({ map: bedTex, transparent: true, opacity: 0.88, depthWrite: false });
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bedMat);
  bed.rotation.x = -Math.PI / 2;
  bed.renderOrder = 2;
  scene.add(bed);

  function drawBed(wWorld, dWorld) {
    const g = bedCanvas.getContext('2d');
    const W = bedCanvas.width, H = bedCanvas.height, R = 46;
    g.clearRect(0, 0, W, H);
    g.save();
    g.beginPath();
    g.roundRect ? g.roundRect(6, 6, W - 12, H - 12, R) : g.rect(6, 6, W - 12, H - 12);
    g.clip();
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0a2438'); bg.addColorStop(1, '#061a2c');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // rácsvonalak 4 világ-egységenként
    const step = W / (wWorld / 4);
    g.strokeStyle = 'rgba(0, 229, 255, 0.14)'; g.lineWidth = 1.6;
    for (let x = W / 2 % step; x < W; x += step) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, H - 8); g.stroke(); }
    const stepZ = H / (dWorld / 4);
    for (let y = H / 2 % stepZ; y < H; y += stepZ) { g.beginPath(); g.moveTo(8, y); g.lineTo(W - 8, y); g.stroke(); }
    // szélek felé sötétedés
    const vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.62);
    vg.addColorStop(0, 'rgba(4,17,32,0)'); vg.addColorStop(1, 'rgba(4,17,32,0.72)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.restore();
    // világító perem
    g.strokeStyle = 'rgba(0, 229, 255, 0.55)'; g.lineWidth = 3;
    g.shadowColor = 'rgba(0,229,255,0.8)'; g.shadowBlur = 14;
    g.beginPath();
    g.roundRect ? g.roundRect(6, 6, W - 12, H - 12, R) : g.rect(6, 6, W - 12, H - 12);
    g.stroke();
    g.shadowBlur = 0;
    bedTex.needsUpdate = true;
    bed.scale.set(wWorld, dWorld, 1);
  }

  // meleg fény-tócsa a felirat alatt (a "lámpa" visszfénye az asztalon)
  const poolMat = new THREE.MeshBasicMaterial({ map: dotTex, color: 0xff9f2d, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.35;
  pool.renderOrder = 3;
  scene.add(pool);

  /* ── voxelfelirat (előre foglalt példányok, munkánként újratöltve) */
  const MAXI = 4200;
  const voxGeo = new THREE.BoxGeometry(0.94, 0.94, 5.2);
  const voxMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.42, metalness: 0.08,
    emissive: 0xffa63e, emissiveIntensity: 0.22
  });
  const mesh = new THREE.InstancedMesh(voxGeo, voxMat, MAXI);
  mesh.frustumCulled = false;
  mesh.count = 0;
  scene.add(mesh);

  // tükörkép a fényes asztalon
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0x5c5044, roughness: 0.5, metalness: 0.1,
    emissive: 0xffa63e, emissiveIntensity: 0.06,
    transparent: true, opacity: 0.14, depthWrite: false
  });
  const mirrorGroup = new THREE.Group();
  mirrorGroup.scale.y = -0.55; // lapított tükörkép, az asztal határán belül marad
  const mirror = new THREE.InstancedMesh(voxGeo, mirrorMat, MAXI);
  mirror.frustumCulled = false;
  mirror.count = 0;
  mirror.renderOrder = 1;
  mirrorGroup.add(mirror);
  scene.add(mirrorGroup);

  // frissen nyomtatott, még izzó voxelek (additív "hőburok")
  const HOT = 72;
  const hotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const hot = new THREE.InstancedMesh(voxGeo, hotMat, HOT);
  hot.frustumCulled = false;
  hot.count = 0;
  scene.add(hot);

  /* ── nyomtatófej + sín ─────────────────────────────────────────── */
  const railMat = new THREE.MeshBasicMaterial({ color: 0x36cfe8, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1, 0.34, 0.34), railMat);
  scene.add(rail);

  const head = new THREE.Group();
  const headBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 2.3, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x0e2c44, roughness: 0.45, metalness: 0.6, emissive: 0x123f5c, emissiveIntensity: 0.5 })
  );
  head.add(headBody);
  const headLipMat = new THREE.MeshBasicMaterial({ color: 0x59e2f5, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
  const headLip = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.28, 2.8), headLipMat);
  headLip.position.y = -1.28;
  head.add(headLip);
  const nozzle = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 1.5, 12),
    new THREE.MeshStandardMaterial({ color: 0xffb75e, roughness: 0.3, metalness: 0.4, emissive: 0xff9f2d, emissiveIntensity: 1.7 })
  );
  nozzle.rotation.x = Math.PI;
  nozzle.position.y = -2.1;
  head.add(nozzle);
  const filaMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  const filament = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1, 0.24), filaMat);
  scene.add(filament);
  scene.add(head);

  /* ── részecskék (nyomtatási pára + záró szikraeső) ─────────────── */
  const PN = 90;
  const pPos = new Float32Array(PN * 3);
  const pCol = new Float32Array(PN * 3);
  const pVel = new Float32Array(PN * 3);
  const pLife = new Float32Array(PN);
  const pMax = new Float32Array(PN);
  pPos.fill(0); pLife.fill(0);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3).setUsage(THREE.DynamicDrawUsage));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 1.5, map: dotTex, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true, sizeAttenuation: true
  }));
  points.frustumCulled = false;
  scene.add(points);

  const PALETTE = [new THREE.Color(0x7ee7f5), new THREE.Color(0xffcf8e), new THREE.Color(0xfff3dc)];
  function spawnParticles(x, y, z, n, spd, rise) {
    let made = 0;
    for (let i = 0; i < PN && made < n; i++) {
      if (pLife[i] > 0) continue;
      const a = Math.random() * Math.PI * 2, r = Math.random();
      pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
      pVel[i * 3] = Math.cos(a) * spd * r;
      pVel[i * 3 + 1] = rise + Math.random() * spd * 0.8;
      pVel[i * 3 + 2] = Math.sin(a) * spd * r * 0.6;
      pMax[i] = pLife[i] = 0.5 + Math.random() * 0.7;
      const c = PALETTE[(Math.random() * PALETTE.length) | 0];
      pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
      made++;
    }
  }

  /* ── név → voxelrács ───────────────────────────────────────────── */
  function voxelize(name) {
    const MAXW = 176, MAXH = 36, FONT = '800 100px Sora, Inter, sans-serif';
    const meas = document.createElement('canvas').getContext('2d');
    meas.font = FONT;
    const m = meas.measureText(name);
    const asc = m.actualBoundingBoxAscent || 76;
    const desc = m.actualBoundingBoxDescent || 4;
    const tw = Math.max(10, m.width), th = Math.max(10, asc + desc);
    const s = Math.min(MAXH / th, MAXW / tw);
    const gw = Math.min(MAXW + 4, Math.ceil(tw * s) + 2);
    const gh = Math.min(MAXH + 4, Math.ceil(th * s) + 2);
    const SS = 4;
    const c = document.createElement('canvas');
    c.width = gw * SS; c.height = gh * SS;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.fillStyle = '#fff';
    g.font = '800 ' + (100 * s * SS) + 'px Sora, Inter, sans-serif';
    g.textBaseline = 'alphabetic';
    g.fillText(name, SS, SS * (1 + asc * s));
    const data = g.getImageData(0, 0, c.width, c.height).data;
    const rows = [];
    for (let r = 0; r < gh; r++) {
      const j = gh - 1 - r; // r: sor alulról
      const cols = [];
      for (let i = 0; i < gw; i++) {
        let a = 0;
        for (let sy = 0; sy < SS; sy++) {
          const base = ((j * SS + sy) * c.width + i * SS) * 4 + 3;
          for (let sx = 0; sx < SS; sx++) a += data[base + sx * 4];
        }
        if (a / (SS * SS) > 92) cols.push(i);
      }
      if (cols.length) rows.push({ r, cols });
    }
    return { gw, gh, rows };
  }

  /* ── nyomtatási munka összeállítása ────────────────────────────── */
  const tmpM = new THREE.Matrix4();
  const tmpC = new THREE.Color();
  const cBot = new THREE.Color(0xff8f1f), cMid = new THREE.Color(0xffcf8e), cTop = new THREE.Color(0xfff7e6);
  let job = null;
  let emissiveTarget = 0.22;
  let flash = 0;
  let headT = 0; // 1 = fej látható, 0 = eltűnt
  let hotList = [];

  function buildJob(name) {
    const v = voxelize(name);
    const half = (v.gw - 1) / 2;
    const ipos = [];
    const rowMeta = [];
    let k = 0;
    for (let ri = 0; ri < v.rows.length && k < MAXI; ri++) {
      const row = v.rows[ri];
      const cols = ri % 2 ? row.cols.slice().reverse() : row.cols;
      const start = k;
      for (let n = 0; n < cols.length && k < MAXI; n++) {
        const x = cols[n] - half, y = 0.5 + row.r;
        ipos.push(x, y, 0);
        tmpM.makeTranslation(x, y, 0);
        mesh.setMatrixAt(k, tmpM);
        const t = row.r / Math.max(1, v.gh - 1);
        tmpC.copy(t < 0.55 ? cBot : cMid).lerp(t < 0.55 ? cMid : cTop, t < 0.55 ? t / 0.55 : (t - 0.55) / 0.45);
        const jitter = 0.94 + Math.random() * 0.09;
        tmpC.multiplyScalar(jitter);
        mesh.setColorAt(k, tmpC);
        k++;
      }
      rowMeta.push({
        start, count: k - start, y: 0.5 + row.r,
        x0: cols[0] - half, x1: cols[cols.length - 1] - half,
        dur: 0.05 + (k - start) * 0.012
      });
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mirror.instanceMatrix = mesh.instanceMatrix;
    mirror.instanceColor = mesh.instanceColor;

    // időzítés normalizálása a célhosszra
    let raw = 0;
    rowMeta.forEach((r) => { raw += r.dur; });
    const T = THREE.MathUtils.clamp(2.6 + k * 0.00075, 3, 4.6);
    let acc = 0;
    rowMeta.forEach((r) => { r.dur *= T / raw; r.t0 = acc; acc += r.dur; });

    const textW = v.gw, textH = v.gh;
    drawBed(textW + 26, 42);
    pool.scale.set(textW * 1.15, 16, 1);
    // a fej és a sín a felirat méretéhez igazodik, hogy messziről is látszódjon
    const hs = THREE.MathUtils.clamp(textW / 55, 1.15, 2.4);
    rail.scale.set(textW + 30, hs, hs);

    job = {
      name, total: k, rows: rowMeta, ipos,
      textW, textH, t: 0, row: 0, headScale: hs,
      printing: true, done: false, doneT: 0,
      layers: Math.round(textH * 3.2)
    };
    mesh.count = 0; mirror.count = 0; hot.count = 0;
    hotList = [];
    emissiveTarget = 0.22;
    voxMat.emissiveIntensity = 0.22;
    poolMat.opacity = 0.06;
    headT = 1;
    head.visible = rail.visible = filament.visible = true;
    head.scale.setScalar(hs);
    filament.scale.set(hs, 1.6, hs);
    railMat.opacity = 0.32; headLipMat.opacity = 0.85; filaMat.opacity = 0.9;
    nozzleLight.intensity = 260;
    nozzleLight.visible = true;
    result.hidden = true;
    if (hint) hint.classList.remove('is-on');

    // kamera igazítása az új felirathoz
    orbit.targetY = textH * 0.42;
    orbit.fit = fitDistance(textW, textH);
    orbit.tDist = orbit.fit;
    if (!orbit.everPrinted) {
      orbit.dist = orbit.fit * 1.45;
      orbit.yaw = -0.85; orbit.tYaw = -0.2;
      orbit.pitch = 0.62; orbit.tPitch = 0.34;
      orbit.everPrinted = true;
    } else {
      orbit.dist = Math.max(orbit.dist, orbit.fit);
    }
    nozX = job.rows.length ? job.rows[0].x0 : 0;

    if (reduceMotion) finishJob(true);
  }

  function finishJob(instant) {
    if (!job || job.done) return;
    job.printing = false; job.done = true; job.doneT = elapsed;
    mesh.count = mirror.count = job.total;
    emissiveTarget = 0.72;
    if (instant) {
      voxMat.emissiveIntensity = 0.72;
      poolMat.opacity = 0.26;
      headT = 0; head.visible = rail.visible = filament.visible = false;
      nozzleLight.visible = false;
    } else {
      flash = 1;
      spawnParticles(0, job.textH * 0.55, 3, 46, 26, 10);
    }
    stats.textContent = job.layers + ' réteg · PLA · 0,2 mm · kész ✓';
    cta.href = 'termek.html?id=szam-lampa-nevvel&nev=' + encodeURIComponent(job.name);
    result.hidden = false;
    if (hint) hint.classList.add('is-on');
  }

  /* ── kamera-vezérlés (húzd és forgasd) ─────────────────────────── */
  const orbit = {
    yaw: -0.2, pitch: 0.34, dist: 150,
    tYaw: -0.2, tPitch: 0.34, tDist: 150,
    targetY: 15, fit: 150, vYaw: 0,
    lastUser: -1e9, dragging: false, everPrinted: false
  };
  let nozX = 0;

  function fitDistance(w, h) {
    const vF = THREE.MathUtils.degToRad(camera.fov) / 2;
    const hF = Math.atan(Math.tan(vF) * camera.aspect);
    return Math.max(
      (w * 0.62) / Math.tan(hF),
      (h * 0.62 + 8) / Math.tan(vF)
    ) + 14;
  }

  let px = 0, py = 0;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    orbit.dragging = true;
    orbit.vYaw = 0;
    px = e.clientX; py = e.clientY;
    orbit.lastUser = elapsed;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* szintetikus esemény */ }
    canvas.classList.add('is-drag');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!orbit.dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    orbit.tYaw -= dx * 0.0055;
    orbit.tPitch = THREE.MathUtils.clamp(orbit.tPitch + dy * 0.004, 0.1, 1.12);
    orbit.vYaw = -dx * 0.0055;
    orbit.lastUser = elapsed;
  });
  function endDrag(e) {
    if (!orbit.dragging) return;
    orbit.dragging = false;
    orbit.lastUser = elapsed;
    canvas.classList.remove('is-drag');
    try { if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); } catch (err) { /* szintetikus esemény */ }
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  /* ── méretezés ─────────────────────────────────────────────────── */
  function resize() {
    const w = Math.max(2, stage.clientWidth);
    const h = Math.max(2, stage.clientHeight);
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w * dpr > 1700) dpr = 1700 / w;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (job) { orbit.fit = fitDistance(job.textW, job.textH); orbit.tDist = orbit.fit; }
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  /* ── fő ciklus ─────────────────────────────────────────────────── */
  const clock = new THREE.Clock();
  let elapsed = 0;
  let running = false;
  let raf = null;

  function tick() {
    raf = running ? requestAnimationFrame(tick) : null;
    const dt = Math.min(0.05, clock.getDelta());
    elapsed += dt;

    /* nyomtatás előrehaladása */
    if (job && job.printing) {
      job.t += dt;
      let reveal = mesh.count;
      while (job.row < job.rows.length) {
        const row = job.rows[job.row];
        const rt = (job.t - row.t0) / row.dur;
        if (rt >= 1) { reveal = row.start + row.count; job.row++; continue; }
        if (rt >= 0) {
          reveal = row.start + Math.floor(rt * row.count);
          nozX += ((row.x0 + (row.x1 - row.x0) * rt) - nozX) * Math.min(1, dt * 16);
          const hy = row.y, hs = job.headScale;
          head.position.set(nozX, hy + 3.4 * hs + Math.sin(elapsed * 34) * 0.05, 0);
          rail.position.set(0, hy + 3.4 * hs, -0.2);
          filament.position.set(nozX, hy + 0.6 * hs + 0.5, 0);
          filament.scale.y = 1.7 * hs;
          nozzleLight.position.set(nozX, hy + 1.4, 3.5);
          if (Math.random() < 0.75) spawnParticles(nozX, hy + 0.8, 1.6, 1, 2.2, 3.2);
        }
        break;
      }
      if (reveal > mesh.count) {
        for (let i = mesh.count; i < reveal && hotList.length < HOT * 2; i++) hotList.push({ i, t0: elapsed });
        mesh.count = reveal;
      }
      mirror.count = mesh.count;
      if (job.row >= job.rows.length) finishJob(false);
    }

    /* izzó friss voxelek frissítése */
    let hn = 0;
    if (hotList.length) {
      const alive = [];
      for (const e of hotList) {
        const age = (elapsed - e.t0) / 0.55;
        if (age >= 1) continue;
        alive.push(e);
        if (hn >= HOT) continue;
        const p = job.ipos;
        const sc = 1.24 - age * 0.34;
        tmpM.makeTranslation(p[e.i * 3], p[e.i * 3 + 1], p[e.i * 3 + 2]);
        tmpM.scale(new THREE.Vector3(sc, sc, 1.02));
        hot.setMatrixAt(hn, tmpM);
        const f = Math.pow(1 - age, 1.6);
        hot.setColorAt(hn, tmpC.setRGB(1.9 * f, 1.35 * f, 0.7 * f));
        hn++;
      }
      hotList = alive;
      if (hn) {
        hot.instanceMatrix.needsUpdate = true;
        if (hot.instanceColor) hot.instanceColor.needsUpdate = true;
      }
    }
    hot.count = hn;

    /* fej eltűnése a kész munka után */
    if (job && job.done && headT > 0) {
      headT = Math.max(0, headT - dt * 1.6);
      const e = headT * headT;
      head.scale.setScalar(Math.max(0.001, e * job.headScale));
      head.position.y += dt * 14;
      railMat.opacity = 0.32 * e;
      headLipMat.opacity = 0.85 * e;
      filaMat.opacity = 0.9 * e;
      nozzleLight.intensity = 260 * e;
      if (headT === 0) { head.visible = rail.visible = filament.visible = false; nozzleLight.visible = false; }
    }

    /* fények, izzás, villanás */
    voxMat.emissiveIntensity += (emissiveTarget - voxMat.emissiveIntensity) * Math.min(1, dt * 2.6);
    mirrorMat.emissiveIntensity = voxMat.emissiveIntensity * 0.28;
    poolMat.opacity += ((job && job.done ? 0.26 : 0.05) - poolMat.opacity) * Math.min(1, dt * 2);
    flash = Math.max(0, flash - dt * 1.3);
    bloom.strength = 0.55 + flash * 1.0;

    /* részecskék */
    for (let i = 0; i < PN; i++) {
      if (pLife[i] <= 0) continue;
      pLife[i] -= dt;
      if (pLife[i] <= 0) { pCol[i * 3] = pCol[i * 3 + 1] = pCol[i * 3 + 2] = 0; continue; }
      pPos[i * 3] += pVel[i * 3] * dt;
      pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
      pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
      pVel[i * 3 + 1] -= 6 * dt * (pMax[i] > 1 ? 1 : -0.4); // szikra esik, pára emelkedik
      const f = Math.pow(Math.max(0, pLife[i] / pMax[i]), 1.4) * 0.9;
      const c = pCol;
      const base = i * 3;
      const norm = Math.max(c[base], c[base + 1], c[base + 2], 0.001);
      c[base] = c[base] / norm * f; c[base + 1] = c[base + 1] / norm * f; c[base + 2] = c[base + 2] / norm * f;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;

    /* kamera */
    const idle = !orbit.dragging && elapsed - orbit.lastUser > 3.5;
    if (!orbit.dragging && Math.abs(orbit.vYaw) > 0.0001) {
      orbit.tYaw += THREE.MathUtils.clamp(orbit.vYaw, -0.045, 0.045);
      orbit.vYaw *= 0.9;
    }
    if (idle) {
      // tétlenségnél lassan visszaúszunk a legközelebbi "szemből" nézetbe
      const front = -0.2 + Math.round((orbit.tYaw + 0.2) / (Math.PI * 2)) * Math.PI * 2;
      orbit.tYaw += (front - orbit.tYaw) * Math.min(1, dt * 0.4);
      orbit.tPitch += (0.34 - orbit.tPitch) * Math.min(1, dt * 0.4);
    }
    const k2 = 1 - Math.exp(-dt * 4.2);
    orbit.yaw += (orbit.tYaw - orbit.yaw) * k2;
    orbit.pitch += (orbit.tPitch - orbit.pitch) * k2;
    orbit.dist += (orbit.tDist - orbit.dist) * (1 - Math.exp(-dt * 2.2));
    let effYaw = orbit.yaw;
    if (idle && !reduceMotion && job && job.done) {
      effYaw += Math.sin((elapsed - orbit.lastUser - 3.5) * 0.32) * 0.42 * Math.min(1, (elapsed - orbit.lastUser - 3.5) / 3);
    }
    const ty = orbit.targetY;
    camera.position.set(
      Math.sin(effYaw) * Math.cos(orbit.pitch) * orbit.dist,
      ty + Math.sin(orbit.pitch) * orbit.dist,
      Math.cos(effYaw) * Math.cos(orbit.pitch) * orbit.dist
    );
    camera.lookAt(0, ty, 0);

    composer.render();
  }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) { clock.getDelta(); raf = requestAnimationFrame(tick); }
    else if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  const io = new IntersectionObserver((entries) => {
    setRunning(entries[0].isIntersecting && !document.hidden);
  }, { threshold: 0, rootMargin: '60px' });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setRunning(false);
    else io.takeRecords(); // az observer következő jelzése visszakapcsolja
  });

  /* ── űrlap + automatikus demó ──────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setRunning(true);
    buildJob((input.value.trim() || 'Layero').slice(0, 14));
  });

  let demoStarted = false;
  const demo = () => {
    if (demoStarted) return;
    demoStarted = true;
    const go = () => buildJob('Layero');
    if (document.fonts && document.fonts.ready) {
      Promise.all([document.fonts.load('800 100px Sora'), document.fonts.ready]).then(go, go);
    } else go();
  };
  const demoIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { demo(); demoIO.disconnect(); }
  }, { threshold: 0.3 });
  demoIO.observe(canvas);
}

/* ── 2D tartalék, ha nincs WebGL ─────────────────────────────────── */
function fallback2D() {
  const input = document.getElementById('sh-lab-input');
  const result = document.getElementById('sh-lab-result');
  const stats = document.getElementById('sh-lab-stats');
  const cta = document.getElementById('sh-lab-cta');
  const form = document.getElementById('sh-lab-form');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const LW = 760, LH = 380;
  canvas.width = LW * dpr; canvas.height = LH * dpr;
  const g = canvas.getContext('2d');
  g.scale(dpr, dpr);

  function draw(name) {
    g.clearRect(0, 0, LW, LH);
    const size = Math.min(150, ((LW - 90) / Math.max(2, name.length)) * 1.55);
    const grad = g.createLinearGradient(0, LH * 0.52 - size * 0.6, 0, LH * 0.52 + size * 0.6);
    grad.addColorStop(0, '#fff3dc'); grad.addColorStop(0.55, '#ffcf8e'); grad.addColorStop(1, '#ff9f2d');
    g.fillStyle = grad;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 ' + size + 'px Sora, Inter, sans-serif';
    g.shadowColor = 'rgba(255,159,45,0.55)'; g.shadowBlur = 26;
    g.fillText(name, LW / 2, LH * 0.52);
    g.shadowBlur = 0;
    g.strokeStyle = 'rgba(126,231,245,0.28)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(30, LH * 0.52 + size * 0.72); g.lineTo(LW - 30, LH * 0.52 + size * 0.72); g.stroke();
    stats.textContent = Math.round(size * 0.77) + ' réteg · PLA · 0,2 mm · kész ✓';
    cta.href = 'termek.html?id=szam-lampa-nevvel&nev=' + encodeURIComponent(name);
    result.hidden = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    draw((input.value.trim() || 'Layero').slice(0, 14));
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw('Layero'));
  else draw('Layero');
}
