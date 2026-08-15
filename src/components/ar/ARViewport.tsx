import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { SchoolEnvironment } from "./SchoolEnvironment";
import { StudentAvatar } from "./StudentAvatar";

const G = 9.81;
const LAUNCH_H = 1.35;

export type ShotResult = { range: number; maxH: number; time: number };

export type ViewportProps = {
  angle: number;
  velocity: number;
  running: boolean;
  showTrajectory: boolean;
  targetDistance: number;
  onLanded: (r: ShotResult) => void;
  onTick: (t: number, pos: [number, number, number]) => void;
};

function Projectile({
  angle,
  velocity,
  running,
  onLanded,
  onTick,
}: Pick<ViewportProps, "angle" | "velocity" | "running" | "onLanded" | "onTick">) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const landed = useRef(false);

  useEffect(() => {
    t.current = 0;
    landed.current = false;
    if (ref.current) ref.current.position.set(0, LAUNCH_H, 1.5);
  }, [running, angle, velocity]);

  useFrame((_, delta) => {
    if (!running || landed.current || !ref.current) return;
    t.current += delta;
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const x = vx * t.current;
    const y = LAUNCH_H + vy * t.current - 0.5 * G * t.current * t.current;

    if (y <= 0.05) {
      landed.current = true;
      const tf = (vy + Math.sqrt(vy * vy + 2 * G * LAUNCH_H)) / G;
      onLanded({ range: vx * tf, maxH: LAUNCH_H + (vy * vy) / (2 * G), time: tf });
      ref.current.position.set(0, 0.08, 1.5 - vx * tf);
      ref.current.rotation.set(Math.PI / 2, 0, 0);
      return;
    }
    ref.current.position.set(0, y, 1.5 - x);
    ref.current.rotation.x += delta * 9;
    onTick(t.current, [x, y, 0]);
  });

  return (
    <group ref={ref} position={[0, LAUNCH_H, 1.5]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.06, 0.42, 4, 8]} />
        <meshStandardMaterial color="#c8892f" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.07, 0.18, 8]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function TrajectoryLine({ angle, velocity }: { angle: number; velocity: number }) {
  const points = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const tf = (vy + Math.sqrt(vy * vy + 2 * G * LAUNCH_H)) / G;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 48; i++) {
      const tt = (tf * i) / 48;
      pts.push([0, LAUNCH_H + vy * tt - 0.5 * G * tt * tt, 1.5 - vx * tt]);
    }
    return pts;
  }, [angle, velocity]);

  return <Line points={points} color="#ffd23f" lineWidth={3} dashed dashSize={0.4} gapSize={0.25} />;
}

function TargetRing({ distance, hit }: { distance: number; hit: boolean }) {
  return (
    <group position={[0, 0.05, 1.5 - distance]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.2, 32]} />
        <meshStandardMaterial color={hit ? "#3fbf6a" : "#e2483c"} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.15, 0.4, 24]} />
        <meshStandardMaterial color={hit ? "#3fbf6a" : "#e2483c"} />
      </mesh>
      <Html center position={[0, 1.6, 0]} distanceFactor={22}>
        <div className="hud-tag">{distance.toFixed(1)} m</div>
      </Html>
    </group>
  );
}

function Rig() {
  return (
    <OrbitControls
      makeDefault
      target={[0, 1.6, -9]}
      minDistance={6}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2.15}
      enablePan={false}
    />
  );
}

export function ARViewport(props: ViewportProps) {
  const [hit, setHit] = useState(false);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [8.5, 4.6, 11], fov: 46 }}
      gl={{ antialias: true }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.Fog("#cfe3f5", 45, 130);
      }}
    >
      <Sky sunPosition={[18, 24, -10]} turbidity={4} rayleigh={0.7} />
      <hemisphereLight args={["#cfe6ff", "#5b7a45", 0.85]} />
      <directionalLight
        position={[16, 22, 10]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <Suspense fallback={null}>
        <SchoolEnvironment />
        <StudentAvatar throwing={props.running} />
      </Suspense>

      {props.showTrajectory && <TrajectoryLine angle={props.angle} velocity={props.velocity} />}
      <TargetRing distance={props.targetDistance} hit={hit} />
      <Projectile
        angle={props.angle}
        velocity={props.velocity}
        running={props.running}
        onTick={props.onTick}
        onLanded={(r) => {
          setHit(Math.abs(r.range - props.targetDistance) <= 1.2);
          props.onLanded(r);
        }}
      />

      <Rig />
    </Canvas>
  );
}

