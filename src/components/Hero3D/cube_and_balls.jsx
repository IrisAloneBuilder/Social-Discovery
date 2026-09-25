import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'

// Corner node positions forming the hypercube frame
const CUBE_POSITIONS = [
  [-1.5, -1.5, -1.5],
  [-1.5, -1.5,  1.5],
  [-1.5,  1.5, -1.5],
  [-1.5,  1.5,  1.5],
  [ 1.5, -1.5, -1.5],
  [ 1.5, -1.5,  1.5],
  [ 1.5,  1.5, -1.5],
  [ 1.5,  1.5,  1.5],
]

// Frame edge connections between outer nodes
const FRAME_EDGES = [
  [0, 1], [0, 2], [0, 4], [1, 3], [1, 5], 
  [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], 
  [5, 7], [6, 7]
]

export function Model(props) {
  const groupRef = useRef()
  const particlesRef = useRef()

  // Slow floating animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.08
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.05
    }
  })

  // Floating background ambient particles
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(80 * 3)
    for (let i = 0; i < 80; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [])

  // Beam lines connecting outer cubes to center and along frame edges
  const lineGeometry = useMemo(() => {
    const points = []
    
    // 1. Outer box frame lines
    FRAME_EDGES.forEach(([sIdx, eIdx]) => {
      points.push(new THREE.Vector3(...CUBE_POSITIONS[sIdx]))
      points.push(new THREE.Vector3(...CUBE_POSITIONS[eIdx]))
    })
    
    // 2. Pyramidal center beam lines (connecting each outer corner to origin)
    CUBE_POSITIONS.forEach((pos) => {
      points.push(new THREE.Vector3(...pos))
      points.push(new THREE.Vector3(0, 0, 0))
    })

    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  return (
    <group {...props} ref={groupRef}>
      {/* Central Node Cube */}
      <group position={[0, 0, 0]}>
        <mesh scale={0.8}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial
            color="#00d8ff"
            transmission={0.85}
            transparent
            opacity={0.8}
            roughness={0.05}
            ior={1.5}
            thickness={0.5}
          />
          <Edges color="#a6f6ff" linewidth={2} />
        </mesh>
        <mesh scale={0.45}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* 8 Translucent Outer Corner Cubes with Glowing Cores */}
      {CUBE_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Glass Outer Shell */}
          <mesh scale={0.7}>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhysicalMaterial
              color="#0088ff"
              transmission={0.88}
              transparent
              opacity={0.75}
              roughness={0.1}
              ior={1.4}
              thickness={0.4}
            />
            <Edges color="#7ee7ff" linewidth={1.5} />
          </mesh>

          {/* Inner Glowing Core */}
          <mesh scale={0.32}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#e0ffff" />
          </mesh>
        </group>
      ))}

      {/* Glowing Connecting Light Beams */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#00e5ff" transparent opacity={0.5} />
      </lineSegments>

      {/* Floating Cyan Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          color="#00ffff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
