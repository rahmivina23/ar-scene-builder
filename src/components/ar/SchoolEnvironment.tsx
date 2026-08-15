import { useMemo } from "react";
import * as THREE from "three";

/** Low-poly SMA schoolyard built procedurally (matches the reference art style). */

const GRASS = "#5aa845";
const GRASS_DARK = "#468a36";
const ROAD = "#4a4d52";
const KERB = "#c9c9c2";
const WALL = "#eae6dc";
const ROOF = "#3b4a6b";
const TRUNK = "#7a5232";
const LEAF = "#3f9a3a";
const LEAF_2 = "#57b544";

function Tree({
  position,
  scale = 1,
  pine = false,
}: {
  position: [number, number, number];
  scale?: number;
  pine?: boolean;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 1.8, 6]} />
        <meshStandardMaterial color={TRUNK} flatShading roughness={1} />
      </mesh>
      {pine ? (
        <>
          <mesh position={[0, 2.1, 0]} castShadow>
            <coneGeometry args={[1, 2, 7]} />
            <meshStandardMaterial color={LEAF} flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 3.1, 0]} castShadow>
            <coneGeometry args={[0.7, 1.6, 7]} />
            <meshStandardMaterial color={LEAF_2} flatShading roughness={1} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 2.4, 0]} castShadow>
            <icosahedronGeometry args={[1.25, 0]} />
            <meshStandardMaterial color={LEAF} flatShading roughness={1} />
          </mesh>
          <mesh position={[0.7, 1.9, 0.4]} castShadow>
            <icosahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial color={LEAF_2} flatShading roughness={1} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Bush({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <icosahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color={LEAF_2} flatShading roughness={1} />
    </mesh>
  );
}

function SchoolBuilding() {
  const windows = useMemo(() => {
    const list: [number, number][] = [];
    for (let f = 0; f < 2; f++) {
      for (let i = -8; i <= 8; i++) {
        if (Math.abs(i) < 1) continue;
        list.push([i * 1.5, 1.8 + f * 2.6]);
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, 0, -26]}>
      {/* main block */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[28, 6.4, 8]} />
        <meshStandardMaterial color={WALL} flatShading roughness={0.9} />
      </mesh>
      {/* roof */}
      <mesh position={[0, 7, 0]} castShadow>
        <boxGeometry args={[29, 1.2, 9]} />
        <meshStandardMaterial color={ROOF} flatShading roughness={0.8} />
      </mesh>
      {/* central entrance tower */}
      <mesh position={[0, 4.6, 1.4]} castShadow>
        <boxGeometry args={[6, 9.2, 6]} />
        <meshStandardMaterial color={WALL} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 10, 1.4]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4.6, 2.6, 4]} />
        <meshStandardMaterial color={ROOF} flatShading roughness={0.8} />
      </mesh>
      {/* clock */}
      <mesh position={[0, 7.6, 4.45]}>
        <cylinderGeometry args={[0.7, 0.7, 0.12, 16]} />
        <meshStandardMaterial color="#f7f5ef" />
      </mesh>
      {/* door */}
      <mesh position={[0, 1.5, 4.45]}>
        <boxGeometry args={[2.6, 3, 0.2]} />
        <meshStandardMaterial color={ROOF} />
      </mesh>
      {windows.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 4.05]}>
          <boxGeometry args={[0.9, 1.3, 0.15]} />
          <meshStandardMaterial color="#7ba7c9" roughness={0.35} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function Flag() {
  return (
    <group position={[13, 0, -16]}>
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 8, 8]} />
        <meshStandardMaterial color="#d8d8d2" />
      </mesh>
      <mesh position={[0.95, 7.2, 0]}>
        <boxGeometry args={[1.8, 1.2, 0.04]} />
        <meshStandardMaterial color="#d13c3c" />
      </mesh>
      <mesh position={[0.95, 6.6, 0]}>
        <boxGeometry args={[1.8, 1.2, 0.04]} />
        <meshStandardMaterial color="#f5f5f2" />
      </mesh>
    </group>
  );
}

function SchoolSign() {
  return (
    <group position={[-13, 0, 2]}>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 2.8, 0.8]} />
        <meshStandardMaterial color="#b8b6ae" flatShading roughness={1} />
      </mesh>
      <mesh position={[-2.3, 1.5, 0.45]}>
        <boxGeometry args={[1.3, 1.7, 0.12]} />
        <meshStandardMaterial color="#1f3260" />
      </mesh>
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 3.6, 6]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <coneGeometry args={[0.35, 0.7, 4]} />
        <meshStandardMaterial color="#2b2b2b" flatShading />
      </mesh>
    </group>
  );
}

export function SchoolEnvironment() {
  const props = useMemo(() => {
    const trees: { pos: [number, number, number]; s: number; pine: boolean }[] = [];
    for (let i = 0; i < 9; i++) {
      trees.push({ pos: [-9 - (i % 3) * 3.2, 0, -4 - i * 2.4], s: 0.9 + ((i * 7) % 5) / 10, pine: i % 3 === 0 });
      trees.push({ pos: [9 + (i % 3) * 3.2, 0, -4 - i * 2.4], s: 0.9 + ((i * 5) % 5) / 10, pine: i % 2 === 0 });
    }
    const bushes: [number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      bushes.push([-7.6, 0.35, 2 - i * 1.7]);
      bushes.push([7.6, 0.35, 2 - i * 1.7]);
    }
    return { trees, bushes };
  }, []);

  return (
    <group>
      {/* grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={GRASS} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -40]} receiveShadow>
        <planeGeometry args={[160, 60]} />
        <meshStandardMaterial color={GRASS_DARK} roughness={1} />
      </mesh>

      {/* road running away from camera (the throwing lane) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -8]} receiveShadow>
        <planeGeometry args={[13, 60]} />
        <meshStandardMaterial color={ROAD} roughness={1} />
      </mesh>
      {[-6.7, 6.7].map((x) => (
        <mesh key={x} position={[x, 0.06, -8]} receiveShadow>
          <boxGeometry args={[0.6, 0.12, 60]} />
          <meshStandardMaterial color={KERB} roughness={1} />
        </mesh>
      ))}
      {/* distance markers every 5 m */}
      {[5, 10, 15, 20, 25, 30].map((d) => (
        <mesh key={d} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -d]}>
          <planeGeometry args={[11, 0.35]} />
          <meshStandardMaterial color="#e8e8e2" transparent opacity={0.75} />
        </mesh>
      ))}

      <SchoolBuilding />
      <Flag />
      <SchoolSign />
      <Lamp position={[-8.4, 0, -3]} />
      <Lamp position={[8.4, 0, -11]} />
      <Lamp position={[-8.4, 0, -19]} />

      {props.trees.map((t, i) => (
        <Tree key={i} position={t.pos} scale={t.s} pine={t.pine} />
      ))}
      {props.bushes.map((b, i) => (
        <Bush key={i} position={b} />
      ))}

      {/* low-poly clouds */}
      {[
        [-18, 16, -45],
        [12, 19, -55],
        [26, 15, -30],
      ].map((c, i) => (
        <group key={i} position={c as [number, number, number]}>
          <mesh>
            <icosahedronGeometry args={[2.4, 0]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
          <mesh position={[2.4, -0.4, 0.5]}>
            <icosahedronGeometry args={[1.7, 0]} />
            <meshStandardMaterial color="#f6f8fb" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export const ENV_UP = new THREE.Vector3(0, 1, 0);