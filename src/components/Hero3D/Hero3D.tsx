import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// @ts-expect-error - JSX component without TS declarations
import { Model as EarthModel } from "./EarthModel";

export default function Hero3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        position: "relative",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <directionalLight position={[5, 5, 5]} intensity={2.0} />
        <pointLight
          position={[3, 2, 3]}
          intensity={5}
          color="#00ffff"
          distance={10}
        />

        <Suspense fallback={null}>
          <EarthModel position={[2.5, 0, 0]} scale={1.5} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1.0}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
