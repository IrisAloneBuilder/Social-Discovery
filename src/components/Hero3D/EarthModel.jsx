import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// GLSL Vertex Shader for the Projector Light Cone
const BEAM_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// GLSL Fragment Shader creating vertical light shafts, horizontal scanlines, and base flare
const BEAM_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // 1. Vertical Light Ray Streaks (Light shafts expanding upward from emitter)
    float ray1 = sin(vUv.x * 3.14159265 * 32.0 + uTime * 0.6);
    float ray2 = sin(vUv.x * 3.14159265 * 64.0 - uTime * 0.3);
    float ray3 = cos(vUv.x * 3.14159265 * 16.0 + uTime * 0.15);
    
    // Combine ray frequencies for volumetric distribution
    float rays = (ray1 * 0.45 + ray2 * 0.3 + ray3 * 0.25);
    rays = smoothstep(-0.2, 0.75, rays);

    // 2. Horizontal Hologram Micro Scanlines & Interference Shimmer
    float scanline = sin(vUv.y * 180.0 - uTime * 4.0) * 0.5 + 0.5;
    scanline = pow(scanline, 1.8) * 0.35 + 0.65;

    // 3. Vertical Volumetric Gradient (Intense beam root flare at base, fading up)
    float baseFlare = pow(1.0 - vUv.y, 3.5) * 2.2;
    float verticalFade = pow(1.0 - vUv.y, 1.15);

    // 4. Edge Softening / Rim Blending across cylinder curvature
    float edge = sin(vUv.x * 3.14159265);
    edge = pow(edge, 0.4);

    // Total beam transparency calculation
    float alpha = (verticalFade * (0.25 + rays * 0.55) + baseFlare) * scanline * edge;

    // Color gradient transition: bright white-cyan core near base to primary beam color
    vec3 brightColor = mix(uColor, vec3(0.88, 0.98, 1.0), baseFlare * 0.45 + 0.15);

    gl_FragColor = vec4(brightColor, clamp(alpha * 0.45, 0.0, 1.0));
  }
`;

// GLSL Shaders for the Base Emitter Star/Cross Flare Lens Effect
const FLARE_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLARE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - vec2(0.5);
    float d = length(p);
    
    // Core glow
    float core = smoothstep(0.22, 0.0, d);
    
    // Primary cross flare rays
    float angle = atan(p.y, p.x);
    float rays1 = pow(abs(cos(angle * 2.0)), 16.0) * smoothstep(0.48, 0.0, d);
    
    // Diagonal subtle secondary rays
    float rays2 = pow(abs(cos(angle * 2.0 + 0.785398)), 32.0) * smoothstep(0.35, 0.0, d) * 0.6;
    
    // Animated subtle flicker
    float flicker = sin(uTime * 6.0) * 0.05 + 0.95;

    float finalGlow = (core * 1.2 + rays1 + rays2) * flicker;
    gl_FragColor = vec4(uColor, clamp(finalGlow * 0.9, 0.0, 1.0));
  }
`;

function pseudoNoise3D(x, y, z) {
  const s1 = Math.sin(x * 3.2 + y * 2.5) * Math.cos(z * 3.2);
  const s2 = Math.sin(x * 6.1 - z * 5.4) * Math.cos(y * 5.5) * 0.5;
  const s3 = Math.sin(y * 11.1 + z * 10.8) * Math.cos(x * 10.5) * 0.25;
  return s1 + s2 + s3;
}

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

function ProjectorMotes({
  count = 100,
  position = [0, -0.09, 0],
  radius = 0.5,
  maxHeight = 2.25,
  speed = 0.28,
  size = 0.017,
  color = '#a8fbff',
}) {
  const pointsRef = useRef();

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const h = Math.random() * maxHeight;
      const progress = h / maxHeight;
      const currentRadius = 0.15 + progress * radius;
      
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * currentRadius;
      
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return geo;
  }, [count, radius, maxHeight]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += delta * speed;

      if (positions[i * 3 + 1] > maxHeight) {
        positions[i * 3 + 1] = 0;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.15;
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 2] = Math.sin(angle) * r;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={position}>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function HologramBase({ position = [0, -1.28, 0], motesProps = {}, tiltRef }) {
  const scanRingRef = useRef();
  const beamMaterialRef = useRef();
  const flareMaterialRef = useRef();
  const beamGroupRef = useRef();
  const flareMeshRef = useRef();
  
  // FIX: Initialize prevTilt reference
  const prevTilt = useRef({ x: 0, y: 0 }); 

  const baseFlareColor = useMemo(() => new THREE.Color('#d8fdff'), []);

  // FIX: Add 'delta' to the useFrame parameters
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    // Calculate velocity of the tilt to dynamically increase beam animation speed
    let speedMultiplier = 1.0;
    if (tiltRef?.current) {
      const dx = tiltRef.current.x - prevTilt.current.x;
      const dy = tiltRef.current.y - prevTilt.current.y;
      
      // Avoid division by zero on frame 1 or during pauses
      const safeDelta = delta > 0 ? delta : 0.016; 
      const velocity = Math.sqrt(dx * dx + dy * dy) / safeDelta;
      
      // Boost speed significantly while the model is actively tilting/moving
      speedMultiplier += velocity * 15.0; 

      prevTilt.current.x = tiltRef.current.x;
      prevTilt.current.y = tiltRef.current.y;
    }
    if (beamMaterialRef.current) {
      beamMaterialRef.current.uniforms.uTime.value = t;
    }

    if (flareMaterialRef.current) {
      flareMaterialRef.current.uniforms.uTime.value = t;
    }

    if (scanRingRef.current) {
      const progress = (t * 0.5) % 1;
      scanRingRef.current.scale.setScalar(0.2 + progress * 0.8);
      scanRingRef.current.material.opacity = (1 - progress) * 0.5;
    }

    // Synchronize light beam leaning angle directly with Earth cursor tilt
    if (beamGroupRef.current && tiltRef?.current) {
      beamGroupRef.current.rotation.x = 0;
      beamGroupRef.current.rotation.y = tiltRef.current.y;
    }

    // Keep flare stationary but scale its size and brightness based on downward cursor tilt
    if (flareMeshRef.current && flareMaterialRef.current && tiltRef?.current) {
      const tiltX = tiltRef.current.x; // positive when mouse moves down
      
      const dynamicScale = THREE.MathUtils.clamp(0.1 + tiltX * 3.0, 0.9, 1.3);
      flareMeshRef.current.scale.setScalar(dynamicScale);

      const brightness = THREE.MathUtils.clamp(0.1 + tiltX * 3.0, 0.9, 1.5);
      flareMaterialRef.current.uniforms.uColor.value.copy(baseFlareColor).multiplyScalar(brightness);
    }
  });

  const beamUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#00e5ff') },
    }),
    []
  );

  const flareUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#d8fdff') }, // Initialize with base flare color
    }),
    []
  );

  return (
    <group position={position}>
      {/* Base Hardware Ring Base (Stationary on pedestal) */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.1, 64]} />
        <meshBasicMaterial color="#020813" />
      </mesh>

      {/* Outer Glow Ring */}
      <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.84, 0.012, 16, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Inner Ring Accent */}
      <mesh position={[0, 0.007, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.008, 16, 64]} />
        <meshBasicMaterial color="#a8fbff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Center Emitter Lens Glass */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 32]} />
        <meshBasicMaterial color="#d8fdff" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Lens Flare at Emitter Origin Point (Now isolated outside the tilting group so it stays flat) */}
      <mesh ref={flareMeshRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 2.2]} />
        <shaderMaterial
          ref={flareMaterialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={flareUniforms}
          vertexShader={FLARE_VERTEX_SHADER}
          fragmentShader={FLARE_FRAGMENT_SHADER}
        />
      </mesh>

      {/* Dynamic Leaning Beam Group pivoting from emitter lens in sync with cursor tilt */}
      <group ref={beamGroupRef} position={[0, 0.015, 0]}>
        {/* Primary Textured Volumetric Light Cone Connecting Base directly to Earth */}
        <mesh position={[0, 0.635, 0]}>
          <cylinderGeometry args={[1.8, 0.18, 1.27, 72, 1, true]} />
          <shaderMaterial
            ref={beamMaterialRef}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            uniforms={beamUniforms}
            vertexShader={BEAM_VERTEX_SHADER}
            fragmentShader={BEAM_FRAGMENT_SHADER}
          />
        </mesh>

        {/* Inner High Density Core Beam */}
        <mesh position={[0, 0.635, 0]}>
          <cylinderGeometry args={[1.2, 0.12, 1.27, 48, 1, true]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            uniforms={beamUniforms}
            vertexShader={BEAM_VERTEX_SHADER}
            fragmentShader={BEAM_FRAGMENT_SHADER}
          />
        </mesh>

        {/* Floating Beam Particles Moving Along Leaning Axis */}
        <ProjectorMotes {...motesProps} />
      </group>
    </group>
  );
}function ScanningBand() {
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
      <torusGeometry args={[1.1, 0.01, 12, 64]} />
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

export function Model({
  earthScale = 1.0,
  earthPosition = [0, 0.3, 0],
  basePosition = [0, -1.28, 0],
  motesProps = {},
  ...props
}) {
  const globeGroupRef = useRef();
  const tiltGroupRef = useRef();
  const tiltRef = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: 0, y: 0 });

  const landGeometry = useMemo(() => generateProceduralLandPoints(11200), []);

  useEffect(() => {
    return () => landGeometry.dispose();
  }, [landGeometry]);

  useEffect(() => {
    const handlePointerMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.12;
    }

    if (tiltGroupRef.current) {
      // Clamped tilt bounds to ensure land points stay perfectly visible without disappearing
      const targetY = THREE.MathUtils.clamp(pointer.current.x * 1.5, -1, 1);
      const targetX = THREE.MathUtils.clamp(-pointer.current.y * 0.5, -1, 1);

      tiltGroupRef.current.rotation.y = THREE.MathUtils.damp(
        tiltGroupRef.current.rotation.y,
        targetY,
        15.0,
        delta
      );
      tiltGroupRef.current.rotation.x = THREE.MathUtils.damp(
        tiltGroupRef.current.rotation.x,
        targetX,
        15.0,
        delta
      );

      // Save tilt values to synchronize the light beam rotation in real-time
      tiltRef.current.x = tiltGroupRef.current.rotation.x;
      tiltRef.current.y = tiltGroupRef.current.rotation.y;
    }
  });

  return (
    <group {...props}>
      {/* Projector Base with Light Beam leaning in sync with Earth movement */}
      <HologramBase position={basePosition} motesProps={motesProps} tiltRef={tiltRef} />

      {/* Floating Earth Globe Group Perfectly Centered Above Base */}
      <group ref={tiltGroupRef} position={earthPosition} scale={earthScale}>
        <group ref={globeGroupRef} rotation={[0.22, 0, 0]}>
          {/* Dark Glass Core */}
          <mesh scale={0.999} renderOrder={1}>
            <sphereGeometry args={[1, 48, 48]} />
            <meshBasicMaterial color="#020612" transparent opacity={0.7} depthWrite={false} />
          </mesh>

          {/* Primary Wireframe Grid */}
          <mesh scale={1.002} renderOrder={2}>
            <sphereGeometry args={[1, 36, 18]} />
            <meshBasicMaterial
              color="#00e5ff"
              wireframe
              transparent
              opacity={0.09}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Fine Secondary Tech Grid */}
          <mesh scale={1.005} renderOrder={3}>
            <sphereGeometry args={[1, 72, 36]} />
            <meshBasicMaterial
              color="#a8fbff"
              wireframe
              transparent
              opacity={0.04}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Procedural Land Dot Matrix with high renderOrder priority so dots stay sharp and visible */}
          <points geometry={landGeometry} scale={1.0199} frustumCulled={false} renderOrder={10}>
            <pointsMaterial
              vertexColors
              size={0.025}
              sizeAttenuation
              transparent
              opacity={0.88}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>

          {/* Sparkle Highlighting Layer */}
          <points geometry={landGeometry} scale={1.026} frustumCulled={false} renderOrder={11}>
            <pointsMaterial
              color="#00e5ff"
              size={0.029}
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

export const EarthModel = Model;
export default Model;

export function StandaloneEarthCanvas() {
  return (
    <div className="w-full h-screen bg-[#030712] flex items-center justify-center overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <Model
          position={[0, 0, 0]}
          earthScale={1.2}
          motesProps={{
            count: 70,
            speed: 0.28,
            radius: 0.5,
            maxHeight: 1.25,
            size: 0.016,
            color: '#a8fbff',
          }}
        />
      </Canvas>
    </div>
  );
}
