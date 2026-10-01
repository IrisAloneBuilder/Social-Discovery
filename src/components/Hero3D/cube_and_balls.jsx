import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

function PlexusMesh({ geometry, position, scale, rotation }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Wireframe lines */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#0066ff"
          wireframe
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Vertex nodes */}
      <points geometry={geometry}>
        <pointsMaterial
          size={0.05}
          color="#00ffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function Model(props) {
  const hologramRef = useRef();
  const particlesRef = useRef();

  const headGeo = useMemo(() => new THREE.IcosahedronGeometry(0.9, 2), []);
  const visorGeo = useMemo(() => new THREE.BoxGeometry(1.2, 0.5, 0.8, 4, 2, 2), []);
  const neckGeo = useMemo(() => new THREE.CylinderGeometry(0.4, 0.6, 0.8, 12, 3, true), []);
  const shouldersGeo = useMemo(() => new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.5), []);

  const particleCount = 180;
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (hologramRef.current) {
      hologramRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      hologramRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 - 0.3;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += delta * (0.8 + Math.random() * 0.4);
        positions[i * 3 + 1] += delta * 0.15;

        if (positions[i * 3] > 2.5) {
          positions[i * 3] = Math.random() * 1.2 - 1.5;
          positions[i * 3 + 1] = Math.random() * 2.5 - 1;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group {...props}>
      {/* Sci-Fi Projector Base */}
      <group position={[0, -2.0, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.1, 32]} />
          <meshStandardMaterial color="#050a12" metalness={0.9} roughness={0.2} />
          <Edges color="#00ffff" linewidth={1} transparent opacity={0.4} />
        </mesh>

        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Upward Projection Cone */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[1.8, 0.2, 2.8, 32, 1, true]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Hologram Mesh */}
      <group ref={hologramRef} position={[0, 0.1, 0]}>
        <PlexusMesh geometry={headGeo} position={[0, 0.8, 0]} />
        <PlexusMesh geometry={visorGeo} position={[0, 0.8, 0.7]} />
        <PlexusMesh geometry={neckGeo} position={[0, -0.2, 0]} />
        <PlexusMesh geometry={shouldersGeo} position={[0, -0.6, 0]} />

        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color="#00ffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </group>
  );
}
