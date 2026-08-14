import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  Grid,
  ContactShadows,
  Line,
  Html,
  TransformControls,
} from "@react-three/drei";
import * as THREE from "three";

import muridAsset from "@/assets/murid.glb.asset.json";
import envAsset from "@/assets/environment.glb.asset.json";

export const G = 9.8;

export type SceneObject = "murid" | "environment" | "sasaran";
export type ToolMode = "translate" | "rotate" | "scale";

export type ViewportProps = {
  angle: number;
  velocity: number;
  playing: boolean;
  showTrajectory: boolean;
  showGrid: boolean;
  selected: SceneObject | null;
  tool: ToolMode;
  visible: Record<SceneObject, boolean>;
  resetToken: number;
  onSelect: (o: SceneObject) => void;
  onTick: (s: { t: number; x: number; y: number; vy: number }) => void;
};

const LAUNCH_HEIGHT = 1.35;
const ORIGIN_X = 0.35;

export function flightTime(v: number, angleDeg: number) {
  const vy = v * Math.sin((angleDeg * Math.PI) / 180);
  return (vy + Math.sqrt(vy * vy + 2 * G * LAUNCH_HEIGHT)) / G;
}

function fitObject(root: THREE.Object3D, targetSize: number) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const largest = Math.max(size.x, size.z) || 1;
  const scale = targetSize / largest;
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
}

function Murid({ walking }: { walking: boolean }) {
  const { scene, animations } = useGLTF(muridAsset.url);
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    const idle = names.find((n) => /idle/i.test(n)) ?? names[0];
    const run = names.find((n) => /run|walk/i.test(n)) ?? idle;
    const key = walking ? run : idle;
    const action = key ? actions[key] : undefined;
    action?.reset().fadeIn(0.25).play();
    return () => {
      action?.fadeOut(0.25);
    };
  }, [actions, names, walking]);

  return (
    <group ref={group} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function EnvironmentModel() {
  const { scene } = useGLTF(envAsset.url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cloned.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.receiveShadow = true;
    });
    fitObject(cloned, 46);
    cloned.position.y -= 0.02;
  }, [cloned]);

  return <primitive object={cloned} />;
}

function Sasaran({ distance }: { distance: number }) {
  return (
    <group position={[distance, 0, 0]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 1.5, 12]} />
        <meshStandardMaterial color="#8a8578" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.34, 0.035, 12, 40]} />
        <meshStandardMaterial color="#b4553a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.32, 32]} />
        <meshStandardMaterial color="#f2efe8" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Projectile({
  angle,
  velocity,
  playing,
  resetToken,
  onTick,
}: {
  angle: number;
  velocity: number;
  playing: boolean;
  resetToken: number;
  onTick: ViewportProps["onTick"];
}) {
  const ball = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const acc = useRef(0);

  useEffect(() => {
    t.current = 0;
  }, [resetToken, angle, velocity]);

  useFrame((_, dt) => {
    const total = flightTime(velocity, angle);
    if (playing) t.current += dt;
    if (t.current > total + 0.7) t.current = 0;
    const time = Math.min(t.current, total);
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy0 = velocity * Math.sin(rad);
    const x = ORIGIN_X + vx * time;
    const y = Math.max(0.08, LAUNCH_HEIGHT + vy0 * time - 0.5 * G * time * time);
    ball.current?.position.set(x, y, 0);

    acc.current += dt;
    if (acc.current > 0.08) {
      acc.current = 0;
      onTick({ t: time, x: x - ORIGIN_X, y, vy: vy0 - G * time });
    }
  });

  return (
    <mesh ref={ball} castShadow position={[ORIGIN_X, LAUNCH_HEIGHT, 0]}>
      <sphereGeometry args={[0.085, 24, 24]} />
      <meshStandardMaterial color="#2f3437" roughness={0.45} />
    </mesh>
  );
}

function Selectable({
  id,
  selected,
  tool,
  onSelect,
  children,
}: {
  id: SceneObject;
  selected: boolean;
  tool: ToolMode;
  onSelect: (o: SceneObject) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <>
      <group
        ref={ref}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      >
        {children}
      </group>
      {ready && selected && ref.current ? (
        <TransformControls object={ref.current} mode={tool} size={0.75} />
      ) : null}
    </>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="rounded-sm border border-border bg-card px-3 py-1.5 text-[11px] tracking-wide text-muted-foreground">
        Memuat aset 3D…
      </div>
    </Html>
  );
}

export default function ARViewport(props: ViewportProps) {
  const {
    angle,
    velocity,
    playing,
    showTrajectory,
    showGrid,
    selected,
    tool,
    visible,
    resetToken,
    onSelect,
    onTick,
  } = props;

  const points = useMemo(() => {
    const total = flightTime(velocity, angle);
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    return Array.from({ length: 60 }, (_, i) => {
      const time = (i / 59) * total;
      return new THREE.Vector3(
        ORIGIN_X + vx * time,
        Math.max(0.02, LAUNCH_HEIGHT + vy * time - 0.5 * G * time * time),
        0,
      );
    });
  }, [angle, velocity]);

  const range = points[points.length - 1].x;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [-6, 4.2, 11], fov: 42 }}
      onPointerMissed={() => onSelect(selected ?? "murid")}
    >
      <color attach="background" args={["#e9e7e1"]} />
      <fog attach="fog" args={["#e9e7e1", 34, 78]} />
      <hemisphereLight args={["#ffffff", "#c9c6bd", 1.1]} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Suspense fallback={<Loader />}>
        {visible.environment ? (
          <Selectable id="environment" selected={selected === "environment"} tool={tool} onSelect={onSelect}>
            <EnvironmentModel />
          </Selectable>
        ) : null}

        {visible.murid ? (
          <Selectable id="murid" selected={selected === "murid"} tool={tool} onSelect={onSelect}>
            <Murid walking={playing} />
          </Selectable>
        ) : null}
      </Suspense>

      {visible.sasaran ? (
        <Selectable id="sasaran" selected={selected === "sasaran"} tool={tool} onSelect={onSelect}>
          <Sasaran distance={range} />
        </Selectable>
      ) : null}

      <Projectile
        angle={angle}
        velocity={velocity}
        playing={playing}
        resetToken={resetToken}
        onTick={onTick}
      />

      {showTrajectory ? (
        <Line points={points} color="#b4553a" lineWidth={2} dashed dashSize={0.22} gapSize={0.16} />
      ) : null}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={40} blur={2.4} far={12} />
      {showGrid ? (
        <Grid
          args={[60, 60]}
          cellSize={1}
          cellColor="#c3bfb5"
          sectionSize={5}
          sectionColor="#a8a396"
          fadeDistance={52}
          infiniteGrid
          position={[0, 0.002, 0]}
        />
      ) : null}

      <OrbitControls
        makeDefault
        target={[range / 2, 1, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3}
        maxDistance={45}
        enableDamping
      />
    </Canvas>
  );
}

useGLTF.preload(muridAsset.url);
useGLTF.preload(envAsset.url);