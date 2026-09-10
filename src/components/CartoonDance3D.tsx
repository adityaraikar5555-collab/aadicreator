import { useEffect, useRef } from "react";
import * as THREE from "three";

interface DancerDef {
  texture: string;
  size: number;
  x: number;
  y: number;
  style: number;
}

interface Dancer {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseScale: number;
  phase: number;
  style: number;
}

interface Sparkle {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  speed: number;
  offset: number;
}

type DanceFn = (d: Dancer, t: number) => void;

const DANCES: DanceFn[] = [
  // 0 — happy bounce + somersault flip
  (d, t) => {
    const bounce = Math.abs(Math.sin(t * 1.4 + d.phase));
    d.mesh.position.y = d.baseY + bounce * 0.85 + Math.sin(t * 0.8 + d.phase) * 0.15;
    d.mesh.position.x = d.baseX + Math.sin(t * 0.9 + d.phase) * 0.25;
    const flipT = (t * 0.31 + d.phase) % 1;
    d.mesh.rotation.x = flipT < 0.25 ? (flipT / 0.25) * Math.PI * 2 : 0;
    d.mesh.rotation.z = Math.sin(t * 2.2 + d.phase) * 0.16;
    d.mesh.scale.setScalar(d.baseScale * (1 + bounce * 0.12));
  },
  // 1 — hip-hop sway + breakdance spin
  (d, t) => {
    const beat = Math.sin(t * 3.1 + d.phase);
    const spinT = (t * 0.22 + d.phase) % 1;
    if (spinT < 0.35) {
      const lt = spinT / 0.35;
      d.mesh.rotation.y = lt * Math.PI * 2;
      d.mesh.rotation.z = Math.sin(t * 2.6 + d.phase) * 0.3;
      d.mesh.position.y = d.baseY + 0.6 + Math.sin(lt * Math.PI) * 0.5;
    } else {
      d.mesh.rotation.y = 0;
      d.mesh.rotation.z = Math.sin(t * 2.6 + d.phase) * 0.5;
      d.mesh.rotation.x = Math.sin(t * 1.3 + d.phase) * 0.12;
      d.mesh.position.y = d.baseY + Math.abs(beat) * 0.4;
      d.mesh.position.x = d.baseX + Math.sin(t * 1.7 + d.phase) * 0.45;
    }
    d.mesh.scale.setScalar(d.baseScale * (1 + Math.abs(beat) * 0.1));
  },
  // 2 — gentle couple waltz
  (d, t) => {
    d.mesh.rotation.z = Math.sin(t * 1.1 + d.phase) * 0.12;
    d.mesh.position.y = d.baseY + Math.sin(t * 1.3 + d.phase) * 0.28;
    d.mesh.position.x = d.baseX + Math.sin(t * 0.8 + d.phase) * 0.22;
    d.mesh.scale.setScalar(d.baseScale * (1 + Math.sin(t * 1.1 + d.phase) * 0.05));
  },
];

function buildSideScene(
  mount: HTMLDivElement,
  defs: DancerDef[],
  accent: number,
): () => void {
  let disposed = false;
  const vw = Math.max(window.innerWidth, 320);
  const factor = THREE.MathUtils.clamp(vw / 1440, 0.55, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    mount.clientWidth / Math.max(mount.clientHeight, 1),
    0.1,
    50,
  );
  camera.position.set(0, 0.4, 6.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);

  const keyLight = new THREE.PointLight(accent, 1.8, 12);
  keyLight.position.set(2, 3, 2.5);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x4dd0e1, 0.9, 12);
  rimLight.position.set(-2.5, 1, -1);
  scene.add(rimLight);

  const loader = new THREE.TextureLoader();
  const dancers: Dancer[] = [];
  const group = new THREE.Group();
  scene.add(group);

  defs.forEach((def, i) => {
    loader.load(def.texture, (tex) => {
      if (disposed) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      const aspect =
        tex.image && tex.image.width && tex.image.height
          ? tex.image.width / tex.image.height
          : 1;
      const size = def.size * factor;
      const geo = new THREE.PlaneGeometry(size * aspect, size);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.DoubleSide,
        roughness: 0.55,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(def.x * factor, def.y * factor, 0);
      mesh.name = "dancer";
      group.add(mesh);

      const ringGeo = new THREE.RingGeometry(size * 0.34, size * 0.4, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(def.x * factor, def.y * factor - size / 2 - 0.05, 0);
      ring.name = "ring";
      group.add(ring);

      dancers.push({
        mesh,
        baseX: def.x * factor,
        baseY: def.y * factor,
        baseScale: 1,
        phase: i * 2.1,
        style: def.style,
      });
    });
  });

  const sparkles: Sparkle[] = [];
  const sparkleGeo = new THREE.SphereGeometry(0.05, 6, 6);
  for (let i = 0; i < 10; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(sparkleGeo, mat);
    scene.add(mesh);
    sparkles.push({
      mesh,
      baseX: (i % 3) - 1 + Math.random() * 0.6,
      baseY: 1 + Math.random() * 1.4,
      speed: 0.25 + Math.random() * 0.25,
      offset: Math.random(),
    });
  }

  let px = 0;
  let py = 0;
  const onMouseMove = (e: MouseEvent) => {
    px = e.clientX / window.innerWidth - 0.5;
    py = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("mousemove", onMouseMove);

  let frameId: number;
  const clock = new THREE.Clock();

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    dancers.forEach((d) => {
      DANCES[Math.min(d.style, DANCES.length - 1)](d, t);
    });

    sparkles.forEach((s) => {
      const p = (t * s.speed + s.offset) % 1;
      s.mesh.position.set(s.baseX * factor, -2.5 + p * 5, 0);
      const m = s.mesh.material as THREE.MeshBasicMaterial;
      m.opacity = Math.sin(p * Math.PI) * 0.85;
      s.mesh.scale.setScalar(1 - p * 0.5);
    });

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px * 1.2, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.4 - py * 0.5, 0.04);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  };
  animate();

  const onResize = () => {
    if (!mount.clientWidth || !mount.clientHeight) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  };
  window.addEventListener("resize", onResize);

  return () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", onResize);
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
    renderer.dispose();
    if (mount.contains(renderer.domElement)) {
      mount.removeChild(renderer.domElement);
    }
  };
}

export default function CartoonDance3D() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanupLeft: (() => void) | undefined;
    let cleanupRight: (() => void) | undefined;
    if (leftRef.current) {
      cleanupLeft = buildSideScene(
        leftRef.current,
        [
          { texture: "/recipient/doreman.png", size: 2.5, x: 0, y: 0.4, style: 0 },
          { texture: "/recipient/sinchan.png", size: 2.1, x: 0, y: -1.6, style: 1 },
        ],
        0x4dd0e1,
      );
    }
    if (rightRef.current) {
      cleanupRight = buildSideScene(
        rightRef.current,
        [
          { texture: "/recipient/doremon1.png", size: 2.5, x: 0, y: 0.4, style: 0 },
          { texture: "/recipient/sinchan1.png", size: 2.1, x: 0, y: -1.6, style: 1 },
        ],
        0xe8375a,
      );
    }
    return () => {
      if (cleanupLeft) cleanupLeft();
      if (cleanupRight) cleanupRight();
    };
  }, []);

  return (
    <>
      <div className="cartoon-side cartoon-side--left">
        <div ref={leftRef} style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="cartoon-side cartoon-side--right">
        <div ref={rightRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </>
  );
}