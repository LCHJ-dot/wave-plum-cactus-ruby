import { a as ZONES, c as polar, i as STALLS, l as tangent, n as HEIGHT, o as midCW, r as R, s as normSpan } from "./routes-KyzVS7W9.mjs";
import { C as SphereGeometry, S as SRGBColorSpace, T as Vector3, _ as MeshStandardMaterial, a as Color, b as PointLight, c as DirectionalLight, d as Group, f as HemisphereLight, g as MeshBasicMaterial, h as Mesh, i as CircleGeometry, l as Float32BufferAttribute, n as BufferGeometry, o as ConeGeometry, p as InstancedMesh, r as CanvasTexture, s as CylinderGeometry, t as BoxGeometry, u as Fog, v as Object3D, w as TorusGeometry, x as RingGeometry, y as PlaneGeometry } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createPavilion-CukkxGfZ.js
var H = HEIGHT;
function createPavilion(scene) {
	const solid = new Group();
	solid.name = "pavilion";
	scene.add(solid);
	const labels = new Group();
	labels.name = "labels";
	scene.add(labels);
	const ceiling = new Group();
	ceiling.name = "ceiling";
	solid.add(ceiling);
	const cols = [];
	const plaster = mat(16052456, { roughness: .88 });
	const stone = mat(14143684, { roughness: .94 });
	const timber = mat(7162674, { roughness: .7 });
	const dark = mat(2762274, {
		roughness: .5,
		metalness: .18
	});
	const brass = mat(11569750, {
		roughness: .32,
		metalness: .7
	});
	const frame = mat(3288618, {
		roughness: .42,
		metalness: .48
	});
	const clay = mat(12872517, { roughness: .52 });
	const sand = mat(14137738, { roughness: .95 });
	const sandDeep = mat(12093774, { roughness: .9 });
	const green = mat(2911045, {
		roughness: .35,
		emissive: 1192482,
		emissiveIntensity: .45
	});
	const screenMat = mat(16183782, {
		roughness: .4,
		emissive: 15786692,
		emissiveIntensity: .42
	});
	const glass = new MeshStandardMaterial({
		color: 12965598,
		roughness: .06,
		metalness: .04,
		transparent: true,
		opacity: .2,
		side: 2,
		depthWrite: false
	});
	const glow = mat(14151654, {
		roughness: .25,
		emissive: 1993298,
		emissiveIntensity: .9
	});
	const ground = new Mesh(new CircleGeometry(40, 80), mat(13222324, { roughness: 1 }));
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -.02;
	ground.receiveShadow = true;
	ground.name = "skip-export";
	scene.add(ground);
	const slab = new Mesh(new CircleGeometry(R.outer + .05, 96), stone);
	slab.rotation.x = -Math.PI / 2;
	slab.receiveShadow = true;
	slab.name = "slab";
	solid.add(slab);
	const coreFloor = new Mesh(new CircleGeometry(R.roomIn - R.coreWall, 72), dark);
	coreFloor.rotation.x = -Math.PI / 2;
	coreFloor.position.y = .012;
	coreFloor.receiveShadow = true;
	solid.add(coreFloor);
	addRing(solid, .72, 1.15, .02, brass);
	addRing(solid, 1.45, 1.95, .02, mat(4866876, {
		roughness: .6,
		metalness: .2
	}));
	addRing(solid, 2.15, 2.45, .02, brass);
	for (const zone of ZONES) {
		const g = sectorFloor(zone.cw0, zone.cw1, R.roomIn, R.roomOut - R.roomWall, .02);
		const mesh = new Mesh(g, mat(new Color(zone.swatch).getHex(), { roughness: .92 }));
		mesh.receiveShadow = true;
		mesh.name = zone.id;
		solid.add(mesh);
	}
	const gallery = sectorFloor(0, 360, R.roomOut, R.walkMax, .018);
	const galleryMesh = new Mesh(gallery, mat(14998736, { roughness: .9 }));
	galleryMesh.receiveShadow = true;
	solid.add(galleryMesh);
	cols.push({
		kind: "bound",
		r: R.walkMax,
		gap0: 171,
		gap1: 189,
		rOut: R.porch
	});
	for (const zone of ZONES) {
		const door = zone.door ?? midCW(zone.cw0, zone.cw1);
		addArcWall(R.roomIn - R.coreWall, R.roomIn, zone.cw0, zone.cw1, door, 1.45, true);
		addArcWall(R.roomOut - R.roomWall, R.roomOut, zone.cw0, zone.cw1, door, 1.75, true);
		addRadialDoor(zone.cw0, R.roomIn, R.roomOut - R.roomWall);
	}
	for (let i = 0; i < STALLS.length; i++) {
		const s = STALLS[i];
		if (i > 0) addRadialSolid(s.cw0, R.stall0, R.stall1, 0, H, true);
		addArcWall(R.stall1, R.stall1 + .14, s.cw0, s.cw1, midCW(s.cw0, s.cw1), .78, true);
	}
	const last = STALLS[STALLS.length - 1];
	addRadialSolid(last.cw1, R.stall0, R.stall1, 0, H, true);
	addArcSolid(2.62, 3.32, 118, 248, 0, 2.15, true, dark);
	addCyl(.52, .58, .72, 28, 0, .36, 0, brass, .62);
	const orb = new Mesh(new SphereGeometry(.36, 28, 20), brass);
	orb.position.y = 1.18;
	orb.castShadow = true;
	solid.add(orb);
	for (let i = 0; i < 8; i++) {
		const h = .07 * (8 - i);
		const z = -3.78 - i * .2;
		addBox(2.05, h, .2, 0, h / 2, z, 0, mat(3814446, {
			roughness: .55,
			metalness: .12
		}));
	}
	const stele = polar(152, 4.55);
	addBox(.26, 1.35, .26, stele.x, .68, stele.z, 0, green, { blockR: .22 });
	buildProps();
	buildSkin();
	buildCeiling();
	buildLabels();
	const sun = new DirectionalLight(16774372, 2.35);
	sun.position.set(14, 24, -10);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);
	sun.shadow.camera.left = -20;
	sun.shadow.camera.right = 20;
	sun.shadow.camera.top = 20;
	sun.shadow.camera.bottom = -20;
	sun.shadow.camera.near = 1;
	sun.shadow.camera.far = 60;
	sun.shadow.bias = -35e-5;
	sun.shadow.normalBias = .045;
	scene.add(sun);
	scene.add(new HemisphereLight(14017262, 15194052, .72));
	const oculus = new PointLight(16774109, 16, 18, 2);
	oculus.position.set(0, 5.4, 0);
	scene.add(oculus);
	const fills = [];
	for (const zone of ZONES) {
		const p = polar(midCW(zone.cw0, zone.cw1), 8.1);
		const light = new PointLight(16773598, 2.2, 11, 2);
		light.position.set(p.x, 3.35, p.z);
		scene.add(light);
		fills.push(light);
	}
	scene.background = new Color(14147816);
	scene.fog = new Fog(14147816, 36, 78);
	return {
		solid,
		ceiling,
		cols,
		setRoof(on) {
			ceiling.visible = on;
		},
		setInterior(on) {
			for (const light of fills) light.intensity = on ? 11 : 2.2;
		}
	};
	function buildProps() {
		placeBox(12, 9.55, 2.2, .88, .58, .44, timber, true);
		placeBox(28, 9.3, 1.6, .42, .46, .21, timber, false);
		molecule(55, 7.55, 1);
		molecule(72, 8.7, .75);
		const blobP = polar(58, 9.35);
		const blob = new Mesh(new SphereGeometry(.48, 24, 18), clay);
		blob.scale.set(1.15, .78, .7);
		blob.position.set(blobP.x, .42, blobP.z);
		blob.castShadow = true;
		solid.add(blob);
		cols.push({
			kind: "circ",
			x: blobP.x,
			z: blobP.z,
			rad: .5
		});
		floorRing(112, 8.05, .9, glow);
		floorRing(124, 9.15, .55, glow);
		addLabel(labels, "AI 互动", "", polar(112, 8.05), 2.2);
		const tng = tangent(140);
		const base = polar(140, 8.15);
		addBox(.5, .9, 3.15, base.x + tng.x * .85, .45, base.z + tng.z * .85, 140 * Math.PI / 180, dark, { block: true });
		tri(156, 7.7);
		tri(170, 8.55);
		tri(184, 7.85);
		placeBox(166, 9.55, 1.15, .92, 1.7, .46, frame, true);
		screen(208, 8.7);
		screen(222, 7.45);
		placeBox(248, 7.9, .7, 1.05, .42, .52, timber, true);
		placeBox(260, 9.15, 1.5, .42, .48, .21, timber, false);
		const sandMid = midCW(274, 302);
		const sp = polar(sandMid, 8.15);
		const sy = sandMid * Math.PI / 180;
		addBox(2.35, .78, 1.35, sp.x, .39, sp.z, sy, timber, { block: true });
		addBox(1.7, .08, .95, sp.x, .82, sp.z, sy, sand);
		addBox(1.05, .07, .6, sp.x, .9, sp.z, sy, sandDeep);
		addBox(.48, .06, .3, sp.x, .96, sp.z, sy, sandDeep);
		pedestal(310, 7.15);
		pedestal(320, 9);
		screen(306, 8.15);
		screen(326, 7.7);
	}
	function buildSkin() {
		const gap = 8 * (Math.PI / 180);
		const start = 180 * Math.PI / 180 + gap;
		const length = Math.PI * 2 - gap * 2;
		for (const radius of [13.4, 12.7]) {
			const geo = new CylinderGeometry(radius, radius, H, 96, 1, true, start, length);
			const mesh = new Mesh(geo, glass);
			mesh.position.y = H / 2;
			mesh.name = "glass";
			solid.add(mesh);
		}
		addArcSolid(13.28, 13.48, 189, 531, 0, .16, false, frame);
		addArcSolid(12.6, 12.78, 189, 531, 0, .12, false, frame);
		const dummy = new Object3D();
		const ovals = [];
		for (let cw = 0; cw < 360; cw += 10) {
			if (cw > 171 && cw < 189) continue;
			ovals.push(cw);
		}
		const oval = new InstancedMesh(new TorusGeometry(.34, .028, 8, 18), frame, ovals.length);
		const mullion = new InstancedMesh(new BoxGeometry(.05, 3.35, .12), frame, ovals.length);
		ovals.forEach((cw, i) => {
			const p = polar(cw, 13.05);
			dummy.position.set(p.x, 2.15, p.z);
			dummy.rotation.set(0, cw * Math.PI / 180, 0);
			dummy.scale.set(.78, 1.2, 1);
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
			addBox(.12, H, .28, p.x, H / 2, p.z, cw * Math.PI / 180, frame);
		}
		addBox(3.7, .12, .28, 0, 3.72, -13.15, 0, frame);
		addBox(4.4, .1, 1.7, 0, 3.55, -14.15, 0, brass);
		const porch = new Mesh(new BoxGeometry(4.6, .08, 2.3), stone);
		porch.position.set(0, .04, -14.05);
		porch.receiveShadow = true;
		solid.add(porch);
		const pin = new Mesh(new ConeGeometry(.28, .7, 4), brass);
		const np = polar(0, 14.15);
		pin.position.set(np.x, .35, np.z);
		pin.castShadow = true;
		solid.add(pin);
		addLabel(labels, "北", "", {
			x: 0,
			z: 14.7
		}, 1.4);
	}
	function buildCeiling() {
		const ring = arcSolid(2.45, R.outer - .05, 0, 360, H, H + .12);
		if (ring) {
			const mesh = new Mesh(ring, mat(16249836, { roughness: .9 }));
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			ceiling.add(mesh);
		}
		const drum = new Mesh(new CylinderGeometry(2.42, 2.42, 1.7, 40, 1, true), glass);
		drum.position.y = H + .85;
		solid.add(drum);
		const lid = new Mesh(new CircleGeometry(2.42, 40), mat(15986662, {
			roughness: .4,
			emissive: 16774368,
			emissiveIntensity: .35
		}));
		lid.rotation.x = -Math.PI / 2;
		lid.position.y = H + 1.7;
		solid.add(lid);
		const lip = new Mesh(new TorusGeometry(2.42, .06, 8, 40), brass);
		lip.rotation.x = Math.PI / 2;
		lip.position.y = H + 1.7;
		solid.add(lip);
	}
	function buildLabels() {
		for (const zone of ZONES) addLabel(labels, zone.name, "", polar(midCW(zone.cw0, zone.cw1), 8.05), zone.name.length > 8 ? 4.4 : 3.3);
		addLabel(labels, "展示区 3", "", {
			x: 0,
			z: 1.85
		}, 2.4);
		for (const s of STALLS) addLabel(labels, s.name, "", polar(midCW(s.cw0, s.cw1), 7.15), 1.5);
	}
	function addArcWall(r0, r1, cw0, cw1, door, width, block) {
		const span = normSpan(cw0, cw1);
		const end = cw0 + span;
		let m = door;
		while (m < cw0 - .01) m += 360;
		while (m > end + .01) m -= 360;
		const half = Math.min(width / ((r0 + r1) / 2) * 180 / Math.PI / 2, span * .38);
		const a = Math.max(cw0, m - half);
		const b = Math.min(end, m + half);
		if (a - cw0 > .5) addArcSolid(r0, r1, cw0, a, 0, H, block, plaster);
		if (end - b > .5) addArcSolid(r0, r1, b, end, 0, H, block, plaster);
		if (b - a > .4) addArcSolid(r0, r1, a, b, R.doorH, H, false, plaster);
	}
	function addRadialDoor(cw, r0, r1) {
		const doorEnd = r1 - .12;
		const doorStart = Math.max(r0 + .4, doorEnd - 1.5);
		addRadialSolid(cw, r0, doorStart, 0, H, true);
		addRadialSolid(cw, doorEnd, r1, 0, H, true);
		addRadialSolid(cw, doorStart, doorEnd, R.doorH, H, false);
	}
	function addRadialSolid(cw, r0, r1, y0, y1, block) {
		const len = r1 - r0;
		if (len < .05 || y1 - y0 < .02) return;
		const mid = (r0 + r1) / 2;
		const p = polar(cw, mid);
		const mesh = new Mesh(new BoxGeometry(.16, y1 - y0, len), plaster);
		mesh.position.set(p.x, (y0 + y1) / 2, p.z);
		mesh.rotation.y = cw * Math.PI / 180;
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		solid.add(mesh);
		if (block) {
			const a = polar(cw, r0);
			const b = polar(cw, r1);
			cols.push({
				kind: "seg",
				ax: a.x,
				az: a.z,
				bx: b.x,
				bz: b.z,
				rad: .08
			});
		}
	}
	function addArcSolid(r0, r1, cw0, cw1, y0, y1, block, material) {
		const geo = arcSolid(r0, r1, cw0, cw1, y0, y1);
		if (!geo) return;
		const mesh = new Mesh(geo, material);
		mesh.castShadow = y1 - y0 > .4;
		mesh.receiveShadow = true;
		solid.add(mesh);
		if (block) cols.push({
			kind: "arc",
			r0,
			r1,
			cw0,
			cw1
		});
	}
	function placeBox(cw, radius, w, h, d, y, material, block) {
		const p = polar(cw, radius);
		addBox(w, h, d, p.x, y, p.z, cw * Math.PI / 180, material, { block });
	}
	function addBox(w, h, d, x, y, z, yaw, material, opts) {
		const mesh = new Mesh(new BoxGeometry(w, h, d), material);
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
				[-hx, hz]
			].map(([lx, lz]) => ({
				x: x + lx * c + lz * s,
				z: z - lx * s + lz * c
			}));
			for (let i = 0; i < 4; i++) {
				const a = corners[i];
				const b = corners[(i + 1) % 4];
				cols.push({
					kind: "seg",
					ax: a.x,
					az: a.z,
					bx: b.x,
					bz: b.z,
					rad: .02
				});
			}
		} else if (opts?.blockR) cols.push({
			kind: "circ",
			x,
			z,
			rad: opts.blockR
		});
		return mesh;
	}
	function addCyl(rt, rb, h, seg, x, y, z, material, blockR) {
		const mesh = new Mesh(new CylinderGeometry(rt, rb, h, seg), material);
		mesh.position.set(x, y, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		solid.add(mesh);
		if (blockR) cols.push({
			kind: "circ",
			x,
			z,
			rad: blockR
		});
		return mesh;
	}
	function tri(cw, radius) {
		const p = polar(cw, radius);
		addCyl(.58, .64, .82, 3, p.x, .41, p.z, dark, .66);
	}
	function pedestal(cw, radius) {
		const p = polar(cw, radius);
		addCyl(.42, .48, .86, 24, p.x, .43, p.z, stone, .5);
		const top = new Mesh(new SphereGeometry(.22, 18, 14), brass);
		top.position.set(p.x, 1.02, p.z);
		top.castShadow = true;
		solid.add(top);
	}
	function screen(cw, radius) {
		const p = polar(cw, radius);
		const yaw = cw * Math.PI / 180;
		const nx = Math.sin(yaw);
		const nz = Math.cos(yaw);
		addBox(1.38, 1.68, .05, p.x, 1.25, p.z, yaw, frame);
		addBox(1.16, 1.46, .04, p.x - nx * .06, 1.25, p.z - nz * .06, yaw, screenMat);
		addBox(.55, .42, .4, p.x, .21, p.z, yaw, timber, { blockR: .35 });
	}
	function floorRing(cw, radius, ringR, material) {
		const p = polar(cw, radius);
		const mesh = new Mesh(new TorusGeometry(ringR, .045, 8, 28), material);
		mesh.rotation.x = Math.PI / 2;
		mesh.position.set(p.x, .05, p.z);
		solid.add(mesh);
		const disc = new Mesh(new CircleGeometry(ringR * .92, 28), mat(15201262, {
			roughness: .5,
			emissive: 1722940,
			emissiveIntensity: .2
		}));
		disc.rotation.x = -Math.PI / 2;
		disc.position.set(p.x, .03, p.z);
		solid.add(disc);
	}
	function molecule(cw, radius, scale) {
		const p = polar(cw, radius);
		const group = new Group();
		const pts = [
			[
				0,
				.2,
				0
			],
			[
				.42,
				.55,
				.08
			],
			[
				-.28,
				.48,
				.32
			]
		];
		const sph = new SphereGeometry(.16 * scale, 16, 12);
		const meshes = [];
		for (const pt of pts) {
			const m = new Mesh(sph, brass);
			m.position.set(pt[0] * scale, pt[1] * scale, pt[2] * scale);
			m.castShadow = true;
			group.add(m);
			meshes.push(m);
		}
		for (let i = 0; i < meshes.length; i++) for (let j = i + 1; j < meshes.length; j++) {
			const a = meshes[i].position;
			const b = meshes[j].position;
			const mid = a.clone().add(b).multiplyScalar(.5);
			const len = a.distanceTo(b);
			const rod = new Mesh(new CylinderGeometry(.025 * scale, .025 * scale, len, 6), frame);
			rod.position.copy(mid);
			rod.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), b.clone().sub(a).normalize());
			group.add(rod);
		}
		group.position.set(p.x, 0, p.z);
		solid.add(group);
		cols.push({
			kind: "circ",
			x: p.x,
			z: p.z,
			rad: .45 * scale
		});
	}
	function addRing(parent, r0, r1, y, material) {
		const geo = new RingGeometry(r0, r1, 64);
		geo.rotateX(-Math.PI / 2);
		const mesh = new Mesh(geo, material);
		mesh.position.y = y;
		parent.add(mesh);
	}
}
function mat(color, opts) {
	return new MeshStandardMaterial({
		color,
		roughness: opts.roughness,
		metalness: opts.metalness ?? .02,
		emissive: opts.emissive ?? 0,
		emissiveIntensity: opts.emissiveIntensity ?? 1,
		side: 2
	});
}
function sectorFloor(cw0, cw1, r0, r1, y) {
	const span = normSpan(cw0, cw1);
	const n = Math.max(1, Math.ceil(span / 4));
	const pos = [];
	const norm = [];
	const idx = [];
	for (let i = 0; i <= n; i++) {
		const cw = cw0 + span * i / n;
		const a = polar(cw, r0);
		const b = polar(cw, r1);
		pos.push(a.x, y, a.z, b.x, y, b.z);
		norm.push(0, 1, 0, 0, 1, 0);
	}
	for (let i = 0; i < n; i++) {
		const o = i * 2;
		idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
	}
	const g = new BufferGeometry();
	g.setAttribute("position", new Float32BufferAttribute(pos, 3));
	g.setAttribute("normal", new Float32BufferAttribute(norm, 3));
	g.setIndex(idx);
	return g;
}
function arcSolid(r0, r1, cw0, cw1, y0, y1) {
	const span = normSpan(cw0, cw1);
	if (span < .3 || r1 - r0 < .01 || y1 - y0 < .01) return null;
	const n = Math.max(1, Math.ceil(span / 4));
	const pos = [];
	const norm = [];
	const idx = [];
	const ring = [];
	for (let i = 0; i <= n; i++) ring.push(polar(cw0 + span * i / n, 1));
	const add = (x, y, z, nx, ny, nz) => {
		const i = pos.length / 3;
		pos.push(x, y, z);
		norm.push(nx, ny, nz);
		return i;
	};
	const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d);
	for (let i = 0; i < n; i++) {
		const A = ring[i];
		const B = ring[i + 1];
		quad(add(A.x * r1, y0, A.z * r1, A.x, 0, A.z), add(B.x * r1, y0, B.z * r1, B.x, 0, B.z), add(B.x * r1, y1, B.z * r1, B.x, 0, B.z), add(A.x * r1, y1, A.z * r1, A.x, 0, A.z));
		quad(add(B.x * r0, y0, B.z * r0, -B.x, 0, -B.z), add(A.x * r0, y0, A.z * r0, -A.x, 0, -A.z), add(A.x * r0, y1, A.z * r0, -A.x, 0, -A.z), add(B.x * r0, y1, B.z * r0, -B.x, 0, -B.z));
		quad(add(A.x * r0, y1, A.z * r0, 0, 1, 0), add(A.x * r1, y1, A.z * r1, 0, 1, 0), add(B.x * r1, y1, B.z * r1, 0, 1, 0), add(B.x * r0, y1, B.z * r0, 0, 1, 0));
	}
	const A = ring[0];
	const B = ring[n];
	quad(add(A.x * r0, y0, A.z * r0, -A.z, 0, A.x), add(A.x * r1, y0, A.z * r1, -A.z, 0, A.x), add(A.x * r1, y1, A.z * r1, -A.z, 0, A.x), add(A.x * r0, y1, A.z * r0, -A.z, 0, A.x));
	quad(add(B.x * r1, y0, B.z * r1, B.z, 0, -B.x), add(B.x * r0, y0, B.z * r0, B.z, 0, -B.x), add(B.x * r0, y1, B.z * r0, B.z, 0, -B.x), add(B.x * r1, y1, B.z * r1, B.z, 0, -B.x));
	const g = new BufferGeometry();
	g.setAttribute("position", new Float32BufferAttribute(pos, 3));
	g.setAttribute("normal", new Float32BufferAttribute(norm, 3));
	g.setIndex(idx);
	return g;
}
function addLabel(parent, text, _sub, at, width) {
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
	const tex = new CanvasTexture(canvas);
	tex.colorSpace = SRGBColorSpace;
	const mesh = new Mesh(new PlaneGeometry(width, width * .25), new MeshBasicMaterial({
		map: tex,
		transparent: true,
		depthWrite: false
	}));
	mesh.position.set(at.x, .04, at.z);
	mesh.rotation.order = "XYZ";
	mesh.rotation.x = -Math.PI / 2;
	mesh.rotation.z = Math.PI;
	mesh.name = "label";
	parent.add(mesh);
}
function roundRect(g, x, y, w, h, r) {
	g.beginPath();
	g.moveTo(x + r, y);
	g.arcTo(x + w, y, x + w, y + h, r);
	g.arcTo(x + w, y + h, x, y + h, r);
	g.arcTo(x, y + h, x, y, r);
	g.arcTo(x, y, x + w, y, r);
	g.closePath();
}
//#endregion
export { createPavilion };
