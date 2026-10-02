import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
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
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0.05, 5.35], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = 0;
        }}
      >
        <Suspense fallback={null}>
          {/*
            Important layout fix:
            The previous version used [2.5, 0, 0] + scale 1.5, which pushed an
            already-large model too far toward the edge of the hero.
          */}
          <EarthModel position={[1.48, 0.08, 0]} scale={1.02} />
        </Suspense>
      </Canvas>
    </div>
  );
}
