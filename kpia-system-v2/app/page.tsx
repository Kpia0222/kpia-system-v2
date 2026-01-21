"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

// 既存の要素：12平均律の檻（ワイヤーフレーム）
function PrototypeCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x -= delta * 0.1;
      meshRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[4, 0]} /> {/* 少し大きくして外枠にする */}
      <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.2} />
    </mesh>
  );
}

// 新しい要素：Blender製の星
import { BlenderStar } from "@/components/three/BlenderStar";

export default function Home() {
  return (
    <main className="h-screen w-full bg-black">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#000']} />
        <Environment preset="night" />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />

        {/* 1. 過去の秩序（ワイヤーフレーム） */}
        <PrototypeCore />

        {/* 2. 新しい生命（Blenderモデル）: ロード待ちのためにSuspenseで囲む */}
        <Suspense fallback={null}>
          <BlenderStar />
        </Suspense>

        {/* 3. 大量の粒子（あなたが感動したチュートリアルの要素） */}
        <Sparkles count={4000} scale={200} size={2} speed={0.3} color="#ff8800" />

        <EffectComposer>
          {/* <Bloom intensity={0.01} luminanceThreshold={0.01} mipmapBlur /> */}
          <Noise opacity={0.05} />
        </EffectComposer>

        <OrbitControls enableZoom={true} />
      </Canvas>

      <div className="absolute bottom-8 right-8 text-white/30 font-mono text-[10px] tracking-[0.5em] pointer-events-none">
        KPIA SYSTEM v2.2.0 [HYBRID_EVOLUTION]
      </div>
    </main>
  );
}