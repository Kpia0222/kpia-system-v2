"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

// ============================================================================
// WarpEffect - 虹色のガラス反射ワープ演出
// ============================================================================

interface WarpEffectProps {
    active: boolean;
    streakCount?: number;
    targetGalaxyName?: string;
}

/**
 * WarpEffect - JUMP演出用の星ストリークエフェクト
 * 
 * - 100本の虹色ガラス反射ストリーク
 * - MeshPhysicalMaterial: iridescence, transmission, thickness
 * - ナビゲーションテキスト表示
 */
export function WarpEffect({
    active,
    streakCount = 100,
    targetGalaxyName = "TARGET GALAXY"
}: WarpEffectProps) {
    const groupRef = useRef<THREE.Group>(null!);

    // 星ストリーク生成
    const streaks = useMemo(() => {
        return Array.from({ length: streakCount }, (_, i) => ({
            id: i,
            // 円筒座標で配置
            angle: (i / streakCount) * Math.PI * 2 + Math.random() * 0.5,
            radius: 50 + Math.random() * 150,
            length: 20 + Math.random() * 80,
            speed: 0.5 + Math.random() * 1.5,
            offset: Math.random() * 200,
            // 虹色のための色相オフセット
            hue: (i / streakCount) * 360,
        }));
    }, [streakCount]);

    // 虹色ガラスマテリアル
    const material = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setHSL(0, 0.8, 0.7),
            metalness: 0.1,
            roughness: 0,
            transmission: 0.9,
            thickness: 0.5,
            ior: 1.5,
            iridescence: 1.0,
            iridescenceIOR: 1.3,
            iridescenceThicknessRange: [100, 400],
            clearcoat: 1.0,
            clearcoatRoughness: 0,
            envMapIntensity: 2.0,
            transparent: true,
            opacity: 0.9,
        });
    }, []);

    // ストリーク形状 (細長いボックス)
    const geometry = useMemo(() => {
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
    }, []);

    // アニメーション
    useFrame((state, delta) => {
        if (!active || !groupRef.current) return;

        groupRef.current.children.forEach((child, i) => {
            if (child instanceof THREE.Mesh) {
                const streak = streaks[i];
                // Z軸方向に高速移動
                child.position.z -= streak.speed * delta * 500;

                // 画面外に出たらリセット
                if (child.position.z < -300) {
                    child.position.z = streak.offset + 200;
                }

                // 虹色の色相を時間で変化
                const hue = ((streak.hue + state.clock.elapsedTime * 50) % 360) / 360;
                (child.material as THREE.MeshPhysicalMaterial).color.setHSL(hue, 0.8, 0.7);
            }
        });

        // グループ全体を微妙に回転
        groupRef.current.rotation.z += delta * 0.1;
    });

    if (!active) return null;

    return (
        <group ref={groupRef}>
            {/* 星ストリーク群 */}
            {streaks.map((streak) => {
                const x = Math.cos(streak.angle) * streak.radius;
                const y = Math.sin(streak.angle) * streak.radius;
                const z = streak.offset;

                return (
                    <mesh
                        key={streak.id}
                        geometry={geometry}
                        material={material.clone()}
                        position={[x, y, z]}
                        rotation={[Math.PI / 2, 0, 0]}
                        scale={[1, streak.length, 1]}
                    />
                );
            })}

            {/* ナビゲーションテキスト */}
            <Html center position={[0, 0, -100]} style={{ pointerEvents: 'none' }}>
                <div className="text-center font-mono tracking-[0.3em] animate-pulse">
                    <div className="text-[#ff8800] text-xl font-bold mb-2">
                        NAVIGATING TO
                    </div>
                    <div className="text-white text-3xl font-black">
                        {targetGalaxyName}
                    </div>
                    <div className="text-white/50 text-sm mt-4">
                        ▸▸▸ WARP DRIVE ENGAGED ▸▸▸
                    </div>
                </div>
            </Html>

            {/* 中心の光源 */}
            <pointLight position={[0, 0, 0]} intensity={2} color="#ff8800" distance={300} />
        </group>
    );
}
