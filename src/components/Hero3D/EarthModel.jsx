import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Helper: True spherical linear interpolation for perfect globe-hugging arcs
function slerpVectors(v1, v2, t, out = new THREE.Vector3()) {
  const dot = Math.max(-1, Math.min(1, v1.dot(v2)));
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);

  if (sinOmega < 0.0001) {
    return out.copy(v1).lerp(v2, t);
  }

  const f1 = Math.sin((1 - t) * omega) / sinOmega;
  const f2 = Math.sin(t * omega) / sinOmega;

  return out.set(
    f1 * v1.x + f2 * v2.x,
    f1 * v1.y + f2 * v2.y,
    f1 * v1.z + f2 * v2.z
  );
}

// Helper: Generate a random point on the surface of a sphere
function getRandomPointOnSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

// 3D Connection Arcs styled to match the provided image
function TechArcLine({ start, end }) {
  const { tubeGeometry, v1, v2 } = useMemo(() => {
    const points = [];
    const segments = 40;
    const distance = start.distanceTo(end);
    
    // Calculate arc height based on distance so longer connections sweep higher
    const maxAltitude = 1.0 + (distance * 0.35); 

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = new THREE.Vector3();
      slerpVectors(start, end, t, p);

      // Add parabolic altitude
      const altitude = Math.sin(t * Math.PI) * (maxAltitude - 1.0);
      p.normalize().multiplyScalar(1.0 + altitude);
      points.push(p);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    // Thin, elegant tubes
    const tube = new THREE.TubeGeometry(curve, segments, 0.003, 8, false);

    return { tubeGeometry: tube, v1: points[0], v2: points[points.length - 1] };
  }, [start, end]);

  return (
    <group>
      {/* Sweeping Arc Line */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Origin Node */}
      <mesh position={v1}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Destination Node */}
      <mesh position={v2}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export function Model(props) {
  const globeRef = useRef();
  const [landMask, setLandMask] = useState(null);

  // Safely load the texture without requiring a <Suspense> boundary in the parent
  useEffect(() => {
    new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
      (texture) => {
        texture.anisotropy = 16;
        setLandMask(texture);
      }
    );
  }, []);

  // Generate an array of aesthetically pleasing connection arcs
  const arcs = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 20; i++) {
      const start = getRandomPointOnSphere(1.002);
      let end = getRandomPointOnSphere(1.002);
      
      // Prevent arcs that are too short or go directly through the core
      while (start.distanceTo(end) < 0.6 || start.distanceTo(end) > 1.8) {
        end = getRandomPointOnSphere(1.002);
      }
      lines.push({ start, end });
    }
    return lines;
  }, []);

  // Rotate the entire globe slowly
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group {...props} rotation={[0.2, 0, 0]}>
      <group ref={globeRef}>
        
        {/* 1. Deep Core Sphere (Hides back-faces and gives depth) */}
        <mesh scale={0.99}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial color="#020813" />
        </mesh>

        {/* 2. Geometric Wireframe (Matches the latitude/longitude grid in the image) */}
        <mesh scale={1.005}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial
            color="#225588"
            wireframe
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 3. Crisp, Solid Continents (Uses shader thresholding on the specular map) */}
        {landMask && (
          <mesh scale={1.0}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              uniforms={{
                map: { value: landMask },
                color: { value: new THREE.Color('#00ccff') }, // Vivid Cyan
              }}
              vertexShader={`
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `}
              fragmentShader={`
                uniform sampler2D map;
                uniform vec3 color;
                varying vec2 vUv;
                void main() {
                  // In the specular map, oceans are white (~1.0) and land is black (~0.0).
                  float spec = texture2D(map, vUv).r;
                  float land = 1.0 - spec;
                  
                  // Sharp cutoff creates crisp, solid continents instead of blurry images
                  if (land < 0.5) discard;
                  
                  gl_FragColor = vec4(color, 0.9);
                }
              `}
            />
          </mesh>
        )}

        {/* 4. Sweeping Connection Arcs with glowing nodes */}
        {arcs.map((arc, index) => (
          <TechArcLine key={index} start={arc.start} end={arc.end} />
        ))}

      </group>
    </group>
  );
}
