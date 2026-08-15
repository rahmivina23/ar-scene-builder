import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SHIRT = "#f4f5f7";
const PANTS = "#6c7ba8";
const SKIN = "#e8b892";
const HAIR = "#1d1b1c";
const SHOE = "#232323";
const TIE = "#3c4a70";

/** Low-poly SMA student (white shirt, tie, navy trousers) with idle + throw motion. */
export function StudentAvatar({ throwing }: { throwing: boolean }) {
  const root = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    const idle = Math.sin(t.current * 1.8) * 0.03;
    if (torso.current) torso.current.position.y = idle;
    if (armR.current) {
      const target = throwing ? -2.5 : -0.15 + idle;
      armR.current.rotation.x += (target - armR.current.rotation.x) * Math.min(1, delta * 9);
    }
    if (armL.current) armL.current.rotation.x = 0.15 - idle;
    if (root.current) root.current.rotation.y = throwing ? 0.1 : 0;
  });

  return (
    <group ref={root} position={[0, 0, 1.5]}>
      <group ref={torso}>
        {/* legs */}
        <mesh position={[-0.16, 0.42, 0]} castShadow>
          <boxGeometry args={[0.22, 0.84, 0.24]} />
          <meshStandardMaterial color={PANTS} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0.16, 0.42, 0]} castShadow>
          <boxGeometry args={[0.22, 0.84, 0.24]} />
          <meshStandardMaterial color={PANTS} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[-0.16, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.24, 0.12, 0.36]} />
          <meshStandardMaterial color={SHOE} flatShading />
        </mesh>
        <mesh position={[0.16, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.24, 0.12, 0.36]} />
          <meshStandardMaterial color={SHOE} flatShading />
        </mesh>

        {/* shirt */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.5, 0.72, 0.28]} />
          <meshStandardMaterial color={SHIRT} flatShading roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.16, -0.15]}>
          <boxGeometry args={[0.1, 0.44, 0.02]} />
          <meshStandardMaterial color={TIE} flatShading />
        </mesh>

        {/* arms */}
        <group ref={armL} position={[-0.31, 1.42, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.14, 0.62, 0.16]} />
            <meshStandardMaterial color={SHIRT} flatShading />
          </mesh>
          <mesh position={[0, -0.68, 0]} castShadow>
            <boxGeometry args={[0.13, 0.2, 0.15]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
        </group>
        <group ref={armR} position={[0.31, 1.42, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.14, 0.62, 0.16]} />
            <meshStandardMaterial color={SHIRT} flatShading />
          </mesh>
          <mesh position={[0, -0.68, 0]} castShadow>
            <boxGeometry args={[0.13, 0.2, 0.15]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
        </group>

        {/* head */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[0.16, 0.14, 0.16]} />
          <meshStandardMaterial color={SKIN} flatShading />
        </mesh>
        <mesh position={[0, 1.82, 0]} castShadow>
          <boxGeometry args={[0.34, 0.36, 0.32]} />
          <meshStandardMaterial color={SKIN} flatShading />
        </mesh>
        <mesh position={[0, 2.02, 0]} castShadow>
          <boxGeometry args={[0.37, 0.16, 0.35]} />
          <meshStandardMaterial color={HAIR} flatShading />
        </mesh>
        <mesh position={[0, 1.86, -0.18]} castShadow>
          <boxGeometry args={[0.36, 0.28, 0.03]} />
          <meshStandardMaterial color={HAIR} flatShading />
        </mesh>
      </group>
    </group>
  );
}