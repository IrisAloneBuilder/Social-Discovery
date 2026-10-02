import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Balanced multi-frequency noise to distribute continents 
 * evenly across all 360 degrees (eliminates giant empty ocean gaps).
 */
function pseudoNoise3D(x, y, z) {
  const s1 = Math.sin(x * 3.2 + y * 2.5) * Math.cos(z * 3.2);
  const s2 = Math.sin(x * 6.1 - z * 5.4) * Math.cos(y * 5.5) * 0.5;
  const s3 = Math.sin(y * 11.1 + z * 10.8) * Math.cos(x * 10.5) * 0.25;
  return s1 + s2 + s3;
}

/**
 * Generates point cloud geometry for earth continents evenly around the sphere.
 */
function generateProceduralLandPoints(count = 11000) {
  const positions = [];
  const colors = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  const colorCyan = new THREE.Color('#00e5ff');
  const colorBright = new THREE.Color('#d8fdff');

  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    const noiseValue = pseudoNoise3D(x, y, z);

    // Keep land points distributed across all longitudes
    if (noiseValue > -0.1) {
      positions.push(x, y, z);

      const intensity = 0.6 + Math.random() * 0.4;
      const c = noiseValue > 0.3 ? colorBright : colorCyan;
      colors.push(c.r * intensity, c.g * intensity, c.b * intensity);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function ProjectorMotes({ count = 60 }) {
  const pointsRef = useRef();

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 1] = Math.random() * 1.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += delta * 0.25;
      if (positions[i * 3 + 1] > 1.3) {
        positions[i * 3 + 1] = 0;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, -1.25, 0]}>
      <pointsMaterial
        color="#a8fbff"
        size={0.016}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    
    </points>
  );
}

function HologramBase() {
  const scanRingRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (scanRingRef.current) {
      const progress = (t * 0.5) % 1;
      scanRingRef.current.scale.setScalar(0.2 + progress * 0.8);
      scanRingRef.current.material.opacity = (1 - progress) * 0.5;
    }
  });

  return (
    <group position={[0, -1.28, 0]}>
      {/* Dark Base Puck */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.1, 64]} />
        <meshBasicMaterial color="#020813" />
      </mesh>

      {/* Outer Cyan Ring */}
      <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.84, 0.012, 16, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Inner Ice Blue Ring */}
      <mesh position={[0, 0.007, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.008, 16, 64]} />
        <meshBasicMaterial color="#a8fbff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Center Lens */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 32]} />
        <meshBasicMaterial color="#d8fdff" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Light Cone with Bottom-to-Top Fade */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[1.8, 0.18, 1.3, 70, 1, true]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uColor: { value: new THREE.Color('#00e5ff') },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uColor;
            varying vec2 vUv;
            void main() {
              float fade = pow(1.0 - vUv.y, 1.8);
              gl_FragColor = vec4(uColor, fade * 0.15);
            }
          `}
        />
      </mesh>

      {/* Expanding Ring Pulse */}
      <mesh ref={scanRingRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.008, 12, 64]} />
        <meshBasicMaterial color="#a8fbff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      <ProjectorMotes />
    </group>
  );
}

function ScanningBand() {
  const bandRef = useRef();

  useFrame((state) => {
    if (!bandRef.current) return;
    const t = state.clock.getElapsedTime();
    const y = Math.sin(t * 0.8) * 0.85;
    const r = Math.sqrt(Math.max(0.05, 1 - y * y)) * 1.015;

    bandRef.current.position.y = y;
    bandRef.current.scale.set(r, 1, r);
    bandRef.current.material.opacity = 0.2 + (Math.sin(t * 3) * 0.5 + 0.5) * 0.25;
  });

  return (
    <mesh ref={bandRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1, 0.01, 12, 64]} />
      <meshBasicMaterial
        color="#a8fbff"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Main 3D Holographic Model component designed to be rendered directly inside a <Canvas>.
 */
export function Model(props) {
  const globeGroupRef = useRef();
  const tiltGroupRef = useRef();
  const pointer = useRef({ x: 0, y: 0 });

  const landGeometry = useMemo(() => generateProceduralLandPoints(11000), []);

  useEffect(() => {
    return () => landGeometry.dispose();
  }, [landGeometry]);

  // Smooth pointer tracking for interactive tilt
  useEffect(() => {
    const handlePointerMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((_, delta) => {
    // Continuous axial spin
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.12;
    }

    // Parallax tilt towards cursor
    if (tiltGroupRef.current) {
      tiltGroupRef.current.rotation.y = THREE.MathUtils.damp(
        tiltGroupRef.current.rotation.y,
        pointer.current.x * 0.22,
        3.0,
        delta
      );
      tiltGroupRef.current.rotation.x = THREE.MathUtils.damp(
        tiltGroupRef.current.rotation.x,
        -pointer.current.y * 0.1,
        3.0,
        delta
      );
    }
  });

  return (
    <group {...props}>
      {/* Projector Base */}
      <HologramBase />

      {/* Floating Interactive Globe Group */}
      <group ref={tiltGroupRef}position={[0, 0.3, 0]}i>
        {/* Soft Outer Glow Rim */}
        <mesh scale={1.08}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.035}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <group ref={globeGroupRef} rotation={[0.22, 0, 0]}>
          {/* Dark Glass Core */}
          <mesh scale={0.985}>
            <sphereGeometry args={[1, 48, 48]} />
            <meshBasicMaterial color="#020612" transparent opacity={0.7} depthWrite={false} />
          </mesh>

          {/* Primary Wireframe Grid */}
          <mesh scale={1.002}>
            <sphereGeometry args={[1, 36, 18]} />
            <meshBasicMaterial
              color="#000000"
              wireframe
              transparent
              opacity={0.16}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Fine Secondary Tech Grid */}
          <mesh scale={1.005}>
            <sphereGeometry args={[1, 72, 36]} />
            <meshBasicMaterial
              color="#ffffff"
              wireframe
              transparent
              opacity={0.04}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Procedural Land Dot Matrix */}
          <points geometry={landGeometry} scale={1.0199} frustumCulled={false}>
            <pointsMaterial
              vertexColors
              size={0.012}
              sizeAttenuation
              transparent
              opacity={0.88}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>

          {/* Sparkle Highlighting Layer */}
          <points geometry={landGeometry} scale={1.026} frustumCulled={false}>
            <pointsMaterial
              color="#ffffff"
              size={0.005}
              sizeAttenuation
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>

          {/* Laser Scan Band */}
          <ScanningBand />
        </group>
      </group>
    </group>
  );
}

// Export aliases
export const EarthModel = Model;
export default Model;

/**
 * Standalone container with Canvas included for quick direct viewing.
 */
export function StandaloneEarthCanvas() {
  return (
    <div className="w-full h-screen bg-[#030712] flex items-center justify-center overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <Model position={[0, 0, 0]} scale={2.2} />
      </Canvas>
    </div>
  );
}
