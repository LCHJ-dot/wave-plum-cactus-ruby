import * as THREE from "three";

/** SketchUp is Z-up. Three.js Y-up (x east, y up, z north) becomes (x, z, y). */
export function pavilionToDae(root: THREE.Object3D): string {
  root.updateWorldMatrix(true, true);
  const buckets = new Map<string, { name: string; rgb: [number, number, number]; pos: number[]; idx: number[] }>();

  const world = new THREE.Matrix4();
  const v = new THREE.Vector3();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || mesh.name === "label" || mesh.name === "skip-export") return;
    const geo = mesh.geometry as THREE.BufferGeometry;
    const attr = geo.getAttribute("position");
    if (!attr) return;
    const material = mesh.material as THREE.MeshStandardMaterial;
    const color = material?.color ?? new THREE.Color(0.8, 0.8, 0.8);
    const key = color.getHexString();
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { name: `m-${key}`, rgb: [color.r, color.g, color.b], pos: [], idx: [] };
      buckets.set(key, bucket);
    }
    const base = bucket.pos.length / 3;

    if ((mesh as THREE.InstancedMesh).isInstancedMesh) {
      const inst = mesh as THREE.InstancedMesh;
      const m = new THREE.Matrix4();
      for (let i = 0; i < inst.count; i++) {
        inst.getMatrixAt(i, m);
        m.premultiply(mesh.matrixWorld);
        pushGeo(bucket, attr, geo.getIndex(), m, v, base + (bucket.pos.length / 3 - base));
      }
    } else {
      world.copy(mesh.matrixWorld);
      pushGeo(bucket, attr, geo.getIndex(), world, v, base);
    }
  });

  const geos: string[] = [];
  const mats: string[] = [];
  const effects: string[] = [];
  const nodes: string[] = [];
  let gi = 0;
  for (const bucket of buckets.values()) {
    if (bucket.idx.length < 3) continue;
    const id = `geom-${gi}`;
    const vertCount = bucket.pos.length / 3;
    const triCount = bucket.idx.length / 3;
    geos.push(`<geometry id="${id}" name="${bucket.name}"><mesh>
<source id="${id}-p"><float_array id="${id}-pa" count="${bucket.pos.length}">${bucket.pos.map((n) => n.toFixed(4)).join(" ")}</float_array>
<technique_common><accessor source="#${id}-pa" count="${vertCount}" stride="3"><param name="X" type="float"/><param name="Y" type="float"/><param name="Z" type="float"/></accessor></technique_common>
</source>
<vertices id="${id}-v"><input semantic="POSITION" source="#${id}-p"/></vertices>
<triangles count="${triCount}" material="matref"><input semantic="VERTEX" source="#${id}-v" offset="0"/><p>${bucket.idx.join(" ")}</p></triangles>
</mesh></geometry>`);
    const [r, g, b] = bucket.rgb;
    effects.push(`<effect id="eff-${gi}"><profile_COMMON><technique sid="common"><phong><diffuse><color>${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} 1</color></diffuse></phong></technique></profile_COMMON></effect>`);
    mats.push(`<material id="mat-${gi}" name="${bucket.name}"><instance_effect url="#eff-${gi}"/></material>`);
    nodes.push(`<node id="n-${gi}" name="${bucket.name}" type="NODE"><instance_geometry url="#${id}"><bind_material><technique_common><instance_material symbol="matref" target="#mat-${gi}"/></technique_common></bind_material></instance_geometry></node>`);
    gi++;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
<asset><contributor><author>圆厅</author></contributor><created>2026-11-07T00:00:00Z</created><modified>2026-11-07T00:00:00Z</modified><unit name="meter" meter="1"/><up_axis>Z_UP</up_axis></asset>
<library_effects>${effects.join("")}</library_effects>
<library_materials>${mats.join("")}</library_materials>
<library_geometries>${geos.join("")}</library_geometries>
<library_visual_scenes><visual_scene id="Scene" name="圆厅"><node id="root" name="圆厅" type="NODE">${nodes.join("")}</node></visual_scene></library_visual_scenes>
<scene><instance_visual_scene url="#Scene"/></scene>
</COLLADA>`;
}

function pushGeo(
  bucket: { pos: number[]; idx: number[] },
  attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  index: THREE.BufferAttribute | null,
  matrix: THREE.Matrix4,
  v: THREE.Vector3,
  base: number,
) {
  const start = bucket.pos.length / 3;
  for (let i = 0; i < attr.count; i++) {
    v.fromBufferAttribute(attr, i).applyMatrix4(matrix);
    bucket.pos.push(v.x, v.z, v.y);
  }
  if (index) {
    for (let i = 0; i < index.count; i++) bucket.idx.push(start + index.getX(i));
  } else {
    for (let i = 0; i < attr.count; i++) bucket.idx.push(start + i);
  }
  void base;
}
