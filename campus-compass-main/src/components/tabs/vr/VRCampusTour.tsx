import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Campus, Building } from '@/data/campusData';
import { latLngToWorld, getBuildingHeight } from '@/utils/spatialMath';

interface VRCampusTourProps {
  campus: Campus;
  onSelectBuilding: (building: Building) => void;
  onExit: () => void;
}

const CATEGORY_COLORS: Record<string, number> = {
  academic: 0x00D2FF,
  residential: 0x7B2FFF,
  facility: 0xFFB830,
  recreation: 0x00FF88,
};

const VRCampusTour = ({ campus, onSelectBuilding, onExit }: VRCampusTourProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pointerRef = useRef({ isDown: false, x: 0, y: 0, moved: false });
  const orbitRef = useRef({ theta: 0, phi: 0.6, radius: 80 });

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020510);
    scene.fog = new THREE.FogExp2(0x020510, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 500);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x040815, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(300, 60, 0x00D2FF, 0x00D2FF);
    (grid.material as THREE.Material).opacity = 0.06;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // Lighting
    scene.add(new THREE.AmbientLight(0x112244, 0.8));
    const cyanLight = new THREE.DirectionalLight(0x00D2FF, 1.5);
    cyanLight.position.set(50, 80, 30);
    cyanLight.castShadow = true;
    cyanLight.shadow.mapSize.set(1024, 1024);
    scene.add(cyanLight);
    const violetLight = new THREE.PointLight(0x7B2FFF, 0.8, 200);
    violetLight.position.set(-40, 5, -40);
    scene.add(violetLight);

    // Build campus from coordinates (READ ONLY)
    const buildingMeshes: THREE.Mesh[] = [];
    campus.buildings.forEach(building => {
      const { x, z } = latLngToWorld(building.lat, building.lng, campus.center, 0.5);
      const height = getBuildingHeight(building.floors ?? 1);
      const color = CATEGORY_COLORS[building.category] ?? 0x00D2FF;

      // Building box
      const geo = new THREE.BoxGeometry(8, height, 8);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.15,
        roughness: 0.4,
        metalness: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, height / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { building };
      scene.add(mesh);
      buildingMeshes.push(mesh);

      // Base ring
      const ringGeo = new THREE.RingGeometry(4.5, 5.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.05, z);
      scene.add(ring);

      // Label sprite
      const canvas2d = document.createElement('canvas');
      canvas2d.width = 256; canvas2d.height = 128;
      const ctx = canvas2d.getContext('2d')!;
      ctx.fillStyle = 'rgba(4,8,21,0.8)';
      ctx.beginPath();
      ctx.roundRect(0, 0, 256, 128, 16);
      ctx.fill();
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.fillText(building.icon, 128, 55);
      ctx.font = 'bold 18px Orbitron, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(building.name.substring(0, 14), 128, 100);
      const texture = new THREE.CanvasTexture(canvas2d);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(16, 8, 1);
      sprite.position.set(x, height + 8, z);
      scene.add(sprite);
    });

    setIsLoading(false);

    // Orbit camera
    const updateCamera = () => {
      const { theta, phi, radius } = orbitRef.current;
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    // Pointer events
    const onPointerDown = (e: PointerEvent) => {
      pointerRef.current = { isDown: true, x: e.clientX, y: e.clientY, moved: false };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointerRef.current.isDown) return;
      const dx = e.clientX - pointerRef.current.x;
      const dy = e.clientY - pointerRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pointerRef.current.moved = true;
      orbitRef.current.theta -= dx * 0.005;
      orbitRef.current.phi = Math.max(0.2, Math.min(1.4, orbitRef.current.phi + dy * 0.005));
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      updateCamera();
    };
    const onPointerUp = () => { pointerRef.current.isDown = false; };
    const onWheel = (e: WheelEvent) => {
      orbitRef.current.radius = Math.max(20, Math.min(200, orbitRef.current.radius + e.deltaY * 0.05));
      updateCamera();
    };

    const raycaster = new THREE.Raycaster();
    const onClick = (e: MouseEvent) => {
      if (pointerRef.current.moved) return;
      const rect = mount.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(buildingMeshes, false);
      if (hits.length > 0) {
        const building = hits[0].object.userData.building as Building;
        onSelectBuilding(building);
      }
    };

    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('wheel', onWheel);
    mount.addEventListener('click', onClick);

    // Animate
    let animId: number;
    let time = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.visibilityState !== 'visible') return;
      time += 0.016;
      buildingMeshes.forEach(mesh => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.1 + Math.sin(time * 1.5 + mesh.position.x) * 0.08;
      });
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const W2 = mount.clientWidth;
      const H2 = mount.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [campus, onSelectBuilding]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/80">
          <div className="font-ui text-xs text-text-3 tracking-widest animate-pulse">
            BUILDING CAMPUS...
          </div>
        </div>
      )}
      <div ref={mountRef} className="w-full h-full" />

      {/* VR Enter button */}
      <VREnterButton />

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 font-ui text-[9px] text-text-3 tracking-wider pointer-events-none">
        DRAG TO ORBIT · SCROLL TO ZOOM · CLICK BUILDING FOR INFO
      </div>

      {/* Legend */}
      <VRLegend />

      {/* Exit */}
      <button onClick={onExit} className="absolute top-4 left-4 glass-card px-4 py-2 font-ui text-xs text-text-2 hover:text-primary transition-all z-50">
        ← EXIT VR
      </button>
    </div>
  );
};

const VRLegend = () => (
  <div className="absolute top-4 right-4 glass-card p-3 space-y-2 z-50">
    <div className="font-ui text-[9px] tracking-widest text-text-3">LEGEND</div>
    {[
      { label: 'Academic', color: '#00D2FF' },
      { label: 'Residential', color: '#7B2FFF' },
      { label: 'Facility', color: '#FFB830' },
      { label: 'Recreation', color: '#00FF88' },
    ].map(({ label, color }) => (
      <div key={label} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
        <span className="font-body text-[10px] text-text-2">{label}</span>
      </div>
    ))}
  </div>
);

const VREnterButton = () => {
  const [xrSupported, setXrSupported] = useState(false);
  useEffect(() => {
    (navigator as any).xr?.isSessionSupported('immersive-vr').then((s: boolean) => setXrSupported(s)).catch(() => {});
  }, []);
  if (!xrSupported) return null;
  return (
    <button className="absolute bottom-16 right-4 glass-card px-5 py-3 font-ui text-xs tracking-wider border-secondary/40 text-secondary hover:bg-secondary/10 hover:-translate-y-0.5 transition-all z-50">
      🥽 ENTER VR HEADSET
    </button>
  );
};

export default VRCampusTour;
