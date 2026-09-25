import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Model } from './cube_and_balls';

export default function Hero3D() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at 75% 50%, #0f2b48 0%, #030914 70%)' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        {/* Adjusted point light position back to the right */}
        <pointLight position={[3, 0, 0]} intensity={12} color="#00ffff" distance={6} />
        <directionalLight position={[5, 8, 5]} color="#00e5ff" intensity={3} />
        <directionalLight position={[-5, -5, -2]} color="#0044ff" intensity={2} />

        {/* Model shifted RIGHT with positive X coordinate */}
        <Model scale={0.85} position={[2.5, 0, 0]} />

        <Environment preset="city" />
        {/* Center the camera rotation pivot on the new right-side position */}
        <OrbitControls target={[0, 0, 0]} enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
