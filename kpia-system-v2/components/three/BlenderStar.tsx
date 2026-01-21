"use client";

import { useGLTF, Float } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { modelScale } from "three/tsl";

export function BlenderStar() {
    // モデルの読み込み
    const { scene } = useGLTF("/models/star0002.glb");
    const modelRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!modelRef.current) return;
        // Blenderモデル独自のゆっくりとした回転
        modelRef.current.rotation.y += 0.005;
        modelRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    });

    return (
        <Float speed={0.01} rotationIntensity={0.1} floatIntensity={1}>
            <primitive
                ref={modelRef}
                object={scene}
                scale={15} // 大きさは適宜調整してください
                position={[0, -10, 0]}
            />
        </Float>
    );
}

// プリロード（読み込みを高速化）
useGLTF.preload("/models/star0002.glb");