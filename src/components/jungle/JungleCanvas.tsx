/**
 * JungleCanvas — full-viewport Three.js autumn forest world.
 * Inspired by mountain lake + autumnal forest.
 * Fixed behind all content; scroll drives camera depth.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── TOON GRADIENT (softer 4-step for daylight look) ─────────────────────────
function makeToonGrad(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 1;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#555555'; ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = '#909090'; ctx.fillRect(1, 0, 1, 1);
  ctx.fillStyle = '#c8c8c8'; ctx.fillRect(2, 0, 1, 1);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(3, 0, 1, 1);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function toon(hex: number, grad: THREE.CanvasTexture, opts: Partial<THREE.MeshToonMaterialParameters> = {}) {
  return new THREE.MeshToonMaterial({ color: hex, gradientMap: grad, ...opts });
}

// ─── AUTUMN FOREST TREE ───────────────────────────────────────────────────────
// Palette pulled from reference image: dark greens → bright greens → yellows → oranges → rust
const AUTUMN_CANOPY = [
  0x2d5c1a, // deep evergreen
  0x3d7a25, // mid green
  0x5a9e30, // bright green
  0x7ab830, // yellow-green
  0x9dc830, // lime
  0xc8a020, // golden yellow
  0xd4781a, // amber orange
  0xc05018, // rust orange
  0x7a3515, // deep rust
  0x4a7a28, // sage green
];
const BARKS = [0x5c3d20, 0x7a5030, 0x4a3018, 0x6b4428, 0x8a6240];

function makeTree(grad: THREE.CanvasTexture, scale = 1): THREE.Group {
  const g = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055 * scale, 0.12 * scale, 1.8 * scale, 7),
    toon(BARKS[Math.floor(Math.random() * BARKS.length)], grad),
  );
  trunk.position.y = 0.9 * scale;
  // Slight lean
  trunk.rotation.z = (Math.random() - 0.5) * 0.08;
  g.add(trunk);

  // Rounded canopy — spheres for a leafy deciduous feel
  const layers = 2 + Math.floor(Math.random() * 3);
  const baseCol = AUTUMN_CANOPY[Math.floor(Math.random() * AUTUMN_CANOPY.length)];
  for (let i = 0; i < layers; i++) {
    const r = (0.7 - i * 0.12) * scale * (0.55 + Math.random() * 0.4);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(r, 7, 5),
      toon(
        i === 0 ? baseCol : AUTUMN_CANOPY[Math.floor(Math.random() * AUTUMN_CANOPY.length)],
        grad,
        { transparent: true, opacity: 0.88 + Math.random() * 0.12 },
      ),
    );
    sphere.position.set(
      (Math.random() - 0.5) * 0.35 * scale,
      (1.8 + i * 0.55 + Math.random() * 0.3) * scale,
      (Math.random() - 0.5) * 0.35 * scale,
    );
    g.add(sphere);
  }
  return g;
}

// ─── TALL CONIFER (dark evergreen cone) ──────────────────────────────────────
function makeConifer(grad: THREE.CanvasTexture, scale = 1): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(
    new THREE.CylinderGeometry(0.04 * scale, 0.1 * scale, 2.2 * scale, 6),
    toon(BARKS[1], grad),
  ));
  [0, 1, 2, 3].forEach((i) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry((0.7 - i * 0.12) * scale, (0.9 - i * 0.1) * scale, 7),
      toon(i < 2 ? 0x2a5518 : 0x3d7025, grad),
    );
    cone.position.y = (1.0 + i * 0.65) * scale;
    g.add(cone);
  });
  return g;
}

// ─── BIRCH (white trunk, light canopy) ───────────────────────────────────────
function makeBirch(grad: THREE.CanvasTexture, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const lean = (Math.random() - 0.5) * 0.12;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(lean, 1.0 * scale, 0),
    new THREE.Vector3(lean * 1.5, 2.2 * scale, 0),
  ]);
  g.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 8, 0.055 * scale, 6),
    toon(0xd4c8a8, grad), // pale birch bark
  ));
  // Light airy canopy
  const col = AUTUMN_CANOPY[3 + Math.floor(Math.random() * 4)]; // yellows/oranges
  [0, 1].forEach((i) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry((0.55 - i * 0.1) * scale, 6, 5),
      toon(col, grad, { transparent: true, opacity: 0.80 }),
    );
    sphere.position.set((Math.random()-0.5)*0.2*scale, (2.2 + i*0.5)*scale, 0);
    g.add(sphere);
  });
  return g;
}

// ─── GROUND (brown earth + grass patches) ────────────────────────────────────
function makeGround(grad: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();

  // Main earth
  const earth = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 130, 1, 1),
    toon(0x7a5530, grad), // warm brown earth
  );
  earth.rotation.x = -Math.PI / 2;
  earth.position.set(0, -1.2, -45);
  g.add(earth);

  // Grass meadow patches
  const GRASSES = [0x6a9a30, 0x5a8a25, 0x7ab035, 0x4a7a20];
  for (let i = 0; i < 30; i++) {
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(1.5 + Math.random() * 2.5, 6),
      toon(GRASSES[i % GRASSES.length], grad),
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      (Math.random() - 0.5) * 20,
      -1.18,
      -Math.random() * 90,
    );
    g.add(patch);
  }
  return g;
}

// ─── WATER LAKE ──────────────────────────────────────────────────────────────
function makeWater() {
  const geo = new THREE.PlaneGeometry(14, 120, 20, 40);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uSky:    { value: new THREE.Color(0x7aa8c0) },  // sky reflection
      uDeep:   { value: new THREE.Color(0x2a4030) },  // deep water
      uForest: { value: new THREE.Color(0x3a5a28) },  // forest reflection
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        vUv = uv;
        vec3 p = position;
        float w = sin(p.x * 2.5 + uTime * 1.2) * 0.05
                + sin(p.y * 1.8 + uTime * 0.9) * 0.04;
        p.z += w;
        vWave = w;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3  uSky;
      uniform vec3  uDeep;
      uniform vec3  uForest;
      uniform float uTime;
      varying vec2  vUv;
      varying float vWave;
      void main() {
        // Forest reflection in upper half, sky below
        float forestMix = smoothstep(0.3, 0.7, vUv.y);
        vec3 reflect = mix(uSky, uForest, forestMix);
        // Ripple shimmer
        float ripple = sin(vUv.x * 18.0 + uTime * 2.5) * sin(vUv.y * 12.0 + uTime * 1.8);
        ripple = ripple * 0.5 + 0.5;
        vec3 col = mix(uDeep, reflect, 0.38 + ripple * 0.18 + vWave * 2.0);
        // Foam/edge highlight
        float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
        col = mix(vec3(0.85, 0.92, 0.88), col, edge);
        gl_FragColor = vec4(col, 0.88);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return { mesh, mat };
}

// ─── DISTANT HILL SILHOUETTES ─────────────────────────────────────────────────
function makeHills(grad: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const HILL_COLS = [0x3a5a28, 0x4a6e30, 0x5a8038, 0x304820];
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 6; i++) {
      const w = 15 + Math.random() * 12;
      const h = 6 + Math.random() * 10;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 5),
        toon(HILL_COLS[i % HILL_COLS.length], grad),
      );
      sphere.scale.set(w, h, 8 + Math.random() * 6);
      sphere.position.set(
        side * (10 + Math.random() * 8),
        h * 0.35,
        -20 - i * 14 + Math.random() * 6,
      );
      g.add(sphere);
    }
  }
  return g;
}

// ─── LIGHT CANOPY (sparse — lets sky light through) ──────────────────────────
function makeCanopy(grad: THREE.CanvasTexture): THREE.Group {
  const g = new THREE.Group();
  const LEAF_COLS = [0x4a8a28, 0x5aa030, 0x7ab830, 0xc8a020, 0xd47818, 0x6a9828];
  for (let i = 0; i < 50; i++) {
    const r = 0.8 + Math.random() * 1.6;
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(r, 6),
      toon(LEAF_COLS[i % LEAF_COLS.length], grad, {
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45 + Math.random() * 0.30, // much more transparent → light through
      }),
    );
    mesh.position.set(
      (Math.random() - 0.5) * 22,
      6.5 + Math.random() * 4,
      -Math.random() * 95,
    );
    mesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    mesh.rotation.z = Math.random() * Math.PI;
    g.add(mesh);
  }
  return g;
}

// ─── BLUE PARROT ─────────────────────────────────────────────────────────────
function makeParrot(grad: THREE.CanvasTexture) {
  const g = new THREE.Group();

  // Main plumage — vivid cobalt blue
  const bodyMat    = toon(0x1565c0, grad);
  const wingMat    = toon(0x1976d2, grad, { side: THREE.DoubleSide });
  const bellyMat   = toon(0x42a5f5, grad); // lighter belly
  const beakMat    = toon(0xd4a820, grad); // hooked yellow beak
  const eyeRingMat = toon(0xe53935, grad); // red eye-ring (parrot hallmark)

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), bodyMat);
  body.scale.set(1, 0.78, 1.55);
  g.add(body);

  // Belly highlight
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), bellyMat);
  belly.scale.set(0.65, 0.55, 1.0);
  belly.position.set(0, -0.05, 0.04);
  g.add(belly);

  // Head (slightly larger for parrot proportion)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 7), bodyMat);
  head.position.set(0, 0.12, 0.19);
  head.scale.set(1, 1.05, 1);
  g.add(head);

  // Red eye-ring
  const leftRing  = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.009, 6, 12), eyeRingMat);
  const rightRing = leftRing.clone();
  leftRing.position.set(-0.055, 0.16, 0.25);
  rightRing.position.set( 0.055, 0.16, 0.25);
  leftRing.rotation.y  = Math.PI / 2;
  rightRing.rotation.y = Math.PI / 2;
  g.add(leftRing, rightRing);

  // Eyes
  const eyeMat = toon(0x111111, grad);
  [-0.055, 0.055].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 5), eyeMat);
    eye.position.set(x, 0.165, 0.26);
    g.add(eye);
  });

  // Hooked parrot beak — upper and lower mandible
  const upperBeak = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.12, 5), beakMat);
  upperBeak.rotation.x = Math.PI / 2;
  upperBeak.position.set(0, 0.11, 0.31);
  upperBeak.scale.set(1, 1, 1);
  g.add(upperBeak);

  const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.07, 5), beakMat);
  lowerBeak.rotation.x = Math.PI / 2;
  lowerBeak.position.set(0, 0.085, 0.30);
  g.add(lowerBeak);

  // Wings — pivot groups
  const leftWing  = new THREE.Group();
  const rightWing = new THREE.Group();

  const buildWing = () => {
    const wg = new THREE.Group();
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.09, 5), wingMat);
    inner.rotation.z = Math.PI / 2;
    inner.position.x = -0.17;
    wg.add(inner);
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.08, 4), toon(0x0d47a1, grad, { side: THREE.DoubleSide }));
    outer.rotation.z = Math.PI / 2;
    outer.position.set(-0.32, -0.06, 0);
    wg.add(outer);
    return wg;
  };

  leftWing.add(buildWing());
  leftWing.position.x = -0.1;
  g.add(leftWing);

  const rw = buildWing(); rw.scale.x = -1;
  rightWing.add(rw);
  rightWing.position.x = 0.1;
  g.add(rightWing);

  // Long parrot tail feathers
  [0, -0.04, 0.04].forEach((offset) => {
    const feather = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.004, 0.45, 4),
      toon(0x0a3d8f, grad),
    );
    feather.position.set(offset * 3, -0.05, -0.27);
    feather.rotation.x = 0.28;
    g.add(feather);
  });

  return { group: g, leftWing, rightWing };
}

// ─── FALLING AUTUMN LEAVES ────────────────────────────────────────────────────
function makeLeaves(): THREE.Points {
  const N = 180;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const LEAF_COLORS = [
    [0.78, 0.63, 0.12], [0.85, 0.47, 0.10], [0.70, 0.30, 0.08],
    [0.45, 0.72, 0.18], [0.60, 0.85, 0.20],
  ];
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random()-0.5)*24;
    pos[i*3+1] = Math.random()*10;
    pos[i*3+2] = -Math.random()*95;
    const c = LEAF_COLORS[i % LEAF_COLORS.length];
    col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.14,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });
  return new THREE.Points(geo, mat);
}

// ─── LIGHT DAPPLE PARTICLES (sunlight specks) ────────────────────────────────
function makeDapples(): THREE.Points {
  const N = 60;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random()-0.5)*18; pos[i*3+1] = 0.5+Math.random()*6; pos[i*3+2] = -Math.random()*90;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xfff0a0, size: 0.18, transparent: true, opacity: 0.55, sizeAttenuation: true,
  }));
}

// ─── BUILD SCENE ─────────────────────────────────────────────────────────────
function buildScene() {
  const scene = new THREE.Scene();

  // Light overcast sky — matches reference image (near-white grey-blue)
  const SKY = 0xd8e4d8;
  scene.background = new THREE.Color(SKY);
  // Light fog for distance haze — warm grey-green
  scene.fog = new THREE.FogExp2(0xc8d8c0, 0.022);

  const grad = makeToonGrad();

  // ── Lighting (bright daylight) ───────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xd4e8d0, 1.1));

  const sun = new THREE.DirectionalLight(0xfffae8, 1.6);
  sun.position.set(6, 16, 8);
  sun.castShadow = true;
  scene.add(sun);

  // Soft sky fill from above
  const sky = new THREE.HemisphereLight(0xd0eaff, 0x8a6a40, 0.7);
  scene.add(sky);

  // Warm bounce from ground
  const bounce = new THREE.PointLight(0xd4b870, 0.5, 35);
  bounce.position.set(0, -0.5, -20);
  scene.add(bounce);

  // ── World ────────────────────────────────────────────────────────────────
  scene.add(makeGround(grad));
  scene.add(makeHills(grad));
  scene.add(makeCanopy(grad));

  // Trees along the path
  const FOREST_DEPTH = 95;
  const STEP = 4;
  for (let z = 0; z > -FOREST_DEPTH; z -= STEP) {
    const s = 0.9 + Math.random() * 1.1;
    const treeFn = () => {
      const r = Math.random();
      if (r < 0.35) return makeBirch(grad, s);
      if (r < 0.65) return makeConifer(grad, s * 0.8);
      return makeTree(grad, s);
    };

    // Left
    const lt = treeFn();
    lt.position.set(-(3.5 + Math.random() * 5.5), -1.2, z + (Math.random()-0.5)*3);
    lt.rotation.y = Math.random() * Math.PI * 2;
    scene.add(lt);

    // Right
    const rt = treeFn();
    rt.position.set(3.5 + Math.random() * 5.5, -1.2, z + (Math.random()-0.5)*3);
    rt.rotation.y = Math.random() * Math.PI * 2;
    scene.add(rt);

    // Background trees (wider, smaller)
    if (Math.random() > 0.5) {
      const bt = treeFn();
      bt.position.set((Math.random()-0.5)*18, -1.2, z - 5);
      bt.scale.setScalar(0.7 + Math.random() * 0.4);
      scene.add(bt);
    }
  }

  // Water lake (centre-left, like reference)
  const { mesh: water, mat: waterMat } = makeWater();
  water.position.set(-3, -1.16, -45);
  scene.add(water);

  // Particles
  const leaves  = makeLeaves();
  const dapples = makeDapples();
  scene.add(leaves, dapples);

  // Blue parrot
  const { group: parrot, leftWing, rightWing } = makeParrot(grad);
  parrot.position.set(0, 1.2, -2);
  parrot.scale.setScalar(1.5);
  scene.add(parrot);

  return { scene, parrot, leftWing, rightWing, waterMat, leaves, dapples };
}

// ─── REACT COMPONENT ─────────────────────────────────────────────────────────
export default function JungleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollY   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0.9, 4);

    const { scene, parrot, leftWing, rightWing, waterMat, leaves, dapples } = buildScene();

    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let camZ = 4, camY = 0.9;
    let frame = 0;
    let raf: number;

    const leafPos   = (leaves.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const dapplePos = (dapples.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.016;
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const scroll  = totalH > 0 ? scrollY.current / totalH : 0;

      // Camera travels deeper as user scrolls
      const targetZ = 4 - scroll * 92;
      const targetY = 0.9 + scroll * 0.5;
      camZ += (targetZ - camZ) * 0.055;
      camY += (targetY - camY) * 0.055;

      const sway = Math.sin(t * 0.18) * 0.15;
      const bob  = Math.sin(t * 0.5) * 0.05;
      camera.position.set(sway, camY + bob, camZ);
      camera.lookAt(sway * 0.4, camY - 0.2, camZ - 7);

      // Water
      (waterMat as THREE.ShaderMaterial).uniforms.uTime.value = t;

      // ── Blue parrot ──────────────────────────────────────────────────
      const pTargetZ = camZ - 3.8 - Math.sin(t * 0.22) * 2;
      const pTargetX = Math.sin(t * 0.42) * 1.2;
      const pTargetY = camY + 0.6 + Math.sin(t * 0.33) * 0.4;
      parrot.position.z += (pTargetZ - parrot.position.z) * 0.04;
      parrot.position.x += (pTargetX - parrot.position.x) * 0.04;
      parrot.position.y += (pTargetY - parrot.position.y) * 0.04;

      const flapAmp = 0.8, flapHz = 4.5;
      leftWing.rotation.z  =  Math.sin(t * flapHz) * flapAmp;
      rightWing.rotation.z = -Math.sin(t * flapHz) * flapAmp;
      const dx = pTargetX - parrot.position.x;
      parrot.rotation.z  = -dx * 0.35;
      parrot.rotation.y  =  Math.atan2(dx, 1) * 0.45;

      // ── Autumn leaves ────────────────────────────────────────────────
      for (let i = 0; i < leafPos.length / 3; i++) {
        leafPos[i*3]   += Math.sin(t * 0.7 + i) * 0.004;
        leafPos[i*3+1] -= 0.0045;
        leafPos[i*3+2] += 0.002;
        if (leafPos[i*3+1] < -1.3) {
          leafPos[i*3+1] = 8 + Math.random() * 3;
          leafPos[i*3+2] = camZ - 5 - Math.random() * 28;
        }
      }
      leaves.geometry.attributes.position.needsUpdate = true;

      // ── Dappled sunlight specks ───────────────────────────────────────
      (dapples.material as THREE.PointsMaterial).opacity = 0.3 + Math.abs(Math.sin(t * 0.9)) * 0.4;
      for (let i = 0; i < dapplePos.length / 3; i++) {
        dapplePos[i*3]   += Math.sin(t * 0.5 + i * 1.1) * 0.003;
        dapplePos[i*3+1] += Math.cos(t * 0.4 + i * 0.8) * 0.002;
        dapplePos[i*3+2] += 0.006;
        if (dapplePos[i*3+2] > camZ + 2) {
          dapplePos[i*3+2] = camZ - 25 - Math.random() * 20;
        }
      }
      dapples.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', display: 'block' }}
    />
  );
}

