import * as THREE from "three";
import type { Col } from "./collide";
import {
  HEIGHT,
  R,
  STALLS,
  ZONES,
  midCW,
  normSpan,
  polar,
  tangent,
  type Zone,
} from "./layout";

const H = HEIGHT;

export type Pavilion = {
  solid: THREE.Group;
  ceiling: THREE.Group;
  cols: Col[];
  setRoof: (on: boolean) => void;
  setInterior: (on: boolean) => void;
};

export function createPavilion(scene: THREE.Scene): Pavilion {
  const solid = new THREE.Group();
  solid.name = "pavilion";
  scene.add(solid);
  const labels = new THREE.Group();
  labels.name = "labels";
  scene.add(labels);
  const ceiling = new THREE.Group();
  ceiling.name = "ceiling";
  solid.add(ceiling);

  const cols: Col[] = [];

  const plaster = mat(0xf4f0e8, { roughness: 0.88 });
  const stone = mat(0xd7d0c4, { roughness: 0.94 });
  const timber = mat(0x6d4b32, { roughness: 0.7 });
  const dark = mat(0x2a2622, { roughness: 0.5, metalness: 0.18 });
  const brass = mat(0xb08a56, { roughness: 0.32, metalness: 0.7 });
  const frame = mat(0x322e2a, { roughness: 0.42, metalness: 0.48 });
  const clay = mat(0xc46b45, { roughness: 0.52 });
  const sand = mat(0xd7b98a, { roughness: 0.95 });
  const sandDeep = mat(0xb8894e, { roughness: 0.9 });
  const green = mat(0x2c6b45, { roughness: 0.35, emissive: 0x123222, emissiveIntensity: 0.45 });
  const screenMat = mat(0xf6f1e6, { roughness: 0.4, emissive: 0xf0e2c4, emissiveIntensity: 0.42 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xc5d6de,
    roughness: 0.06,
    metalness: 0.04,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glow = mat(0xd7efe6, { roughness: 0.25, emissive: 0x1e6a52, emissiveIntensity: 0.9 });

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(40, 80),
    mat(0xc9c1b4, { roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  ground.name = "skip-export";
  scene.add(ground);

  const slab = new THREE.Mesh(new THREE.CircleGeometry(R.outer + 0.05, 96), stone);
  slab.rotation.x = -Math.PI / 2;
  slab.receiveShadow = true;
  slab.name = "slab";
  solid.add(slab);

  const coreFloor = new THREE.Mesh(new THREE.CircleGeometry(R.roomIn - R.coreWall, 72), dark);
  coreFloor.rotation.x = -Math.PI / 2;
  coreFloor.position.y = 0.012;
  coreFloor.receiveShadow = true;
  solid.add(coreFloor);

  addRing(solid, 0.72, 1.15, 0.02, brass);
  addRing(solid, 1.45, 1.95, 0.02, mat(0x4a433c, { roughness: 0.6, metalness: 0.2 }));
  addRing(solid, 2.15, 2.45, 0.02, brass);

  for (const zone of ZONES) {
    const g = sectorFloor(zone.cw0, zone.cw1, R.roomIn, R.roomOut - R.roomWall, 0.02);
    const mesh = new THREE.Mesh(g, mat(new THREE.Color(zone.swatch).getHex(), { roughness: 0.92 }));
    mesh.receiveShadow = true;
    mesh.name = zone.id;
    solid.add(mesh);
  }

  const gallery = sectorFloor(0, 360, R.roomOut, R.walkMax, 0.018);
  const galleryMesh = new THREE.Mesh(gallery, mat(0xe4dcd0, { roughness: 0.9 }));
  galleryMesh.receiveShadow = true;
  solid.add(galleryMesh);

  cols.push({ kind: "bound", r: R.walkMax, gap0: 171, gap1: 189, rOut: R.porch });

  for (const zone of ZONES) {
    const door = zone.door ?? midCW(zone.cw0, zone.cw1);
    addArcWall(R.roomIn - R.coreWall, R.roomIn, zone.cw0, zone.cw1, door, 1.45, true);
    addArcWall(R.roomOut - R.roomWall, R.roomOut, zone.cw0, zone.cw1, door, 1.75, true);
    addRadialDoor(zone.cw0, R.roomIn, R.roomOut - R.roomWall);
  }

  // Toilets tucked into the west side of the foyer. The west wall is the foyer radial wall.
  for (let i = 0; i < STALLS.length; i++) {
    const s = STALLS[i];
    if (i > 0) addRadialSolid(s.cw0, R.stall0, R.stall1, 0, H, true);
    addArcWall(R.stall1, R.stall1 + 0.14, s.cw0, s.cw1, midCW(s.cw0, s.cw1), 0.78, true);
  }
  const last = STALLS[STALLS.length - 1];
  addRadialSolid(last.cw1, R.stall0, R.stall1, 0, H, true);

  // South arc wall inside the rotunda — the heavy black arc on the plan.
  addArcSolid(2.62, 3.32, 118, 248, 0, 2.15, true, dark);

  addCyl(0.52, 0.58, 0.72, 28, 0, 0.36, 0, brass, 0.62);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 20), brass);
  orb.position.y = 1.18;
  orb.castShadow = true;
  solid.add(orb);

  // Straight flight. The zigzag on the sheet is the stair cut-mark.
  for (let i = 0; i < 8; i++) {
    const h = 0.07 * (8 - i);
    const z = -3.78 - i * 0.2;
    addBox(2.05, h, 0.2, 0, h / 2, z, 0, mat(0x3a342e, { roughness: 0.55, metalness: 0.12 }));
  }

  const stele = polar(152, 4.55);
  addBox(0.26, 1.35, 0.26, stele.x, 0.68, stele.z, 0, green, { blockR: 0.22 });

  buildProps();
  buildSkin();
  buildCeiling();
  buildLabels();

  const sun = new THREE.DirectionalLight(0xfff4e4, 2.35);
  sun.position.set(14, 24, -10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.045;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xd5e2ee, 0xe7d7c4, 0.72));

  const oculus = new THREE.PointLight(0xfff3dd, 16, 18, 2);
  oculus.position.set(0, 5.4, 0);
  scene.add(oculus);

  const fills: THREE.PointLight[] = [];
  for (const zone of ZONES) {
    const p = polar(midCW(zone.cw0, zone.cw1), 8.1);
    const light = new THREE.PointLight(0xfff1de, 2.2, 11, 2);
    light.position.set(p.x, 3.35, p.z);
    scene.add(light);
    fills.push(light);
  }

  scene.background = new THREE.Color(0xd7e0e8);
  scene.fog = new THREE.Fog(0xd7e0e8, 36, 78);

  return {
    solid,
    ceiling,
    cols,
    setRoof(on: boolean) {
      ceiling.visible = on;
    },
    setInterior(on: boolean) {
      for (const light of fills) light.intensity = on ? 11 : 2.2;
    },
  };

  function buildProps() {
    // Foyer desk and bench
    placeBox(12, 9.55, 2.2, 0.88, 0.58, 0.44, timber, true);
    placeBox(28, 9.3, 1.6, 0.42, 0.46, 0.21, timber, false);

    // Creative: two molecules and a clay blob
    molecule(55, 7.55, 1);
    molecule(72, 8.7, 0.75);
    const blobP = polar(58, 9.35);
    const blob = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 18), clay);
    blob.scale.set(1.15, 0.78, 0.7);
    blob.position.set(blobP.x, 0.42, blobP.z);
    blob.castShadow = true;
    solid.add(blob);
    cols.push({ kind: "circ", x: blobP.x, z: blobP.z, rad: 0.5 });

    // Experience rings
    floorRing(112, 8.05, 0.9, glow);
    floorRing(124, 9.15, 0.55, glow);
    addLabel(labels, "AI 互动", "", polar(112, 8.05), 2.2);

    // Retail: radial counter, triangles, gondola
    const tng = tangent(140);
    const base = polar(140, 8.15);
    addBox(
      0.5,
      0.9,
      3.15,
      base.x + tng.x * 0.85,
      0.45,
      base.z + tng.z * 0.85,
      (140 * Math.PI) / 180,
      dark,
      { block: true },
    );
    tri(156, 7.7);
    tri(170, 8.55);
    tri(184, 7.85);
    placeBox(166, 9.55, 1.15, 0.92, 1.7, 0.46, frame, true);

    // Gallery I screens
    screen(208, 8.7);
    screen(222, 7.45);

    // Interpretation
    placeBox(248, 7.9, 0.7, 1.05, 0.42, 0.52, timber, true);
    placeBox(260, 9.15, 1.5, 0.42, 0.48, 0.21, timber, false);

    // Sand table
    const sandMid = midCW(274, 302);
    const sp = polar(sandMid, 8.15);
    const sy = (sandMid * Math.PI) / 180;
    addBox(2.35, 0.78, 1.35, sp.x, 0.39, sp.z, sy, timber, { block: true });
    addBox(1.7, 0.08, 0.95, sp.x, 0.82, sp.z, sy, sand);
    addBox(1.05, 0.07, 0.6, sp.x, 0.9, sp.z, sy, sandDeep);
    addBox(0.48, 0.06, 0.3, sp.x, 0.96, sp.z, sy, sandDeep);

    // Gallery II
    pedestal(310, 7.15);
    pedestal(320, 9.0);
    screen(306, 8.15);
    screen(326, 7.7);
  }

  function buildSkin() {
    const gap = 8 * (Math.PI / 180);
    const start = (180 * Math.PI) / 180 + gap;
    const length = Math.PI * 2 - gap * 2;
    for (const radius of [13.4, 12.7]) {
      const geo = new THREE.CylinderGeometry(radius, radius, H, 96, 1, true, start, length);
      const mesh = new THREE.Mesh(geo, glass);
      mesh.position.y = H / 2;
      mesh.name = "glass";
      solid.add(mesh);
    }
    addArcSolid(13.28, 13.48, 189, 531, 0, 0.16, false, frame);
    addArcSolid(12.6, 12.78, 189, 531, 0, 0.12, false, frame);

    const dummy = new THREE.Object3D();
    const ovals: number[] = [];
    for (let cw = 0; cw < 360; cw += 10) {
      if (cw > 171 && cw < 189) continue;
      ovals.push(cw);
    }
    const oval = new THREE.InstancedMesh(
      new THREE.TorusGeometry(0.34, 0.028, 8, 18),
      frame,
      ovals.length,
    );
    const mullion = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.05, 3.35, 0.12),
      frame,
      ovals.length,
    );
    ovals.forEach((cw, i) => {
      const p = polar(cw, 13.05);
      dummy.position.set(p.x, 2.15, p.z);
      dummy.rotation.set(0, (cw * Math.PI) / 180, 0);
      dummy.scale.set(0.78, 1.2, 1);
      dummy.updateMatrix();
      oval.setMatrixAt(i, dummy.matrix);
      dummy.scale.set(1, 1, 1);
      dummy.position.set(p.x, 1.95, p.z);
      dummy.updateMatrix();
      mullion.setMatrixAt(i, dummy.matrix);
    });
    oval.castShadow = true;
    mullion.castShadow = true;
    solid.add(oval);
    solid.add(mullion);

    for (const cw of [171, 189]) {
      const p = polar(cw, 13.15);
      addBox(0.12, H, 0.28, p.x, H / 2, p.z, (cw * Math.PI) / 180, frame);
    }
    addBox(3.7, 0.12, 0.28, 0, 3.72, -13.15, 0, frame);
    addBox(4.4, 0.1, 1.7, 0, 3.55, -14.15, 0, brass);
    const porch = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.08, 2.3), stone);
    porch.position.set(0, 0.04, -14.05);
    porch.receiveShadow = true;
    solid.add(porch);

    const pin = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 4), brass);
    const np = polar(0, 14.15);
    pin.position.set(np.x, 0.35, np.z);
    pin.castShadow = true;
    solid.add(pin);
    addLabel(labels, "北", "", { x: 0, z: 14.7 }, 1.4);
  }

  function buildCeiling() {
    const ring = arcSolid(2.45, R.outer - 0.05, 0, 360, H, H + 0.12);
    if (ring) {
      const mesh = new THREE.Mesh(ring, mat(0xf7f3ec, { roughness: 0.9 }));
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      ceiling.add(mesh);
    }
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(2.42, 2.42, 1.7, 40, 1, true),
      glass,
    );
    drum.position.y = H + 0.85;
    solid.add(drum);
    const lid = new THREE.Mesh(
      new THREE.CircleGeometry(2.42, 40),
      mat(0xf3efe6, { roughness: 0.4, emissive: 0xfff4e0, emissiveIntensity: 0.35 }),
    );
    lid.rotation.x = -Math.PI / 2;
    lid.position.y = H + 1.7;
    solid.add(lid);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.06, 8, 40), brass);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = H + 1.7;
    solid.add(lip);
  }

  function buildLabels() {
    for (const zone of ZONES) {
      addLabel(labels, zone.name, "", polar(midCW(zone.cw0, zone.cw1), 8.05), zone.name.length > 8 ? 4.4 : 3.3);
    }
    addLabel(labels, "展示区 3", "", { x: 0, z: 1.85 }, 2.4);
    for (const s of STALLS) {
      addLabel(labels, s.name, "", polar(midCW(s.cw0, s.cw1), 7.15), 1.5);
    }
  }

  function addArcWall(r0: number, r1: number, cw0: number, cw1: number, door: number, width: number, block: boolean) {
    const span = normSpan(cw0, cw1);
    const end = cw0 + span;
    let m = door;
    while (m < cw0 - 0.01) m += 360;
    while (m > end + 0.01) m -= 360;
    const half = Math.min(((width / ((r0 + r1) / 2)) * 180) / Math.PI / 2, span * 0.38);
    const a = Math.max(cw0, m - half);
    const b = Math.min(end, m + half);
    if (a - cw0 > 0.5) addArcSolid(r0, r1, cw0, a, 0, H, block, plaster);
    if (end - b > 0.5) addArcSolid(r0, r1, b, end, 0, H, block, plaster);
    if (b - a > 0.4) addArcSolid(r0, r1, a, b, R.doorH, H, false, plaster);
  }

  function addRadialDoor(cw: number, r0: number, r1: number) {
    const doorEnd = r1 - 0.12;
    const doorStart = Math.max(r0 + 0.4, doorEnd - 1.5);
    addRadialSolid(cw, r0, doorStart, 0, H, true);
    addRadialSolid(cw, doorEnd, r1, 0, H, true);
    addRadialSolid(cw, doorStart, doorEnd, R.doorH, H, false);
  }

  function addRadialSolid(cw: number, r0: number, r1: number, y0: number, y1: number, block: boolean) {
    const len = r1 - r0;
    if (len < 0.05 || y1 - y0 < 0.02) return;
    const mid = (r0 + r1) / 2;
    const p = polar(cw, mid);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, y1 - y0, len), plaster);
    mesh.position.set(p.x, (y0 + y1) / 2, p.z);
    mesh.rotation.y = (cw * Math.PI) / 180;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    solid.add(mesh);
    if (block) {
      const a = polar(cw, r0);
      const b = polar(cw, r1);
      cols.push({ kind: "seg", ax: a.x, az: a.z, bx: b.x, bz: b.z, rad: 0.08 });
    }
  }

  function addArcSolid(
    r0: number,
    r1: number,
    cw0: number,
    cw1: number,
    y0: number,
    y1: number,
    block: boolean,
    material: THREE.Material,
  ) {
    const geo = arcSolid(r0, r1, cw0, cw1, y0, y1);
    if (!geo) return;
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = y1 - y0 > 0.4;
    mesh.receiveShadow = true;
    solid.add(mesh);
    if (block) cols.push({ kind: "arc", r0, r1, cw0, cw1 });
  }

  function placeBox(
    cw: number,
    radius: number,
    w: number,
    h: number,
    d: number,
    y: number,
    material: THREE.Material,
    block: boolean,
  ) {
    const p = polar(cw, radius);
    addBox(w, h, d, p.x, y, p.z, (cw * Math.PI) / 180, material, { block });
  }

  function addBox(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    yaw: number,
    material: THREE.Material,
    opts?: { block?: boolean; blockR?: number },
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = yaw;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    solid.add(mesh);
    if (opts?.block) {
      const hx = w / 2;
      const hz = d / 2;
      const c = Math.cos(yaw);
      const s = Math.sin(yaw);
      const corners = [
        [-hx, -hz],
        [hx, -hz],
        [hx, hz],
        [-hx, hz],
      ].map(([lx, lz]) => ({
        x: x + lx * c + lz * s,
        z: z - lx * s + lz * c,
      }));
      for (let i = 0; i < 4; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % 4];
        cols.push({ kind: "seg", ax: a.x, az: a.z, bx: b.x, bz: b.z, rad: 0.02 });
      }
    } else if (opts?.blockR) {
      cols.push({ kind: "circ", x, z, rad: opts.blockR });
    }
    return mesh;
  }

  function addCyl(
    rt: number,
    rb: number,
    h: number,
    seg: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    blockR?: number,
  ) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    solid.add(mesh);
    if (blockR) cols.push({ kind: "circ", x, z, rad: blockR });
    return mesh;
  }

  function tri(cw: number, radius: number) {
    const p = polar(cw, radius);
    addCyl(0.58, 0.64, 0.82, 3, p.x, 0.41, p.z, dark, 0.66);
  }

  function pedestal(cw: number, radius: number) {
    const p = polar(cw, radius);
    addCyl(0.42, 0.48, 0.86, 24, p.x, 0.43, p.z, stone, 0.5);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), brass);
    top.position.set(p.x, 1.02, p.z);
    top.castShadow = true;
    solid.add(top);
  }

  function screen(cw: number, radius: number) {
    const p = polar(cw, radius);
    const yaw = (cw * Math.PI) / 180;
    const nx = Math.sin(yaw);
    const nz = Math.cos(yaw);
    addBox(1.38, 1.68, 0.05, p.x, 1.25, p.z, yaw, frame);
    addBox(1.16, 1.46, 0.04, p.x - nx * 0.06, 1.25, p.z - nz * 0.06, yaw, screenMat);
    addBox(0.55, 0.42, 0.4, p.x, 0.21, p.z, yaw, timber, { blockR: 0.35 });
  }

  function floorRing(cw: number, radius: number, ringR: number, material: THREE.Material) {
    const p = polar(cw, radius);
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.045, 8, 28), material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(p.x, 0.05, p.z);
    solid.add(mesh);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(ringR * 0.92, 28),
      mat(0xe7f3ee, { roughness: 0.5, emissive: 0x1a4a3c, emissiveIntensity: 0.2 }),
    );
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(p.x, 0.03, p.z);
    solid.add(disc);
  }

  function molecule(cw: number, radius: number, scale: number) {
    const p = polar(cw, radius);
    const group = new THREE.Group();
    const pts = [
      [0, 0.2, 0],
      [0.42, 0.55, 0.08],
      [-0.28, 0.48, 0.32],
    ];
    const sph = new THREE.SphereGeometry(0.16 * scale, 16, 12);
    const meshes: THREE.Mesh[] = [];
    for (const pt of pts) {
      const m = new THREE.Mesh(sph, brass);
      m.position.set(pt[0] * scale, pt[1] * scale, pt[2] * scale);
      m.castShadow = true;
      group.add(m);
      meshes.push(m);
    }
    for (let i = 0; i < meshes.length; i++) {
      for (let j = i + 1; j < meshes.length; j++) {
        const a = meshes[i].position;
        const b = meshes[j].position;
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * scale, 0.025 * scale, len, 6), frame);
        rod.position.copy(mid);
        rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        group.add(rod);
      }
    }
    group.position.set(p.x, 0, p.z);
    solid.add(group);
    cols.push({ kind: "circ", x: p.x, z: p.z, rad: 0.45 * scale });
  }

  function addRing(parent: THREE.Object3D, r0: number, r1: number, y: number, material: THREE.Material) {
    const geo = new THREE.RingGeometry(r0, r1, 64);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.y = y;
    parent.add(mesh);
  }
}

function mat(
  color: number,
  opts: { roughness: number; metalness?: number; emissive?: number; emissiveIntensity?: number },
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness,
    metalness: opts.metalness ?? 0.02,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    side: THREE.DoubleSide,
  });
}

function sectorFloor(cw0: number, cw1: number, r0: number, r1: number, y: number) {
  const span = normSpan(cw0, cw1);
  const n = Math.max(1, Math.ceil(span / 4));
  const pos: number[] = [];
  const norm: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const cw = cw0 + (span * i) / n;
    const a = polar(cw, r0);
    const b = polar(cw, r1);
    pos.push(a.x, y, a.z, b.x, y, b.z);
    norm.push(0, 1, 0, 0, 1, 0);
  }
  for (let i = 0; i < n; i++) {
    const o = i * 2;
    idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3));
  g.setIndex(idx);
  return g;
}

function arcSolid(r0: number, r1: number, cw0: number, cw1: number, y0: number, y1: number) {
  const span = normSpan(cw0, cw1);
  if (span < 0.3 || r1 - r0 < 0.01 || y1 - y0 < 0.01) return null;
  const n = Math.max(1, Math.ceil(span / 4));
  const pos: number[] = [];
  const norm: number[] = [];
  const idx: number[] = [];
  const ring: { x: number; z: number }[] = [];
  for (let i = 0; i <= n; i++) ring.push(polar(cw0 + (span * i) / n, 1));
  const add = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
    const i = pos.length / 3;
    pos.push(x, y, z);
    norm.push(nx, ny, nz);
    return i;
  };
  const quad = (a: number, b: number, c: number, d: number) => idx.push(a, b, c, a, c, d);
  for (let i = 0; i < n; i++) {
    const A = ring[i];
    const B = ring[i + 1];
    quad(
      add(A.x * r1, y0, A.z * r1, A.x, 0, A.z),
      add(B.x * r1, y0, B.z * r1, B.x, 0, B.z),
      add(B.x * r1, y1, B.z * r1, B.x, 0, B.z),
      add(A.x * r1, y1, A.z * r1, A.x, 0, A.z),
    );
    quad(
      add(B.x * r0, y0, B.z * r0, -B.x, 0, -B.z),
      add(A.x * r0, y0, A.z * r0, -A.x, 0, -A.z),
      add(A.x * r0, y1, A.z * r0, -A.x, 0, -A.z),
      add(B.x * r0, y1, B.z * r0, -B.x, 0, -B.z),
    );
    quad(
      add(A.x * r0, y1, A.z * r0, 0, 1, 0),
      add(A.x * r1, y1, A.z * r1, 0, 1, 0),
      add(B.x * r1, y1, B.z * r1, 0, 1, 0),
      add(B.x * r0, y1, B.z * r0, 0, 1, 0),
    );
  }
  const A = ring[0];
  const B = ring[n];
  quad(
    add(A.x * r0, y0, A.z * r0, -A.z, 0, A.x),
    add(A.x * r1, y0, A.z * r1, -A.z, 0, A.x),
    add(A.x * r1, y1, A.z * r1, -A.z, 0, A.x),
    add(A.x * r0, y1, A.z * r0, -A.z, 0, A.x),
  );
  quad(
    add(B.x * r1, y0, B.z * r1, B.z, 0, -B.x),
    add(B.x * r0, y0, B.z * r0, B.z, 0, -B.x),
    add(B.x * r0, y1, B.z * r0, B.z, 0, -B.x),
    add(B.x * r1, y1, B.z * r1, B.z, 0, -B.x),
  );
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3));
  g.setIndex(idx);
  return g;
}

function addLabel(
  parent: THREE.Object3D,
  text: string,
  _sub: string,
  at: { x: number; z: number },
  width: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) return;
  g.clearRect(0, 0, 1024, 256);
  g.fillStyle = "rgba(244, 239, 230, 0.82)";
  roundRect(g, 24, 48, 976, 160, 28);
  g.fill();
  g.fillStyle = "#1c1712";
  g.font = "600 78px 'WenQuanYi Zen Hei', 'Microsoft YaHei', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 512, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width * 0.25),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  mesh.position.set(at.x, 0.04, at.z);
  mesh.rotation.order = "XYZ";
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = Math.PI;
  mesh.name = "label";
  parent.add(mesh);
}

function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
