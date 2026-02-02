"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { OBSERVER_BEACON_SETTINGS } from "@/config/environment-settings";

// ============================================================================
// ObserverBeacon - 共同探索ビーコン
// ============================================================================

interface ObserverBeaconProps {
    /** ビーコン設置者のdisplayId */
    userId: string;
    /** 設置者からのメッセージ */
    message?: string;
    /** 3D空間での位置 */
    position: [number, number, number];
    /** ビーコンの色 (省略時は設定ファイルのデフォルト) */
    color?: string;
    /** クリック時のコールバック */
    onClick?: () => void;
}

const { geometry, material, light, animation } = OBSERVER_BEACON_SETTINGS;

/**
 * ObserverBeacon - 他人の宇宙に配置されたメッセージを表示する発光クリスタル
 * 
 * 特徴:
 * - 発光するクリスタル形状
 * - ホバー時にメッセージ表示
 * - パルスアニメーション
 */
export function ObserverBeacon({
    userId,
    message = "Greetings from another universe...",
    position,
    color = material.defaultColor,
    onClick,
}: ObserverBeaconProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const glowRef = useRef<THREE.Mesh>(null!);
    const [isHovered, setIsHovered] = useState(false);

    // アニメーション
    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;

        // 浮遊アニメーション
        meshRef.current.position.y = position[1] + Math.sin(time * animation.floatSpeed) * animation.floatAmplitude;

        // 回転
        meshRef.current.rotation.y += animation.rotationSpeed;

        // グローのパルス
        if (glowRef.current) {
            const pulse = 0.8 + Math.sin(time * animation.pulseSpeed) * animation.pulseAmplitude;
            glowRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group position={position}>
            {/* グロー (外側の発光) */}
            <mesh ref={glowRef} scale={geometry.glowScale}>
                <octahedronGeometry args={[geometry.glowSize, 0]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={material.glowOpacity}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* メインクリスタル */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setIsHovered(true)}
                onPointerLeave={() => setIsHovered(false)}
                onClick={onClick}
            >
                <octahedronGeometry args={[geometry.size, 0]} />
                <meshPhysicalMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isHovered ? material.emissiveIntensityHover : material.emissiveIntensity}
                    metalness={material.metalness}
                    roughness={material.roughness}
                    transmission={material.transmission}
                    thickness={material.thickness}
                    iridescence={material.iridescence}
                    iridescenceIOR={material.iridescenceIOR}
                    transparent
                    opacity={material.opacity}
                />
            </mesh>

            {/* 中心の光源 */}
            <pointLight
                color={color}
                intensity={isHovered ? light.intensityHover : light.intensity}
                distance={light.distance}
            />

            {/* ホバー時のメッセージ表示 */}
            {isHovered && (
                <Html center position={[0, 3, 0]} style={{ pointerEvents: 'none' }}>
                    <div className="bg-black/80 backdrop-blur-md border border-[#ff8800]/50 px-4 py-3 rounded min-w-[200px]">
                        <div className="font-mono text-xs text-[#ff8800] tracking-widest mb-2">
                            OBSERVER // {userId}
                        </div>
                        <div className="font-mono text-sm text-white/90">
                            "{message}"
                        </div>
                        <div className="h-[1px] w-full bg-[#ff8800]/30 mt-2" />
                        <div className="font-mono text-[10px] text-white/50 mt-1 tracking-wider">
                            CLICK TO INTERACT
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

/**
 * BeaconCluster - 複数のビーコンをまとめて表示
 */
interface BeaconData {
    id: string;
    userId: string;
    message: string;
    position: [number, number, number];
    color?: string;
}

export function BeaconCluster({ beacons }: { beacons: BeaconData[] }) {
    return (
        <group>
            {beacons.map((beacon) => (
                <ObserverBeacon
                    key={beacon.id}
                    userId={beacon.userId}
                    message={beacon.message}
                    position={beacon.position}
                    color={beacon.color}
                />
            ))}
        </group>
    );
}

